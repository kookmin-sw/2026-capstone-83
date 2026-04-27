import { rgba } from 'polished';
import type { Theme } from '../types/theme';

const lightColor: Theme['color'] = {
  primary: '#4DB190',
  secondary: '#E2F1EC',
  tertiary: '#02542D',
  highlight: '#00C8B3',
  white: '#FFFFFF',
  black: '#000000',
  text: '#111111',
  subText: '#878787',
  thirdText: '#4C5F58',
  error: '#CC0000',
  required: '#CC0000',
  border: '#CECECE',
  background: '#FBFBFE',
  subBackground: '#D9D9D9',
  thirdBackground: '#94A3B8',
  accent: '#F0C23B',
  hoverOverlay: rgba('#000000', 0.7),
};

const gradation = {
  primary: `linear-gradient(90deg, ${lightColor.primary} 0%, ${lightColor.secondary} 100%)`,
};

const shadow = {
  default: `0px 12px 32px ${rgba(lightColor.black, 0.06)}`,
};

const createButtonScheme = (color: Theme['color']): Theme['buttonScheme'] => ({
  primary: {
    color: color.white,
    backgroundColor: color.primary,
    boxShadow: shadow.default,
  },
  secondary: {
    color: color.black,
    backgroundColor: color.white,
    border: color.border,
  },
  option: {
    color: color.subText,
    backgroundColor: color.secondary,
  },
  optionActive: {
    color: color.white,
    backgroundColor: color.primary,
  },
  like: {
    color: color.subText,
    backgroundColor: 'transparent',
    border: `1px solid ${color.border}`,
  },

});


const createBadgeScheme = (color: Theme['color']): Theme['badgeScheme'] => ({
  primary: {
    color: color.white,
    backgroundColor: color.highlight,
  },
  secondary: {
    color: color.thirdText,
    backgroundColor: color.secondary,
    border: color.border,
  },
  success: {
    color: color.white,
    backgroundColor: color.tertiary,
  },
  neutral: {
    color: color.white,
    backgroundColor: color.accent,
  },
  warning: {
    color: color.error,
    backgroundColor: "#FEE2E2",
  },
  error: {
    color: color.white,
    backgroundColor: color.error,
  },

});

export const light: Theme = {
  name: 'light',
  color: lightColor,
  gradation,
  shadow,
  fontSize: {
    xlarge: '2rem',
    large: '1.5rem',
    medium: '1rem',
    small: '0.875rem',
    xsmall: '0.75rem',
  },
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  buttonSize: {
    xsmall: { padding: '0.25rem 0.625rem' },
    small: { padding: '0.5rem 0.875rem' },
    medium: { padding: '1rem 5rem' },
    large: { width: '100%', padding: '1rem 0' },
  },
  buttonScheme: createButtonScheme(lightColor),
  badgeScheme: createBadgeScheme(lightColor),
  borderRadius: {
    small: '6px',
    medium: '12px',
    large: '24px',
    round: '50px',
  },
  layout: {
    width: {
      large: '1020px',
      medium: '760px',
      small: '320px',
    },
  },
  mediaQuery: {
    mobile: '(max-width: 480px)',
    tablet_small: '(max-width: 768px)',
    tablet_large: '(max-width: 1024px)'
  },
};


export const getTheme = (): Theme => {
  return light;
};
