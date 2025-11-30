export enum AppStage {
  INTRO = 'INTRO',
  SHAPING = 'SHAPING',
  DECORATING = 'DECORATING',
  FIRING = 'FIRING',
  RESULT = 'RESULT'
}

export enum PorcelainStyle {
  BLUE_WHITE = 'Blue & White (青花)',
  RICE_PATTERN = 'Rice-pattern (玲珑)',
  FAMILLE_ROSE = 'Famille Rose (粉彩)',
  COLOR_GLAZE = 'Color Glaze (颜色釉)'
}

export enum FiringSource {
  WOOD = 'Pine Wood (松木)',
  GAS = 'Natural Gas (天然气)',
  ELECTRIC = 'Electric (电力)'
}

export interface GeneratedPorcelain {
  imageUrl: string;
  name: string;
  description: string;
  poem: string;
  temperature: number;
  firingSource: FiringSource;
}