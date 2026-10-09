---
title: Wildcard certs with Traefik and DNS-01
description: One cert, 23 services, no per-host issuance race. What the first migration got wrong and the second one fixed.
date: 2026-09-01
tags: [tls, networking]
---

A wildcard certificate is the difference between "add a router" and "add a router and wait for a cert and hope HSTS did not cache the failure". This is the shape that works.

## One holder, many routers

Exactly one router owns the resolver. Every other router says `tls: {}` and inherits the wildcard from the store.

```yaml title="dynamic/wildcard.yml"
http:
  routers:
    wildcard-cert-holder:
      rule: Host(`cert.example.dev`)
      service: noop@internal
      tls:
        certResolver: letsencrypt
        domains:
          - main: example.dev
            sans: ["*.example.dev"]
```

## The race it kills

Per-host issuance meant every new service hit the first request before its cert existed, Traefik served the default cert, and the browser pinned HSTS against it. The wildcard is issued once, ahead of time, so the race cannot start.
