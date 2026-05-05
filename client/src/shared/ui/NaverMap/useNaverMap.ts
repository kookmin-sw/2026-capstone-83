import { useEffect, useRef, useState } from 'react';

const NAVER_MAP_SCRIPT_ID = 'naver-map-script';

/**
 * naver.maps.Service(geocoder 서브모듈)까지 완전히 로드되었는지 확인
 */
const isNaverMapsReady = () =>
  !!(window.naver && window.naver.maps && window.naver.maps.Service);

/**
 * 네이버 지도 스크립트를 동적으로 로드하고,
 * 주소를 좌표로 변환(geocode)하여 지도에 마커를 표시합니다.
 */
export const useNaverMap = (address: string) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. 스크립트 로드
  useEffect(() => {
    const clientId = import.meta.env.VITE_NAVER_MAP_CLIENT_ID;

    if (!clientId) {
      setError('네이버 지도 API 키가 설정되지 않았습니다.');
      return;
    }

    // 이미 완전히 로드된 경우
    if (isNaverMapsReady()) {
      setIsLoaded(true);
      return;
    }

    // 스크립트 태그가 이미 있거나 새로 추가한 뒤, Service까지 준비될 때까지 폴링
    const waitForReady = () => {
      const checkInterval = setInterval(() => {
        if (isNaverMapsReady()) {
          setIsLoaded(true);
          clearInterval(checkInterval);
        }
      }, 100);

      // 10초 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!isNaverMapsReady()) {
          setError('네이버 지도 로드 시간이 초과되었습니다.');
        }
      }, 10000);
    };

    if (document.getElementById(NAVER_MAP_SCRIPT_ID)) {
      // 이미 스크립트 태그가 삽입되어 로딩 중
      waitForReady();
      return;
    }

    const script = document.createElement('script');
    script.id = NAVER_MAP_SCRIPT_ID;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${clientId}&submodules=geocoder`;
    script.async = true;

    script.onload = () => {
      // 메인 스크립트는 로드됐지만 서브모듈(geocoder)은 비동기로 추가 로드됨
      waitForReady();
    };

    script.onerror = () => {
      setError('네이버 지도 스크립트 로드에 실패했습니다.');
    };

    document.head.appendChild(script);
  }, []);

  // 2. 지도 초기화 + 주소 → 좌표 변환
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !address) return;

    const { naver } = window;

    naver.maps.Service.geocode({ query: address }, (status: number, response: any) => {
      if (status !== naver.maps.Service.Status.OK || !response.v2.addresses.length) {
        // geocode 실패 시 기본 좌표(서울시청)로 표시
        initMap(new naver.maps.LatLng(37.5665, 126.978));
        return;
      }

      const result = response.v2.addresses[0];
      const point = new naver.maps.LatLng(Number(result.y), Number(result.x));
      initMap(point);
    });

    function initMap(center: any) {
      const map = new naver.maps.Map(mapRef.current!, {
        center,
        zoom: 16,
        zoomControl: true,
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      });

      new naver.maps.Marker({
        position: center,
        map,
      });
    }
  }, [isLoaded, address]);

  return { mapRef, isLoaded, error };
};
