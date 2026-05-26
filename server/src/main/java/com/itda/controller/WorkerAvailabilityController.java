package com.itda.controller;

import com.itda.dto.request.WorkerAvailabilityCreateRequest;
import com.itda.dto.request.WorkerAvailabilityUpdateRequest;
import com.itda.dto.response.WorkerAvailabilityResponse;
import com.itda.entity.User;
import com.itda.service.WorkerAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

/**
 * 구직자 가용시간 API.
 *
 * <p>인증은 {@code SecurityConfig} 의 {@code anyRequest().authenticated()} 정책으로 처리.
 * APPLICANT 역할 검증은 {@link WorkerAvailabilityService} 진입부에서 수행한다.
 */
@RestController
@RequestMapping("/api/v1/worker/availability")
@RequiredArgsConstructor
public class WorkerAvailabilityController {

    private final WorkerAvailabilityService availabilityService;

    /**
     * 가용시간 슬롯 등록.
     * 자정 넘김(endAt 의 날짜 &gt; startAt 의 날짜)은 서비스에서 자동 분할 저장된다.
     *
     * @return 201 Created + 생성된 그룹 DTO
     */
    @PostMapping
    public ResponseEntity<WorkerAvailabilityResponse> create(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody WorkerAvailabilityCreateRequest req) {
        WorkerAvailabilityResponse response = availabilityService.create(user, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * 가용시간 슬롯 수정 (전체 교체).
     * {@code id} 는 그룹 내 어느 레코드 ID 든 무방 — 그룹 전체가 교체된다.
     *
     * @return 200 OK + 새 그룹 DTO
     */
    @PutMapping("/{id}")
    public ResponseEntity<WorkerAvailabilityResponse> update(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody WorkerAvailabilityUpdateRequest req) {
        WorkerAvailabilityResponse response = availabilityService.update(user, id, req);
        return ResponseEntity.ok(response);
    }

    /**
     * 가용시간 슬롯 삭제 (그룹 전체).
     * {@code id} 는 그룹 내 어느 레코드 ID 든 무방 — 그룹 전체가 삭제된다.
     *
     * @return 204 No Content
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        availabilityService.delete(user, id);
        return ResponseEntity.noContent().build();
    }

    /**
     * 날짜 범위 내 가용시간 슬롯 목록 조회.
     * 자정 분할 그룹이 범위 경계에 걸려 있어도 그룹 전체를 포함한다.
     *
     * @param fromDate 조회 시작 날짜 (yyyy-MM-dd, 포함)
     * @param toDate   조회 종료 날짜 (yyyy-MM-dd, 포함)
     * @return 200 OK + availStartAt 오름차순 슬롯 목록
     */
    @GetMapping
    public ResponseEntity<List<WorkerAvailabilityResponse>> getRange(
            @AuthenticationPrincipal User user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate) {
        List<WorkerAvailabilityResponse> response = availabilityService.getRange(user, fromDate, toDate);
        return ResponseEntity.ok(response);
    }
}
