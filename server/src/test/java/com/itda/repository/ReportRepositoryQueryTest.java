package com.itda.repository;

import com.itda.entity.Report;
import com.itda.entity.User;
import com.itda.enums.ReportReason;
import com.itda.enums.ReportStatus;
import com.itda.enums.UserRole;
import com.itda.enums.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

@DataJpaTest
@ActiveProfiles("test")
class ReportRepositoryQueryTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private ReportRepository reportRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void countByTargetId_usesTargetUserForeignKey() {
        User reporter = persistUser("reporter@test.com", "신고자");
        User target = persistUser("target@test.com", "피신고");
        Report report = Report.builder()
                .reporter(reporter)
                .target(target)
                .reason(ReportReason.OTHER)
                .status(ReportStatus.PENDING)
                .build();
        em.persist(report);
        em.flush();

        assertThatCode(() -> reportRepository.countByTargetId(target.getId()))
                .doesNotThrowAnyException();
        assertThat(reportRepository.countByTargetId(target.getId())).isEqualTo(1);
    }

    @Test
    void searchUsers_withKeyword_doesNotFail() {
        persistUser("hong@test.com", "홍길동");
        em.flush();

        assertThatCode(() ->
                userRepository.searchUsers("홍", null, null, PageRequest.of(0, 10)))
                .doesNotThrowAnyException();
    }

    @Test
    void searchUsers_loadsUserWhenGenderColumnIsEmptyString() {
        em.getEntityManager()
                .createNativeQuery(
                        "INSERT INTO users (email, password, name, phone, role, status, gender, created_at) "
                                + "VALUES ('blank-gender@test.com', 'x', '빈성별', '010', 'APPLICANT', 'ACTIVE', '', CURRENT_TIMESTAMP)")
                .executeUpdate();
        em.flush();
        em.clear();

        assertThatCode(() ->
                userRepository.searchUsers(null, null, null, PageRequest.of(0, 10)))
                .doesNotThrowAnyException();
        User loaded = userRepository.findByEmail("blank-gender@test.com").orElseThrow();
        assertThat(loaded.getGender()).isNull();
    }

    @Test
    void searchUsers_pageThree_doesNotFail() {
        for (int i = 0; i < 25; i++) {
            persistUser("user" + i + "@test.com", "유저" + i);
        }
        em.flush();

        assertThatCode(() ->
                userRepository.searchUsers(null, null, null, PageRequest.of(2, 10)))
                .doesNotThrowAnyException();
        assertThat(userRepository.searchUsers(null, null, null, PageRequest.of(2, 10)).getContent())
                .hasSize(5);
    }

    private User persistUser(String email, String name) {
        User user = User.builder()
                .email(email)
                .password("pw")
                .name(name)
                .phone("01000000000")
                .role(UserRole.APPLICANT)
                .status(UserStatus.ACTIVE)
                .build();
        em.persist(user);
        return user;
    }
}
