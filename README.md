# ryankennedy.me

Personal site and technical blog. Astro, static output, served by nginx on a
DigitalOcean droplet. Everything here is hand-editable; nothing depends on an
agent to understand it.

## Run it

```bash
npm ci
npx playwright install chromium   # once; rehype-mermaid renders diagrams with it
npm run dev                       # http://localhost:4321
npm run build                     # writes ./dist
npx astro check                   # type check
```

Node 22.12 or newer (`.nvmrc` pins it).

## Where things live

| Path | What |
| --- | --- |
| `content/` | The writing. Also an Obsidian vault: open this folder in Obsidian. |
| `content/articles/<slug>/index.md` | Long-form. Images sit beside the post. |
| `content/notes/<slug>.md` | Short, dated, plain text. |
| `src/styles/tokens.css` | Every colour, size and font. Change the look here. |
| `src/styles/global.css` | Structure and component styling. |
| `src/layouts/Base.astro` | The page shell: head, fonts, theme script, nav, footer. |
| `src/pages/` | Routes. Notes, articles, tag pages, contact, 404, RSS. |
| `src/content.config.ts` | Frontmatter schema for both collections. |
| `astro.config.mjs` | Integrations, markdown pipeline, fonts. |
| `ec.config.mjs` | Code block themes and frame styling. |

## Writing

Frontmatter for an article:

```yaml
title: Replacing a droplet without downtime
description: One sentence. Shows in lists, the lede, RSS and meta tags.
date: 2026-10-02
tags: [ansible, tls]
draft: false        # true keeps it out of every list, page and the feed
```

A note needs only `title` and `date` (and `draft` if you want it hidden).

Articles get the rich elements, notes stay plain:

- Code blocks: ` ```yaml title="infra/playbook.yml" {6-10} ` gives a filename
  tab and highlights lines 6 to 10. `ins`/`del` and `"text"` markers also work.
- Diagrams: a ` ```mermaid ` block renders to an inline SVG at build time.
- Callouts, Obsidian syntax, so they also render in Obsidian's preview:
  `> [!note] Title`, `> [!tip]`, `> [!warning]`, `> [!danger]`.
  A `-` after the type makes it collapsible.
- Images: `![caption](./file.png)` with the file next to the post. Astro
  resizes and converts it; the alt text becomes the caption.
- Quotes: a normal `>` blockquote; add `<cite>` on its own line for attribution.

Obsidian settings for this vault: **Use [[Wikilinks]] off**, **New link
format: relative path to file**, **Default location for new attachments: same
folder as current file**. With those three, Obsidian writes markdown Astro
reads as-is.

## Contact form

Posts to Web3Forms. The access key in `src/lib/site.ts` only identifies the
destination inbox and is public by design. hCaptcha is Web3Forms' zero-config
widget; it must also be switched on for the form in the Web3Forms dashboard
or submissions without a solved captcha are still accepted.

## Theme

Dark by default, honours the OS on first visit, remembered in `localStorage`.
The inline script in `Base.astro` runs before paint so there is no flash, and
re-runs after view-transition swaps. The cursor spotlight is dark-mode only
and off under `prefers-reduced-motion` and on touch devices.
