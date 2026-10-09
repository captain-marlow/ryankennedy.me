---
title: Mount the Caddy directory, not the file
date: 2026-09-14
---

Mounting a single `Caddyfile` into the container breaks live reload. Editors save by writing a new file and swapping the inode, and the bind mount keeps pointing at the old one. Mount the directory and the reload sees the new file.
