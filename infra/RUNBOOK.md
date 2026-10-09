# Runbook

Everything you'd need to do to this site by hand.

| | |
| --- | --- |
| Repo | `~/Developer/ryankennedy.me` (GitHub: captain-marlow/ryankennedy.me) |
| Droplet | `rkme-web-sfo3-01`, DigitalOcean sfo3, ID 607627629, direct IP `147.182.246.246` |
| Reserved IP | `134.199.142.59`, what DNS points at. Survives a droplet rebuild. |
| Admin SSH | `ssh rkme` (user `ryan`, `~/.ssh/id_ed25519`; root login disabled) |
| Deploy SSH | `ssh -i ~/.ssh/rkme_deploy deploy@134.199.142.59` (no sudo, owns the web root only) |
| Web root | `/var/www/ryankennedy.me` |
| DO token | `~/.homelab-secrets/digitalocean-ryankennedy-me.env` (custom scopes, never on the server) |
| Form | Web3Forms, key in `src/lib/site.ts`; hCaptcha enabled in the Web3Forms dashboard |

---

## Publish a post

Write it in Obsidian (the `content/` vault), set `draft: false`, then:

```bash
cd ~/Developer/ryankennedy.me
git add content && git commit -m "Post: <title>" && git push
```

GitHub Actions builds, checks, uploads a release and swaps it live, about
two minutes. Watch it with `gh run watch`, or at the repo's Actions tab.
A broken image link or bad frontmatter fails the build and nothing changes
on the server.

## Deploy by hand

Same thing the workflow does, run locally. Useful when Actions is down or
you want to watch it happen.

```bash
cd ~/Developer/ryankennedy.me
npm ci                                  # only when dependencies changed
npm run build                           # writes ./dist

HOST=134.199.142.59
ROOT=/var/www/ryankennedy.me
SHA=$(git rev-parse --short HEAD)

ssh -i ~/.ssh/rkme_deploy deploy@$HOST "mkdir -p $ROOT/releases/$SHA"
rsync -az --delete -e "ssh -i ~/.ssh/rkme_deploy" dist/ deploy@$HOST:$ROOT/releases/$SHA/
ssh -i ~/.ssh/rkme_deploy deploy@$HOST \
  "ln -sfn $ROOT/releases/$SHA $ROOT/current.new && mv -Tf $ROOT/current.new $ROOT/current"

curl -sS -o /dev/null -w '%{http_code}\n' https://ryankennedy.me/
```

`ln -sfn` followed by `mv -Tf` matters: `ln -sf` onto an existing symlink
creates a link *inside* the target directory instead of replacing it, and
`mv -T` makes the swap a single atomic rename. No nginx reload is needed; it
resolves `current` per request.

### Roll back

```bash
HOST=134.199.142.59; ROOT=/var/www/ryankennedy.me
ssh -i ~/.ssh/rkme_deploy deploy@$HOST "ls -1dt $ROOT/releases/*/"     # newest first
ssh -i ~/.ssh/rkme_deploy deploy@$HOST \
  "ln -sfn $ROOT/releases/<SHA> $ROOT/current.new && mv -Tf $ROOT/current.new $ROOT/current"
```

The five most recent releases are kept. Rollback is a symlink swap: no
rebuild, no downtime. The workflow does this itself if its post-deploy
verification fails.

---

## Server

```bash
cd infra
ansible-playbook -i inventory.ini playbook.yml --check    # dry run
ansible-playbook -i inventory.ini playbook.yml -e enable_ssl=true
```

Idempotent. `enable_ssl=true` is the normal state once a certificate
exists; without it the box serves plain HTTP, only useful before cutover.
Change nginx by editing `infra/files/*.conf` and re-running; the playbook
validates with `nginx -t` before reloading.

Do not run the playbook while a deploy is in flight. Its apt upgrade step can
restart nginx for a second, and a deploy that is verifying at that moment
rolls itself back (it retries three times, which covers most of this, but
not a longer package upgrade). Check `gh run list --workflow Deploy` first.

### Certificate

Covers `ryankennedy.me` and `www`, ECDSA, issued 2026-10-09, expires
2027-01-07. Renews automatically over HTTP-01 against `/var/www/certbot`
(dry run passed 2026-10-09). No API token is stored on the server.

**After the first real renewal lands (around December 2026):** raise HSTS in
`infra/files/headers-snippet.conf` from `max-age=604800` to
`max-age=31536000; includeSubDomains`, re-run the playbook. Not before: HSTS
cannot be withdrawn from browsers that cached it.

```bash
ssh rkme 'sudo certbot renew --dry-run'
ssh rkme 'sudo certbot certificates'
```

### Locked out by fail2ban

Five failed SSH auths get your IP banned for an hour; the symptom is port 22
refusing while port 443 still answers. Bans do not persist, so a reboot
clears it:

```bash
set -a; . ~/.homelab-secrets/digitalocean-ryankennedy-me.env; set +a
doctl compute droplet-action reboot 607627629
```

Or from the DigitalOcean console. Logged in from elsewhere:
`sudo fail2ban-client set sshd unbanip <your-ip>`.

---

## Rebuild the server from scratch

The droplet is a build artifact. DNS points at the reserved IP, so a
rebuild never touches DNS.

```bash
set -a; . ~/.homelab-secrets/digitalocean-ryankennedy-me.env; set +a
cd infra

# 1. New droplet, your key injected at first boot by cloud-init
doctl compute droplet create rkme-web-sfo3-02 \
  --region sfo3 --size s-1vcpu-1gb-amd --image ubuntu-24-04-x64 \
  --ssh-keys 35109256 --user-data-file cloud-init.yml --wait
#    note its direct IP; put it in inventory.ini temporarily

# 2. Provision over the direct IP, first run as root
ansible-playbook -i inventory.ini playbook.yml -e ansible_user=root

# 3. Certificate: DNS-01 works before the IP moves. Place the token for the
#    issuance only, then remove it and switch renewal to webroot (the
#    renewal conf edit is in the Phase 6 work log of the P097 plan).
#    Alternatively copy /etc/letsencrypt from the old box.

# 4. TLS vhost
ansible-playbook -i inventory.ini playbook.yml -e enable_ssl=true

# 5. Deploy once by hand or push to main with DEPLOY_HOST pointing at the
#    direct IP, verify with curl --resolve, then move the reserved IP:
doctl compute reserved-ip-action assign 134.199.142.59 <new droplet id>

# 6. Put the reserved IP back in inventory.ini; destroy the old droplet.
```

## Keys and secrets

| What | Where |
| --- | --- |
| GitHub Actions deploy key | private: repo `production` environment secret `DEPLOY_SSH_KEY`; public: `infra/playbook.yml` and `~/.ssh/rkme_deploy` on the Mac |
| Deploy target | environment secrets `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_ROOT`, `DEPLOY_KNOWN_HOSTS` |
| DigitalOcean token | `~/.homelab-secrets/digitalocean-ryankennedy-me.env` on the Mac only |
| Web3Forms access key | `src/lib/site.ts`, public by design |

To rotate the deploy key: `ssh-keygen -t ed25519 -f ~/.ssh/rkme_deploy`,
update `deploy_pubkey` in the playbook, re-run it, then
`gh secret set DEPLOY_SSH_KEY --env production < ~/.ssh/rkme_deploy`.
