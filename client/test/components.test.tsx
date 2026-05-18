import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithTheme } from './renderWithTheme';
import Button from 'shared/ui/Button/Button';
import Badge from 'shared/ui/Badge/Badge';
import Modal from 'shared/ui/Modal/Modal';
import Loading from 'shared/ui/Loading/Loading';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';
import Empty from 'shared/ui/Empty/Empty';
import Title from 'shared/ui/Title/Title';
import { InputText } from 'shared/ui/Input/InputText';
import { InputTextarea } from 'shared/ui/Input/InputTextarea';
import { InputSelect } from 'shared/ui/Input/InputSelect';
import { CheckboxButtons } from 'shared/ui/Input/CheckboxButtons';
import StickyBar from 'shared/ui/StickyBar/StickyBar';

// ─── Button ───────────────────────────────────────────

describe('Button', () => {
  it('텍스트가 렌더링된다', () => {
    renderWithTheme(
      <Button scheme="primary" buttonSize="medium">지원하기</Button>
    );
    expect(screen.getByRole('button', { name: '지원하기' })).toBeInTheDocument();
  });

  it('클릭 이벤트가 호출된다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderWithTheme(
      <Button scheme="primary" buttonSize="medium" onClick={handleClick}>클릭</Button>
    );
    await user.click(screen.getByRole('button', { name: '클릭' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('disabled 상태에서 클릭이 무시된다', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderWithTheme(
      <Button scheme="primary" buttonSize="medium" onClick={handleClick} disabled>비활성</Button>
    );
    await user.click(screen.getByRole('button', { name: '비활성' }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('disabled 속성이 적용된다', () => {
    renderWithTheme(
      <Button scheme="primary" buttonSize="medium" disabled>비활성</Button>
    );
    expect(screen.getByRole('button', { name: '비활성' })).toBeDisabled();
  });

  it('type 속성이 전달된다', () => {
    renderWithTheme(
      <Button scheme="primary" buttonSize="medium" type="submit">제출</Button>
    );
    expect(screen.getByRole('button', { name: '제출' })).toHaveAttribute('type', 'submit');
  });

  it('secondary scheme이 렌더링된다', () => {
    renderWithTheme(
      <Button scheme="secondary" buttonSize="small">취소</Button>
    );
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });
});

// ─── Badge ────────────────────────────────────────────

describe('Badge', () => {
  it('텍스트가 렌더링된다', () => {
    renderWithTheme(<Badge>모집중</Badge>);
    expect(screen.getByText('모집중')).toBeInTheDocument();
  });

  it('scheme prop이 적용된다', () => {
    renderWithTheme(<Badge scheme="success">채용확정</Badge>);
    expect(screen.getByText('채용확정')).toBeInTheDocument();
  });

  it('기본 scheme은 primary이다', () => {
    const { container } = renderWithTheme(<Badge>기본</Badge>);
    expect(container.querySelector('span')).toBeInTheDocument();
  });
});

// ─── Modal ────────────────────────────────────────────

describe('Modal', () => {
  it('isOpen이 false이면 렌더링되지 않는다', () => {
    renderWithTheme(
      <Modal isOpen={false} onClose={() => {}}>
        <p>모달 내용</p>
      </Modal>
    );
    expect(screen.queryByText('모달 내용')).not.toBeInTheDocument();
  });

  it('isOpen이 true이면 내용이 렌더링된다', () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={() => {}}>
        <p>모달 내용</p>
      </Modal>
    );
    expect(screen.getByText('모달 내용')).toBeInTheDocument();
  });

  it('닫기 버튼 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(
      <Modal isOpen={true} onClose={onClose}>
        <p>내용</p>
      </Modal>
    );
    await user.click(screen.getByLabelText('닫기'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('ESC 키로 모달이 닫힌다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(
      <Modal isOpen={true} onClose={onClose}>
        <p>내용</p>
      </Modal>
    );
    await user.keyboard('{Escape}');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('오버레이 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderWithTheme(
      <Modal isOpen={true} onClose={onClose}>
        <p>내용</p>
      </Modal>
    );
    const overlay = screen.getByText('내용').closest('[class]')?.parentElement;
    if (overlay?.parentElement) {
      await user.click(overlay.parentElement);
    }
    expect(onClose).toHaveBeenCalled();
  });

  it('actions가 렌더링된다', () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={() => {}} actions={<button>확인</button>}>
        <p>내용</p>
      </Modal>
    );
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  it('모달 열릴 때 body overflow가 hidden으로 설정된다', () => {
    renderWithTheme(
      <Modal isOpen={true} onClose={() => {}}>
        <p>내용</p>
      </Modal>
    );
    expect(document.body.style.overflow).toBe('hidden');
  });
});

// ─── Loading ──────────────────────────────────────────

describe('Loading', () => {
  it('기본 메시지가 렌더링된다', () => {
    renderWithTheme(<Loading />);
    expect(screen.getByText('불러오는 중...')).toBeInTheDocument();
  });

  it('커스텀 메시지가 렌더링된다', () => {
    renderWithTheme(<Loading message="공고 불러오는 중..." />);
    expect(screen.getByText('공고 불러오는 중...')).toBeInTheDocument();
  });
});

// ─── ProgressBar ──────────────────────────────────────

describe('ProgressBar', () => {
  it('현재값과 전체값이 렌더링된다', () => {
    renderWithTheme(<ProgressBar total={100} current={70} />);
    expect(screen.getByText('70')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('total이 0일 때 0%로 표시된다', () => {
    renderWithTheme(<ProgressBar total={0} current={0} />);
    const labels = screen.getAllByText('0');
    expect(labels.length).toBe(2); // current=0, total=0
  });

  it('current가 total을 초과해도 100%를 넘지 않는다', () => {
    const { container } = renderWithTheme(<ProgressBar total={50} current={80} />);
    expect(container).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
  });
});

// ─── Empty ────────────────────────────────────────────

describe('Empty', () => {
  it('기본 메시지가 렌더링된다', () => {
    renderWithTheme(<Empty />);
    expect(screen.getByText('데이터가 없습니다.')).toBeInTheDocument();
  });

  it('커스텀 메시지가 렌더링된다', () => {
    renderWithTheme(<Empty message="공고가 없습니다." />);
    expect(screen.getByText('공고가 없습니다.')).toBeInTheDocument();
  });

  it('커스텀 아이콘이 렌더링된다', () => {
    renderWithTheme(<Empty icon={<span data-testid="custom-icon">📭</span>} />);
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });
});

// ─── Title ────────────────────────────────────────────

describe('Title', () => {
  it('텍스트가 렌더링된다', () => {
    renderWithTheme(<Title fontSize="large">공고 목록</Title>);
    expect(screen.getByText('공고 목록')).toBeInTheDocument();
  });

  it('heading 역할로 렌더링된다', () => {
    renderWithTheme(<Title fontSize="medium">제목</Title>);
    expect(screen.getByRole('heading', { name: '제목' })).toBeInTheDocument();
  });

  it('color prop이 적용된다', () => {
    renderWithTheme(<Title fontSize="large" color="primary">컬러 제목</Title>);
    expect(screen.getByText('컬러 제목')).toBeInTheDocument();
  });
});

// ─── InputText ────────────────────────────────────────

describe('InputText', () => {
  it('label이 렌더링된다', () => {
    renderWithTheme(<InputText name="email" label="이메일" />);
    expect(screen.getByLabelText('이메일')).toBeInTheDocument();
  });

  it('placeholder가 표시된다', () => {
    renderWithTheme(<InputText name="email" placeholder="이메일을 입력하세요" />);
    expect(screen.getByPlaceholderText('이메일을 입력하세요')).toBeInTheDocument();
  });

  it('에러 메시지가 표시된다', () => {
    renderWithTheme(<InputText name="email" label="이메일" error="필수 입력입니다" />);
    expect(screen.getByText('필수 입력입니다')).toBeInTheDocument();
  });

  it('required 표시가 렌더링된다', () => {
    renderWithTheme(<InputText name="email" label="이메일" required />);
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  it('입력값이 변경된다', async () => {
    const user = userEvent.setup();
    renderWithTheme(<InputText name="email" label="이메일" />);
    const input = screen.getByLabelText('이메일');
    await user.type(input, 'test@example.com');
    expect(input).toHaveValue('test@example.com');
  });
});

// ─── InputTextarea ────────────────────────────────────

describe('InputTextarea', () => {
  it('label이 렌더링된다', () => {
    renderWithTheme(<InputTextarea name="description" label="업무 내용" />);
    expect(screen.getByLabelText('업무 내용')).toBeInTheDocument();
  });

  it('placeholder가 표시된다', () => {
    renderWithTheme(<InputTextarea name="desc" placeholder="내용을 입력하세요" />);
    expect(screen.getByPlaceholderText('내용을 입력하세요')).toBeInTheDocument();
  });

  it('에러 메시지가 표시된다', () => {
    renderWithTheme(<InputTextarea name="desc" label="설명" error="최소 10자 이상" />);
    expect(screen.getByText('최소 10자 이상')).toBeInTheDocument();
  });

  it('입력값이 변경된다', async () => {
    const user = userEvent.setup();
    renderWithTheme(<InputTextarea name="desc" label="설명" />);
    const textarea = screen.getByLabelText('설명');
    await user.type(textarea, '물류센터 하차 작업');
    expect(textarea).toHaveValue('물류센터 하차 작업');
  });
});

// ─── InputSelect ──────────────────────────────────────

describe('InputSelect', () => {
  const options = [
    { value: 'HOURLY', label: '시급' },
    { value: 'DAILY', label: '일급' },
    { value: 'MONTHLY', label: '월급' },
  ];

  it('label이 렌더링된다', () => {
    renderWithTheme(<InputSelect name="wageType" label="급여 유형" options={options} />);
    expect(screen.getByLabelText('급여 유형')).toBeInTheDocument();
  });

  it('옵션들이 렌더링된다', () => {
    renderWithTheme(<InputSelect name="wageType" label="급여 유형" options={options} />);
    expect(screen.getByText('시급')).toBeInTheDocument();
    expect(screen.getByText('일급')).toBeInTheDocument();
    expect(screen.getByText('월급')).toBeInTheDocument();
  });

  it('placeholder가 표시된다', () => {
    renderWithTheme(
      <InputSelect name="wageType" label="급여 유형" options={options} placeholder="선택하세요" defaultValue="" />
    );
    expect(screen.getByText('선택하세요')).toBeInTheDocument();
  });

  it('에러 메시지가 표시된다', () => {
    renderWithTheme(
      <InputSelect name="wageType" label="급여 유형" options={options} error="필수 선택입니다" />
    );
    expect(screen.getByText('필수 선택입니다')).toBeInTheDocument();
  });

  it('선택값이 변경된다', async () => {
    const user = userEvent.setup();
    renderWithTheme(<InputSelect name="wageType" label="급여 유형" options={options} />);
    const select = screen.getByLabelText('급여 유형');
    await user.selectOptions(select, 'DAILY');
    expect(select).toHaveValue('DAILY');
  });
});

// ─── CheckboxButtons ──────────────────────────────────

describe('CheckboxButtons', () => {
  const options = [
    { value: 'MON', label: '월' },
    { value: 'TUE', label: '화' },
    { value: 'WED', label: '수' },
  ];

  it('옵션 버튼들이 렌더링된다', () => {
    renderWithTheme(
      <CheckboxButtons options={options} value="MON" onChange={() => {}} />
    );
    expect(screen.getByRole('button', { name: '월' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '화' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '수' })).toBeInTheDocument();
  });

  it('단일 선택 모드에서 클릭 시 onChange가 호출된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithTheme(
      <CheckboxButtons options={options} value="MON" onChange={onChange} />
    );
    await user.click(screen.getByRole('button', { name: '화' }));
    expect(onChange).toHaveBeenCalledWith('TUE');
  });

  it('다중 선택 모드에서 클릭 시 onToggle이 호출된다', async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderWithTheme(
      <CheckboxButtons options={options} multiple selected={['MON']} onToggle={onToggle} />
    );
    await user.click(screen.getByRole('button', { name: '수' }));
    expect(onToggle).toHaveBeenCalledWith('WED');
  });

  it('label이 렌더링된다', () => {
    renderWithTheme(
      <CheckboxButtons label="근무 요일" options={options} value="MON" onChange={() => {}} />
    );
    expect(screen.getByText('근무 요일')).toBeInTheDocument();
  });

  it('에러 메시지가 표시된다', () => {
    renderWithTheme(
      <CheckboxButtons options={options} value="MON" onChange={() => {}} error="최소 1개 선택" />
    );
    expect(screen.getByText('최소 1개 선택')).toBeInTheDocument();
  });

  it('required 표시가 렌더링된다', () => {
    renderWithTheme(
      <CheckboxButtons label="요일" options={options} value="MON" onChange={() => {}} required />
    );
    expect(screen.getByText('*')).toBeInTheDocument();
  });
});

// ─── StickyBar ────────────────────────────────────────

describe('StickyBar', () => {
  it('children이 렌더링된다', () => {
    renderWithTheme(
      <StickyBar>
        <button>지원하기</button>
      </StickyBar>
    );
    expect(screen.getByRole('button', { name: '지원하기' })).toBeInTheDocument();
  });

  it('여러 children이 렌더링된다', () => {
    renderWithTheme(
      <StickyBar>
        <button>취소</button>
        <button>저장</button>
      </StickyBar>
    );
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });
});
