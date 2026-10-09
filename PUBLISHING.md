# Publishing

How to write, change, and ship this site. The short version: edit files,
`git push`, and GitHub puts it live in about a minute.

## One-time setup on a new Mac

```bash
git clone git@github.com:captain-marlow/ryankennedy.me.git ~/Developer/ryankennedy.me
cd ~/Developer/ryankennedy.me
npm ci
npx playwright install chromium     # Mermaid diagrams render with it
```

Then in Obsidian: Open vault → Open folder as vault → pick the `content/`
folder inside the repo. Its settings are committed, so nothing to configure.

## Write a note

Notes are short and plain: paragraphs, inline `code`, links. No images,
diagrams or callouts.

1. In Obsidian, create a file in `notes/`, for example `notes/my-note.md`.
   The filename becomes the URL: `/notes/my-note`.
2. Command palette → **Templates: Insert template** → `note`. That fills in
   the frontmatter with today's date.
3. Set `title`. Write. Leave `draft: true` until it is ready, then set it
   to `false` (the properties panel has a checkbox).

```yaml
---
title: Validation is not verification
date: 2026-09-28
draft: false
---
```

## Write an article

Articles live in a folder so their images can sit beside them.

1. In Obsidian, create `articles/<slug>/index.md`. The folder name is the
   URL: `/articles/<slug>`.
2. Insert the `article` template. Set `title`, `description` (one sentence;
   it appears in lists, under the headline, in RSS and in search results)
   and `tags` (lowercase words; each becomes a filter chip).
3. Write. Set `draft: false` when ready.

```yaml
---
title: Replacing a droplet without downtime
description: Build the new box beside the old one, verify it by IP, then flip.
date: 2026-10-02
tags: [ansible, tls]
draft: false
---
```

What you can put in an article:

| You want | You write |
| --- | --- |
| An image | Paste it. Obsidian saves it beside the post and writes `![](file.png)`. Put a caption in the brackets: `![The two-stage vhost](file.png)`. |
| A code block | ` ```yaml title="infra/playbook.yml" {6-10} ` … ` ``` `. `title` shows a filename tab, `{6-10}` highlights lines 6 to 10. |
| A diagram | ` ```mermaid ` … ` ``` `. Rendered to an SVG at build time. |
| A callout | `> [!tip] Optional title` then `> the text`. Types: `note` (indigo), `tip` (green), `warning` (amber), `danger` (pink). Add `-` after the type to make it collapsible. These also render in Obsidian's preview. |
| A quote | `> The quote.` then `> <cite>— who said it</cite>` on its own line. |
| A link to another post | `[text](/articles/other-slug)`. Use the site path, not the `.md` file. |
| A heading | `## Heading`. Level-2 and level-3 headings make up the table of contents. |

## Preview before publishing

```bash
cd ~/Developer/ryankennedy.me
npm run dev          # then open http://localhost:4321
```

Drafts show in the dev server so you can see them; they never build for the
live site. Stop it with Ctrl-C.

## Publish

```bash
cd ~/Developer/ryankennedy.me
git add content
git commit -m "Post: the title"
git push
```

That is the whole deploy. GitHub builds the site, checks it, uploads it to
the server and swaps it live. Watch it finish:

```bash
gh run watch
```

or open the Actions tab on the repo. Green means live; reload the site.

**If it goes red**, nothing changed on the live site. The log says why.
The usual causes: a pasted image was deleted but its link is still in the
post, or a frontmatter field is missing or misspelled. Fix, commit, push
again. GitHub also emails you about every failed run.

## Edit the site itself

Same loop: edit, commit, push. Where things live:

| Change | File |
| --- | --- |
| Home page intro, interests line | `src/pages/index.astro` |
| Contact page text, the "elsewhere" cards | `src/pages/contact.astro` |
| Links to GitHub, LinkedIn, Matrix; site title and description | `src/lib/site.ts` |
| Nav items | `src/components/Nav.astro` |
| Footer | `src/components/Footer.astro` |
| Colours, fonts, sizes, spacing, dark and light palettes | `src/styles/tokens.css` |
| How lists, chips, callouts, code and prose look | `src/styles/global.css` |
| Code block themes | `ec.config.mjs` |
| The page shell (head tags, fonts, theme script) | `src/layouts/Base.astro` |
| Which frontmatter fields exist | `src/content.config.ts` |
| Favicon, social preview image, robots.txt | `public/` |

Run `npm run dev` to see the change, `npx astro check` to type-check, then
commit and push. The deploy runs the same checks and refuses to ship a
broken build.

## Undo a bad deploy

The server keeps the last five releases. Point it at the previous one:

```bash
ssh -i ~/.ssh/rkme_deploy deploy@134.199.142.59 \
  'ls -1dt /var/www/ryankennedy.me/releases/*/'      # newest first
ssh -i ~/.ssh/rkme_deploy deploy@134.199.142.59 \
  'R=/var/www/ryankennedy.me; ln -sfn $R/releases/<sha> $R/current.new && mv -Tf $R/current.new $R/current'
```

Instant, no rebuild. Then fix the problem in git and push; the next deploy
replaces it. More in `infra/RUNBOOK.md`, which also covers the server,
certificate, and rebuilding from nothing.
