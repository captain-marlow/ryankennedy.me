---
title: Unattended-upgrades will never reboot by default
date: 2026-10-06
---

The droplet had been running `unattended-upgrades` the whole time. It still had 89 pending packages and a kernel that had been waiting on a reboot for 201 days.

Two defaults cause this. It only takes the security pocket, so regular updates pile up. And automatic reboot is off, so kernel updates install and never take effect. A box can be "patched" for a year and run the kernel it was born with.

The fix is two lines in the unattended-upgrades config: add the updates pocket to the allowed origins, and set the reboot to true with a time in the middle of the night.

Auto-reboot is only safe on a stateless box. This one serves files off disk and starts nginx on boot, so there is nothing to lose. A database host is a different conversation.
