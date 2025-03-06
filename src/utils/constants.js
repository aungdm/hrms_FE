export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
};
export const isDark = theme => theme.palette.mode === 'dark'; // FOR LAYOUT 2 SECONDARY SIDEBAR

export const secondarySideBarGap = 80;
export const secondarySideBarWidth = 215;
export const globalConstants = {
  BASE_URL: import.meta.env.VITE_BASE_URL,
  VERSION: import.meta.env.VITE_APP_VERSION,
};
