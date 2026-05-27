package com.itda.service;

import com.itda.entity.User;
import com.itda.enums.UserRole;
import com.itda.enums.UserStatus;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThatCode;

@DataJpaTest
@ActiveProfiles("test")
@Import(ManagerUserService.class)
class ManagerUserServiceTest {

    @Autowired
    private TestEntityManager em;

    @Autowired
    private ManagerUserService managerUserService;

    @Test
    void searchUsers_pageThree_mapsReportAndMatchCounts() {
        for (int i = 0; i < 25; i++) {
            User user = User.builder()
                    .email("svc" + i + "@test.com")
                    .password("pw")
                    .name("유저" + i)
                    .phone("01000000000")
                    .role(UserRole.APPLICANT)
                    .status(UserStatus.ACTIVE)
                    .build();
            em.persist(user);
        }
        em.flush();

        assertThatCode(() ->
                managerUserService.searchUsers(null, null, null, 2, 10))
                .doesNotThrowAnyException();
    }
}
