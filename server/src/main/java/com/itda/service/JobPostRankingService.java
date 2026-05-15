package com.itda.service;

import com.itda.config.RankingProperties;
import com.itda.dto.response.CursorPageResponse;
import com.itda.dto.response.JobPostCardResponse;
import com.itda.entity.Application;
import com.itda.entity.Career;
import com.itda.entity.JobPost;
import com.itda.entity.Resume;
import com.itda.entity.User;
import com.itda.enums.ApplicationStatus;
import com.itda.enums.WageType;
import com.itda.repository.ApplicationRepository;
import com.itda.repository.CareerRepository;
import com.itda.repository.JobPostLikeRepository;
import com.itda.repository.JobPostRepository;
import com.itda.repository.ResumeLikeRepository;
import com.itda.repository.ResumeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 구직자(APPLICANT) 개인화 공고 랭킹 서비스.
 *
 * 호출 조건: sortType="RECOMMENDED" 이고 인증된 사용자가 APPLICANT 일 때.
 * 다른 케이스(비로그인, EMPLOYER 등)에서는 호출하지 않는다 — 호출자가 분기 처리.
 *
 * 시그널 (가중치 합 100점, APPLIED/PENDING −10점 감점):
 *   1. 지역 근접           최대 30  user.location ↔ workplace.address 단계 매칭
 *   2. 업종 카테고리 일치   20      Career.jobTitle / Application 이력 최빈 카테고리
 *   3. 근무 일정 가용       15      HIRED 일정과 겹치지 않으면 15
 *   4. 급여 수준           최대 15  동일 카테고리 백분위 (상위 25%=15, 25~50=10, 50~75=5)
 *   5. 마감 임박/신선도    10      D-day ≤ 7일 또는 등록 24h 이내
 *   6. 좋아요한 사업장      5       JobPostLike → employer 또는 ResumeLike 역방향
 *   7. 과거 HIRED 사업장   5       같은 employer 재고용 가능성
 *
 * 정책:
 *   - HIRED 공고는 SQL 단계에서 후보에서 제외
 *   - APPLIED/PENDING 공고는 점수에서 −10
 *   - 태그 필터 무시, 전체 OPEN 공고에서 추천
 *   - 커서는 offset 의미로 해석 (정렬 키가 동적 점수라 id 커서 불가)
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class JobPostRankingService {

    private final JobPostRepository jobPostRepository;
    private final JobPostLikeRepository jobPostLikeRepository;
    private final ResumeRepository resumeRepository;
    private final ResumeLikeRepository resumeLikeRepository;
    private final CareerRepository careerRepository;
    private final ApplicationRepository applicationRepository;

    // 가중치는 application.yml(ranking.weights) 에서 주입.
    // 운영 중 튜닝 시 yaml 또는 환경변수만 수정하고 재기동하면 된다.
    private final RankingProperties weights;

    // 임계값/환산 상수는 본 작업 범위상 코드에 유지.
    // (운영 정책으로 변동될 만한 값이 아니라는 판단)
    private static final int FRESHNESS_DEADLINE_DAYS = 7;
    private static final int FRESHNESS_NEW_HOURS     = 24;

    // 시급으로 정규화할 때 사용하는 환산값
    private static final double HOURS_PER_DAY   = 8.0;
    private static final double HOURS_PER_MONTH = 209.0; // 주 40h × 4.345주 + α


    public CursorPageResponse<JobPostCardResponse> recommend(User user, Long cursor, int size) {
        int offset = (cursor != null && cursor > 0) ? cursor.intValue() : 0;

        // 1) 사용자 특성 스냅샷 한 번만 로드
        UserSnapshot snap = loadSnapshot(user);

        // 2) HIRED 공고 제외한 OPEN 후보 풀
        List<Long> excludeIds = snap.hiredPostIds().isEmpty()
                ? null
                : new ArrayList<>(snap.hiredPostIds());
        List<JobPost> candidates = jobPostRepository.findOpenPostsExcluding(excludeIds);

        if (candidates.isEmpty()) {
            return CursorPageResponse.of(List.of(), null, false);
        }

        // 3) 카테고리별 시급 분포 (급여 백분위 계산용)
        Map<String, List<Double>> wagesByCategory = buildWageDistribution(candidates);

        // 4) 채점
        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();
        List<Scored> scored = new ArrayList<>(candidates.size());
        for (JobPost post : candidates) {
            int score = scoreOne(post, snap, wagesByCategory, today, now);
            scored.add(new Scored(post, score));
        }

        // 5) 정렬 — score DESC, id DESC tiebreak (안정 정렬)
        scored.sort(Comparator
                .comparingInt(Scored::score).reversed()
                .thenComparing(s -> s.post().getId(), Comparator.reverseOrder()));

        // 6) 페이지 슬라이스 — fetch size+1 로 hasNext 판단
        int fetchEnd = Math.min(scored.size(), offset + size + 1);
        if (offset >= scored.size()) {
            return CursorPageResponse.of(List.of(), null, false);
        }
        List<Scored> page = scored.subList(offset, fetchEnd);

        boolean hasNext = page.size() > size;
        if (hasNext) {
            page = page.subList(0, size);
        }

        // 7) DTO 변환 (liked 표시는 사용자 자신의 JobPostLike 셋 사용)
        List<JobPostCardResponse> cards = page.stream()
                .map(s -> JobPostCardResponse.from(
                        s.post(), snap.likedPostIds().contains(s.post().getId())))
                .toList();

        Long nextCursor = hasNext ? (long) (offset + cards.size()) : null;
        return CursorPageResponse.of(cards, nextCursor, hasNext);
    }


    // ─── 점수 계산 ───────────────────────────────────────

    private int scoreOne(JobPost post,
                         UserSnapshot snap,
                         Map<String, List<Double>> wagesByCategory,
                         LocalDate today,
                         LocalDateTime now) {
        int score = 0;

        score += locationScore(snap.location(), post.getWorkplace().getAddress());
        score += categoryScore(snap.topCategory(), post.getJobCategory());
        score += scheduleScore(snap.hiredWorkDates(), post.getWorkDate());
        score += wageScore(post, wagesByCategory);
        score += freshnessScore(post.getDeadline(), post.getCreatedAt(), today, now);

        Long employerUserId = post.getWorkplace().getEmployer().getUser().getId();
        if (snap.likedEmployerIds().contains(employerUserId)) score += weights.likedEmployer();
        if (snap.hiredEmployerIds().contains(employerUserId)) score += weights.hiredEmployer();

        if (snap.appliedOrPendingPostIds().contains(post.getId())) score -= weights.appliedPenalty();

        return score;
    }


    /**
     * 지역 일치 단계 점수. 주소 토큰을 앞에서부터 비교해 연속 일치 깊이만큼
     * weights.locationPerLevel 만큼 누적. 도/시 = 1단계, 시군구 = 2단계, 동 = 3단계.
     */
    int locationScore(String userLocation, String postAddress) {
        if (userLocation == null || postAddress == null) return 0;
        String[] u = userLocation.trim().split("\\s+");
        String[] p = postAddress.trim().split("\\s+");

        int matched = 0;
        int limit = Math.min(3, Math.min(u.length, p.length));
        for (int i = 0; i < limit; i++) {
            if (u[i].equals(p[i])) matched++;
            else break;
        }
        return matched * weights.locationPerLevel();
    }

    int categoryScore(String topCategory, String postCategory) {
        if (topCategory == null || postCategory == null) return 0;
        return topCategory.equals(postCategory) ? weights.categoryMatch() : 0;
    }

    int scheduleScore(Set<LocalDate> hiredWorkDates, LocalDate postDate) {
        if (postDate == null) return 0;
        return hiredWorkDates.contains(postDate) ? 0 : weights.scheduleAvailable();
    }

    int wageScore(JobPost post, Map<String, List<Double>> wagesByCategory) {
        String cat = post.getJobCategory();
        if (cat == null) return 0;
        List<Double> bucket = wagesByCategory.get(cat);
        if (bucket == null || bucket.size() < 2) return 0; // 비교 표본 부족 시 0

        double thisHourly = normalizeToHourly(post.getWage(), post.getWageType());
        long below = bucket.stream().filter(w -> w < thisHourly).count();
        double percentile = (double) below / bucket.size();

        RankingProperties.WageTier tier = weights.wageTier();
        if (percentile >= 0.75) return tier.top25();
        if (percentile >= 0.50) return tier.mid5075();
        if (percentile >= 0.25) return tier.mid2550();
        return 0;
    }

    int freshnessScore(LocalDate deadline, LocalDateTime createdAt,
                       LocalDate today, LocalDateTime now) {
        if (deadline != null) {
            long days = ChronoUnit.DAYS.between(today, deadline);
            if (days >= 0 && days <= FRESHNESS_DEADLINE_DAYS) return weights.freshness();
        }
        if (createdAt != null) {
            long hours = ChronoUnit.HOURS.between(createdAt, now);
            if (hours >= 0 && hours <= FRESHNESS_NEW_HOURS) return weights.freshness();
        }
        return 0;
    }


    // ─── 사용자 특성 스냅샷 로딩 ──────────────────────────

    private UserSnapshot loadSnapshot(User user) {
        Long userId = user.getId();

        // 지원 이력 모두 한번에 (HIRED 제외/APPLIED·PENDING 감점 모두에서 사용)
        List<Application> allApps = applicationRepository.findByApplicantUserId(userId);

        Set<Long> hiredPostIds = new HashSet<>();
        Set<Long> appliedOrPendingPostIds = new HashSet<>();
        Set<LocalDate> hiredWorkDates = new HashSet<>();
        Set<Long> hiredEmployerIds = new HashSet<>();
        Map<String, Integer> appCategoryFreq = new HashMap<>();

        for (Application a : allApps) {
            ApplicationStatus s = a.getStatus();
            JobPost p = a.getJobPost();

            if (s == ApplicationStatus.HIRED) {
                hiredPostIds.add(p.getId());
                if (p.getWorkDate() != null) hiredWorkDates.add(p.getWorkDate());
                Long empUserId = p.getWorkplace().getEmployer().getUser().getId();
                hiredEmployerIds.add(empUserId);
            }
            if (s == ApplicationStatus.APPLIED || s == ApplicationStatus.PENDING) {
                appliedOrPendingPostIds.add(p.getId());
            }
            // 카테고리 빈도 — APPLIED/PENDING/HIRED 모두 카운트
            if (s == ApplicationStatus.APPLIED
                    || s == ApplicationStatus.PENDING
                    || s == ApplicationStatus.HIRED) {
                String c = p.getJobCategory();
                if (c != null) appCategoryFreq.merge(c, 1, Integer::sum);
            }
        }

        // Career 이력의 jobTitle 에서 카테고리 추정해 빈도에 합산
        Resume resume = resumeRepository.findByUserId(userId).orElse(null);
        if (resume != null) {
            List<Career> careers = careerRepository.findByResumeId(resume.getId());
            for (Career c : careers) {
                String cat = inferCategoryFromJobTitle(c.getJobTitle());
                if (cat != null) appCategoryFreq.merge(cat, 1, Integer::sum);
            }
        }
        String topCategory = appCategoryFreq.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(null);

        // 좋아요한 employer (양방향)
        Set<Long> likedEmployerIds = new HashSet<>();
        Set<Long> likedPostIds = new HashSet<>();
        jobPostLikeRepository.findByUserId(userId).forEach(like -> {
            likedPostIds.add(like.getJobPost().getId());
            likedEmployerIds.add(like.getJobPost().getWorkplace().getEmployer().getUser().getId());
        });
        if (resume != null) {
            resumeLikeRepository.findByResumeId(resume.getId())
                    .forEach(rl -> likedEmployerIds.add(rl.getEmployerUser().getId()));
        }

        return new UserSnapshot(
                user.getLocation(),
                topCategory,
                hiredWorkDates,
                hiredEmployerIds,
                likedEmployerIds,
                likedPostIds,
                appliedOrPendingPostIds,
                hiredPostIds
        );
    }


    // ─── helpers ─────────────────────────────────────────

    private static double normalizeToHourly(Integer wage, WageType type) {
        if (wage == null) return 0.0;
        if (type == null) return wage; // 안전 fallback
        return switch (type) {
            case HOURLY  -> wage;
            case DAILY   -> wage / HOURS_PER_DAY;
            case MONTHLY -> wage / HOURS_PER_MONTH;
        };
    }

    private static Map<String, List<Double>> buildWageDistribution(List<JobPost> posts) {
        Map<String, List<Double>> byCat = new HashMap<>();
        for (JobPost p : posts) {
            String cat = p.getJobCategory();
            if (cat == null) continue;
            double h = normalizeToHourly(p.getWage(), p.getWageType());
            byCat.computeIfAbsent(cat, k -> new ArrayList<>()).add(h);
        }
        return byCat;
    }

    /**
     * Career.jobTitle 문자열에서 업종 카테고리를 단순 키워드 매칭으로 추정.
     * filterOptions 의 카테고리 enum 값과 매칭. 향후 jobCategory 필드를 Career 에 직접 두면 제거.
     */
    static String inferCategoryFromJobTitle(String jobTitle) {
        if (jobTitle == null || jobTitle.isBlank()) return null;
        String t = jobTitle.toLowerCase();
        if (t.contains("호텔")) return "HOTEL";
        if (t.contains("물류") || t.contains("운반") || t.contains("배송") || t.contains("창고")) return "LOGISTICS";
        if (t.contains("건설") || t.contains("건축") || t.contains("현장") || t.contains("인부")) return "CONSTRUCTION";
        if (t.contains("음식") || t.contains("주방") || t.contains("서빙") || t.contains("식당") || t.contains("카페")) return "RESTAURANT";
        if (t.contains("행사") || t.contains("이벤트") || t.contains("부스")) return "EVENT";
        if (t.contains("유통") || t.contains("판매") || t.contains("매장") || t.contains("계산")) return "RETAIL";
        return null;
    }


    // ─── 내부 자료구조 ───────────────────────────────────

    /** 채점 결과 한 줄. */
    private record Scored(JobPost post, int score) {}

    /**
     * 한 요청에서 재사용하는 사용자 특성 스냅샷.
     * 후보가 N개 있어도 이 스냅샷은 한 번만 만든다.
     */
    private record UserSnapshot(
            String location,
            String topCategory,
            Set<LocalDate> hiredWorkDates,
            Set<Long> hiredEmployerIds,
            Set<Long> likedEmployerIds,
            Set<Long> likedPostIds,
            Set<Long> appliedOrPendingPostIds,
            Set<Long> hiredPostIds
    ) {}
}
