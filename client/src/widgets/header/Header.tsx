import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Bell, User } from 'lucide-react';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { useLogout } from 'entities/auth/model/hooks/useAuth';
import { useNotificationStore } from 'entities/notification/model/store/notificationStore';
import { fetchMockNotifications } from 'entities/notification/api/notification.mock.api';
import { NotificationDropdown } from 'widgets/notification/NotificationDropdown';
import Button from 'shared/ui/Button/Button';
import Modal, { ModalContent } from 'shared/ui/Modal/Modal';
import KoreanIconLogo from 'shared/assets/KoreanIconLogo.svg';
import * as S from './Header.styled';


const NAV_ITEMS = [
  { label: '공고', path: '/jobposts' },
  { label: '인재 찾기', path: '/resumes' },
  { label: '작업 관리', path: '/dashboard' }
];

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const role = useAuthStore((s) => s.role);
  const { mutate: logoutMutate } = useLogout();

  const [isNotiOpen, setIsNotiOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const notifications = useNotificationStore((s) => s.notifications);
  const setNotifications = useNotificationStore((s) => s.setNotifications);
  const unreadCount = useNotificationStore((s) => s.unreadCount);

  const notiRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // 알림 데이터 초기 로드
  useEffect(() => {
    if (notifications.length === 0) {
      fetchMockNotifications().then(setNotifications);
    }
  }, [notifications.length, setNotifications]);

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
    <>
      <S.HeaderWrapper>
        <S.HeaderInner>
          {/* 왼쪽: 로고 + 네비게이션 */}
          <S.LeftSection>
            <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
              <S.LogoImg src={KoreanIconLogo} alt="잇다 로고" />
            </Link>

            <S.Nav>
              {NAV_ITEMS.map(({ label, path }) => (
                <S.NavLink
                  key={path}
                  to={path}
                  $active={location.pathname.startsWith(path)}
                  onClick={(e) => {
                    if (path === '/dashboard' && !isLoggedIn) {
                      e.preventDefault();
                      setIsLoginModalOpen(true);
                    }
                  }}
                >
                  {label}
                </S.NavLink>
              ))}
            </S.Nav>
          </S.LeftSection>

          {/* 오른쪽: 공고 생성 + 알림 + 유저 */}
          <S.RightSection>
            <S.CreateLink
              to="/jobpost/create"
              onClick={(e) => {
                if (!isLoggedIn || role !== 'EMPLOYER') {
                  e.preventDefault();
                  setIsRoleModalOpen(true);
                }
              }}
            >
              <Button
                scheme="primary"
                buttonSize="small"
                fontSize='xsmall'
                borderRadius="medium"
              >
                + 공고 등록
              </Button>
            </S.CreateLink>

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
                {unreadCount() > 0 && <S.NotiBadge>{unreadCount()}</S.NotiBadge>}
              </S.IconButton>

              {isNotiOpen && (
                <NotificationDropdown onClose={() => setIsNotiOpen(false)} />
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

      {/* 고용주 전용 모달 */}
      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => setIsRoleModalOpen(false)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => {
                setIsRoleModalOpen(false);
                navigate('/login');
              }}
            >
              로그인하기
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>권한이 필요합니다</h2>
          <p>공고 등록은 고용주 회원만 가능합니다.<br />고용주 계정으로 로그인해주세요.</p>
        </ModalContent>
      </Modal>

      {/* 로그인 유도 모달 (작업 관리) */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        actions={
          <>
            <Button
              scheme="secondary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => setIsLoginModalOpen(false)}
            >
              취소
            </Button>
            <Button
              scheme="primary"
              buttonSize="large"
              borderRadius="medium"
              onClick={() => {
                setIsLoginModalOpen(false);
                navigate('/login');
              }}
            >
              로그인하기
            </Button>
          </>
        }
      >
        <ModalContent>
          <h2>로그인이 필요합니다</h2>
          <p>작업 관리는 로그인 후 이용할 수 있습니다.</p>
        </ModalContent>
      </Modal>
    </>
  );
};


export default Header;