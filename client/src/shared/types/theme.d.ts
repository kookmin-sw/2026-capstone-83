export type ThemeName = 'light' | 'dark';

export type ColorKey =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'highlight'
  | 'black'
  | 'white'
  | 'text'
  | 'subText'
  | 'thirdText'
  | 'error'
  | 'required'
  | 'border'
  | 'background'
  | 'subBackground'
  | 'thirdBackground'
  | 'accent'
  | 'hoverOverlay';

export type GradationKey = 'primary';

export type ShadowKey = 'default';

export type FontSizeKey = 'xlarge' | 'large' | 'medium' | 'small' | 'xsmall';

export type FontWeightKey = 'regular' | 'medium' | 'semibold' | 'bold';

export type ButtonSize =
  | 'large'
  | 'medium'
  | 'small'
  | 'xsmall';

export type ButtonScheme =
  | 'primary'
  | 'secondary'
  | 'option'
  | 'optionActive'
  | 'like';

export type BadgeScheme = 'primary' | 'secondary' | 'success' | 'neutral' | 'warning' | 'error';

export type BorderRadiusKey = 'small' | 'medium' | 'large' | 'round';

export type Layout = 'large' | 'medium' | 'small';

export type LayoutWidth = Layout;

export type MediaQuery = 'mobile' | 'tablet_small' | 'tablet_large';

export type ButtonSchemeVariant = {
  color?: string;
  backgroundColor: string;
  border?: string;
  boxShadow?: string;
  gradation?: string;
};

export type BadgeSchemeVariant = {
  color?: string;
  backgroundColor: string;
  border?: string;
};

export interface Theme {
  name: ThemeName;
  color: Record<ColorKey, string>;
  gradation: Record<GradationKey, string>;
  shadow: Record<ShadowKey, string>;
  fontSize: Record<FontSizeKey, string>;
  fontWeight: Record<FontWeightKey, string>;
  buttonSize: Record<
    ButtonSize,
    { fontSize?: string; width?: string; padding: string }
  >;
  buttonScheme: Record<ButtonScheme, ButtonSchemeVariant>;
  badgeScheme: Record<BadgeScheme, BadgeSchemeVariant>;
  borderRadius: Record<BorderRadiusKey, string>;
  layout: {
    width: Record<LayoutWidth, string>;
  };
  mediaQuery: Record<MediaQuery, string>;
}
