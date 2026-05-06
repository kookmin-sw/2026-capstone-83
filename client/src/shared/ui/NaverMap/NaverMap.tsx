import styled from 'styled-components';
import { useNaverMap } from './useNaverMap';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  address: string;
  height?: string;
}

const NaverMap = ({ address, height = '300px' }: Props) => {
  const { mapRef, isLoaded, error } = useNaverMap(address);

  if (error) {
    return (
      <MapFallback $height={height}>
        <p>{error}</p>
      </MapFallback>
    );
  }

  return (
    <MapContainer $height={height}>
      {!isLoaded && <Loading message="지도를 불러오는 중..." />}
      <MapElement ref={mapRef} $visible={isLoaded} />
    </MapContainer>
  );
};

const MapContainer = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.color.border};
  position: relative;
`;

const MapElement = styled.div<{ $visible: boolean }>`
  width: 100%;
  height: 100%;
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 0.3s ease;
`;

const MapFallback = styled.div<{ $height: string }>`
  width: 100%;
  height: ${({ $height }) => $height};
  background: #f4f4f4;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.color.subText};
  font-size: ${({ theme }) => theme.fontSize.small};
  border: 1px solid ${({ theme }) => theme.color.border};
`;

export default NaverMap;
