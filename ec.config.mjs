// Expressive Code: one dark and one light theme, switched by <html data-theme>.
import { defineEcConfig } from 'astro-expressive-code';

export default defineEcConfig({
  themes: ['github-dark', 'github-light'],
  // Our toggle sets data-theme="dark" | "light"; map each theme by its type.
  themeCssSelector: (theme) => `[data-theme='${theme.type}']`,
  useDarkModeMediaQuery: false,
  styleOverrides: {
    codeFontFamily: 'var(--font-mono)',
    uiFontFamily: 'var(--font-mono)',
    codeFontSize: 'var(--fs-sm)',
    codeLineHeight: '1.7',
    borderRadius: 'var(--radius)',
    borderColor: 'var(--border)',
    codeBackground: 'var(--bg-code)',
    frames: {
      editorTabBarBackground: 'var(--bg-subtle)',
      editorActiveTabBackground: 'var(--bg-subtle)',
      editorActiveTabForeground: 'var(--text-muted)',
      editorActiveTabIndicatorBottomColor: 'transparent',
      editorActiveTabIndicatorTopColor: 'transparent',
      editorTabBarBorderBottomColor: 'var(--border)',
      editorBackground: 'var(--bg-code)',
      terminalBackground: 'var(--bg-code)',
      terminalTitlebarBackground: 'var(--bg-subtle)',
      terminalTitlebarBorderBottomColor: 'var(--border)',
      terminalTitlebarForeground: 'var(--text-muted)',
      frameBoxShadowCssValue: 'none',
      inlineButtonBackground: 'transparent',
      inlineButtonBorder: 'var(--border)',
      inlineButtonForeground: 'var(--text-muted)',
    },
    textMarkers: {
      markBackground: 'color-mix(in srgb, var(--accent) 10%, transparent)',
      markBorderColor: 'var(--accent)',
    },
  },
});
