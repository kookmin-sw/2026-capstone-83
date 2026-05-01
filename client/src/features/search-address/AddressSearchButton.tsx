// features/location/ui/AddressSearchFeature.tsx
import { useKakaoPostcodePopup } from 'react-daum-postcode';
import Button from 'shared/ui/Button/Button';

interface Props {
  onAddressSelect: (address: string) => void;
}

export const AddressSearchButton = ({ onAddressSelect }: Props) => {
  // 다음 주소창 팝업 스크립트 로드 (공식 라이브러리 사용 권장)
  const scriptUrl = 'https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js';
  const open = useKakaoPostcodePopup(scriptUrl);

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = '';

    if (data.addressType === 'R') {
      if (data.bname !== '') extraAddress += data.bname;
      if (data.buildingName !== '') extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
      fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
    }

    onAddressSelect(fullAddress); // 부모(폼)에게 선택된 주소 전달
  };

  const handleClick = () => {
    open({ onComplete: handleComplete });
  };

  return (
    <Button
      type="button"
      scheme="secondary"
      buttonSize="smallMedium"
      onClick={handleClick}
    >
      주소 찾기
    </Button>
  );
};