// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import expressiveCode from 'astro-expressive-code';
import icon from 'astro-icon';
import { unified } from '@astrojs/markdown-remark';
import rehypeMermaid from 'rehype-mermaid';
import rehypeCallouts from 'rehype-callouts';

// Site-wide constants live in src/lib/site.ts; the URL is repeated here
// because the config cannot import from src.
const SITE = 'https://ryankennedy.me';

// Mermaid renders at build time (Playwright + Chromium, see README) to an
// inline SVG with the dark palette baked in. Light mode is handled by CSS
// overrides in src/styles/global.css.
const mermaidConfig = {
  theme: 'base',
  fontFamily: 'Geist Mono, ui-monospace, monospace',
  themeVariables: {
    fontSize: '13px',
    background: 'transparent',
    primaryColor: 'hsl(225 28% 10%)',
    primaryTextColor: 'hsl(225 20% 92%)',
    primaryBorderColor: 'hsl(225 15% 23%)',
    secondaryColor: 'hsl(225 24% 14%)',
    tertiaryColor: 'hsl(225 24% 14%)',
    lineColor: 'hsl(225 12% 62%)',
    textColor: 'hsl(225 20% 92%)',
    edgeLabelBackground: 'hsl(225 24% 14%)',
    clusterBkg: 'hsl(225 24% 14%)',
    clusterBorder: 'hsl(225 15% 23%)',
    noteBkgColor: 'hsl(225 24% 14%)',
    noteTextColor: 'hsl(225 20% 92%)',
    noteBorderColor: 'hsl(240 95% 72%)',
    actorBkg: 'hsl(225 28% 10%)',
    actorBorder: 'hsl(225 15% 23%)',
    actorTextColor: 'hsl(225 20% 92%)',
    signalColor: 'hsl(225 12% 62%)',
    signalTextColor: 'hsl(225 20% 92%)',
  },
};

export default defineConfig({
  site: SITE,
  trailingSlash: 'never',
  build: { format: 'directory' },
  integrations: [
    // Expressive Code must come before MDX so fenced blocks are handled first.
    expressiveCode(),
    mdx(),
    sitemap(),
    icon({ include: { lucide: ['sun', 'moon', 'copy', 'info', 'lightbulb', 'triangle-alert', 'circle-x', 'arrow-right', 'rss', 'github', 'linkedin', 'message-circle'] } }),
  ],
  markdown: {
    // Astro 7 defaults to Sätteri; rehype-callouts and rehype-mermaid are
    // unified plugins, so stay on the unified pipeline.
    // Expressive Code owns code blocks; keep Astro's own highlighter off.
    syntaxHighlight: false,
    processor: unified({
      rehypePlugins: [
        [rehypeCallouts, { theme: 'obsidian' }],
        [rehypeMermaid, { strategy: 'inline-svg', mermaidConfig }],
      ],
    }),
  },
  fonts: [
    { provider: fontProviders.google(), name: 'Geist', cssVariable: '--font-sans', weights: [400, 500, 600], styles: ['normal'], subsets: ['latin'], fallbacks: ['system-ui', 'sans-serif'] },
    { provider: fontProviders.google(), name: 'Geist Mono', cssVariable: '--font-mono', weights: [400, 500], styles: ['normal'], subsets: ['latin'], fallbacks: ['ui-monospace', 'monospace'] },
  ],
});
