import { Camera } from 'lucide-react';
import styled from 'styled-components';
import { useUpdateProfileImage } from 'entities/user/model/hooks/useUserProfile';
import { useImageUpload } from 'features/control-Image/hooks/useImageUpload';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  profileImageUrl?: string | null;
  name: string;
}

export const ProfileImageUpload = ({ profileImageUrl, name }: Props) => {
  const { mutate: uploadImage, isPending } = useUpdateProfileImage();

  const { fileInputRef, handleFileChange, triggerUpload } = useImageUpload((file) => {
    if (file) uploadImage(file);
  });

  const avatarSrc =
    profileImageUrl || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;

  return (
    <S.Wrapper>
      <S.AvatarWrap>
        <S.AvatarImage>
          {isPending ? (
            <S.AvatarLoading>
              <Loading message="" />
            </S.AvatarLoading>
          ) : (
            <img src={avatarSrc} alt={`${name} 프로필`} />
          )}
        </S.AvatarImage>
        <S.UploadButton
          type="button"
          onClick={triggerUpload}
          disabled={isPending}
          aria-label="프로필 사진 변경"
        >
          <Camera size={16} />
        </S.UploadButton>
      </S.AvatarWrap>
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      {/* <S.Hint>프로필 사진을 변경할 수 있습니다.</S.Hint> */}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding-bottom: 8px;
  `,
  AvatarWrap: styled.div`
    position: relative;
    width: 96px;
    height: 96px;
    flex-shrink: 0;
  `,
  AvatarImage: styled.div`
    width: 100%;
    height: 100%;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid ${({ theme }) => theme.color.secondary};
    background: ${({ theme }) => theme.color.background};

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  `,
  AvatarLoading: styled.div`
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
  UploadButton: styled.button`
    position: absolute;
    right: 2px;
    bottom: 2px;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    padding: 0;
    border: 2px solid ${({ theme }) => theme.color.white};
    border-radius: 50%;
    background: ${({ theme }) => theme.color.primary};
    color: ${({ theme }) => theme.color.white};
    cursor: pointer;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    svg {
      stroke: ${({ theme }) => theme.color.white};
    }
  `,
  Hint: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
};
