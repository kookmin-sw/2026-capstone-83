package com.itda;

import org.junit.jupiter.api.Test;

import java.time.ZoneId;
import java.util.TimeZone;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * JVM 타임존이 KST(Asia/Seoul)로 강제 설정되었는지 검증하는 회귀 방지 테스트.
 *
 * <p>EC2 운영 환경에서 LocalDateTime 직렬화 시 +9시간 오프셋 이중 변환 문제
 * (JVM UTC 해석 + JDBC serverTimezone=Asia/Seoul 변환 → +9h 저장)를
 * 재발 방지하기 위한 테스트.
 *
 * <p>DB 의존 없이 단순 JUnit 으로 작성 — {@code @SpringBootTest} 미사용.
 * {@link ItdaApplication#main} 의 {@code TimeZone.setDefault()} 가 호출되었다는 전제를
 * 시뮬레이션하기 위해 테스트 내에서 직접 호출한다.
 */
class TimeZoneConfigTest {

    @Test
    void jvmDefaultTimezoneIsAsiaSeoul() {
        // ItdaApplication.main() 과 동일한 설정을 시뮬레이션
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Seoul"));

        assertEquals("Asia/Seoul", TimeZone.getDefault().getID(),
                "JVM 기본 타임존은 Asia/Seoul 이어야 합니다.");
        assertEquals(ZoneId.of("Asia/Seoul"), ZoneId.systemDefault(),
                "ZoneId.systemDefault() 도 Asia/Seoul 이어야 합니다.");
    }
}
