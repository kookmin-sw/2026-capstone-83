import type { LucideIcon } from 'lucide-react';
import { useTheme } from 'styled-components';

type LandingIconVariant = 'primary' | 'white' | 'text';

type LandingLucideIconProps = {
  icon: LucideIcon;
  size?: number;
  variant?: LandingIconVariant;
};

/** Lucide stroke 색상 — color prop으로 SVG stroke 속성에 직접 전달 */
export const LandingLucideIcon = ({
  icon: Icon,
  size = 28,
  variant = 'primary',
}: LandingLucideIconProps) => {
  const theme = useTheme();

  const strokeColor =
    variant === 'white'
      ? theme.color.white
      : variant === 'text'
        ? theme.color.text
        : theme.color.primary;

  return <Icon size={size} strokeWidth={2} color={strokeColor} aria-hidden />;
};
