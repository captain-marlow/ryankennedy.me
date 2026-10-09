# content

This folder is an Obsidian vault and the source Astro builds from. Open it in
Obsidian (File → Open vault → Open folder as vault → this folder). The vault
settings that matter are committed in `.obsidian/app.json`:

- Wikilinks off, so links and embeds are written as standard markdown.
- Link format relative, so `![alt](image.png)` points beside the note.
- Attachments saved in the same folder as the note.

Articles go in `articles/<slug>/index.md` with their images beside them.
Notes go in `notes/<slug>.md`. Templates for both are under `templates/`
(Insert template from the command palette). New posts start as `draft: true`;
flip it to `false` to publish, then commit and push.

Linking to another post: use the site path, `/articles/<slug>` or
`/notes/<slug>`, not the `.md` file. Astro leaves `.md` links as-is.
