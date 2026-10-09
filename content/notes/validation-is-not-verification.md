---
title: Validation is not verification
date: 2026-09-28
---

A config that parses is not a config the running process picked up. `validate` proves the file is well formed. It proves nothing about what the daemon is doing right now.

The sequence that holds: apply, confirm the edit landed on disk, restart the live process, check the behaviour, and only then call it done.
