import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { useLogout } from 'entities/auth/model/hooks/useAuth';
import Button from 'shared/ui/Button/Button';
import KoreanIconLogo from 'shared/assets/KoreanIconLogo.svg';
import * as S from './Header.styled';

const NAV_ITEMS = [
  { label: '공고', path: '/jobposts' },
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const { mutate: logoutMutate } = useLogout();

  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);

  const notiRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notiRef.current && !notiRef.current.contains(e.target as Node)) {
        setIsNotiOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <S.HeaderWrapper>
      <S.HeaderInner>
        {/* 왼쪽: 로고 + 네비게이션 */}
        <S.LeftSection>
          <S.LogoLink onClick={() => navigate('/')}>
            <S.LogoImg src={KoreanIconLogo} alt="잇다 로고" />
          </S.LogoLink>

          <S.Nav>
            {NAV_ITEMS.map(({ label, path }) => (
              <S.NavItem
                key={path}
                $active={location.pathname.startsWith(path)}
                onClick={() => navigate(path)}
              >
                {label}
              </S.NavItem>
            ))}
          </S.Nav>
        </S.LeftSection>

        {/* 오른쪽: 공고 생성 + 알림 + 유저 */}
        <S.RightSection>
          <Button
            scheme="primary"
            buttonSize="small"
            fontSize='xsmall'
            borderRadius="medium"
            onClick={() => navigate('/jobpost/create')}
          >
            + 공고 등록
          </Button>

          {/* 알림 드롭다운 */}
          <S.DropdownWrapper ref={notiRef}>
            <S.IconButton
              onClick={() => {
                setIsNotiOpen((prev) => !prev);
                setIsUserOpen(false);
              }}
              aria-label="알림"
            >
              <Bell size={20} />
            </S.IconButton>

            {isNotiOpen && (
              <S.DropdownMenu>
                <S.EmptyMessage>새로운 알림이 없습니다.</S.EmptyMessage>
              </S.DropdownMenu>
            )}
          </S.DropdownWrapper>

          {/* 유저 드롭다운 */}
          <S.DropdownWrapper ref={userRef}>
            <S.IconButton
              onClick={() => {
                setIsUserOpen((prev) => !prev);
                setIsNotiOpen(false);
              }}
              aria-label="사용자 메뉴"
            >
              <User size={20} />
            </S.IconButton>

            {isUserOpen && (
              <S.DropdownMenu>
                {isLoggedIn ? (
                  <>
                    <S.DropdownItem onClick={() => { navigate('/mypage'); setIsUserOpen(false); }}>
                      회원 정보
                    </S.DropdownItem>
                    <S.DropdownDivider />
                    <S.DropdownItem onClick={() => { logoutMutate(); setIsUserOpen(false); }}>
                      로그아웃
                    </S.DropdownItem>
                  </>
                ) : (
                  <>
                    <S.DropdownItem onClick={() => { navigate('/login'); setIsUserOpen(false); }}>
                      로그인
                    </S.DropdownItem>
                    <S.DropdownItem onClick={() => { navigate('/signup'); setIsUserOpen(false); }}>
                      회원가입
                    </S.DropdownItem>
                  </>
                )}
              </S.DropdownMenu>
            )}
          </S.DropdownWrapper>
        </S.RightSection>
      </S.HeaderInner>
    </S.HeaderWrapper>
  );
};

export default Header;
