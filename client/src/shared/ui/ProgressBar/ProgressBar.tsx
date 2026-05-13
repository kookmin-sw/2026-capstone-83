
import { BarContainer, Filler, Label, Wrapper } from './ProgressBarStyle';


interface Props {
  total: number;
  current: number;
  height?: string;
  fontSize?: string;
}

const ProgressBar = ({ total, current, height, fontSize }: Props) => {
  // 퍼센트 계산 (0으로 나누기 방지)
  const percentage = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <Wrapper>
      <BarContainer $height={height}>
        <Filler $width={percentage} />
      </BarContainer>
      <Label $fontSize={fontSize}>
        <span className="current">{current}</span>
        <span className="divider">/</span>
        <span className="total">{total}</span>
      </Label>
    </Wrapper>
  );
};

export default ProgressBar;