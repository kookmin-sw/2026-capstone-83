import { Inbox } from 'lucide-react';
import styled, { useTheme } from 'styled-components';
// import LogoIcon from 'shared/assets/LogoIcon.svg';

interface Props {
  message?: string;
  icon?: React.ReactNode;
}

const Empty = ({ message = '데이터가 없습니다.', icon }: Props) => {

  const theme = useTheme();

  return (
    <EmptyWrapper>
      <IconWrapper>
        {/* <LogoImage src={LogoIcon} alt="잇다 로고" /> */}
        {icon ?? <Inbox size={48} strokeWidth={1.2} color={theme.color.primary} />}
      </IconWrapper>
      <Message>{message}</Message>
    </EmptyWrapper>
  );
};


// export const LogoImage = styled.img`
//   width: 60px;
//   height: auto;
// `;

const EmptyWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  gap: 16px;
  width: 100%;
`;

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.color.subText};
`;

const Message = styled.p`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.color.subText};
  text-align: center;
  line-height: 1.5;
`;

export default Empty;
