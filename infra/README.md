# Server provisioning

The droplet that serves ryankennedy.me, as code. Ported from
downtown-foot-clinic, which has the same shape.

The site is a static Astro build, plain files and no application server, so
this box runs nginx and nothing else. No Node, no runtime to keep patched.
That is why the playbook is short enough to read in one sitting, and why
rebuilding the server is cheap.

```bash
cd infra
ansible-playbook -i inventory.ini playbook.yml --check    # dry run
ansible-playbook -i inventory.ini playbook.yml
```

Needs the `community.general` and `ansible.posix` collections:

```bash
ansible-galaxy collection install community.general ansible.posix
```

## What it does

| | |
| --- | --- |
| apt | full upgrade, then nginx, ufw, fail2ban, rsync, certbot + the DigitalOcean DNS plugin |
| unattended-upgrades | security **and** regular updates, automatic reboot at 03:30 |
| sshd | no root login, no password auth, max 3 auth tries; asserted against the running daemon |
| ufw | default deny inbound; OpenSSH and Nginx Full allowed |
| fail2ban | sshd jail, 5 retries, 1 hour ban |
| `ryan` | admin user, passwordless sudo, verified before root is disabled |
| `deploy` | unprivileged, owns only the web root, holds the GitHub Actions key |
| nginx | the vhost below, validated with `nginx -t` before every reload |

Automatic reboot is on because the server is stateless: nginx serves files
off disk and starts on boot, so there is no in-flight state to lose.

## Creating the droplet

```bash
export DIGITALOCEAN_ACCESS_TOKEN=…   # ~/.homelab-secrets/digitalocean-ryankennedy-me.env
doctl compute droplet create rkme-web-sfo3-01 \
  --region sfo3 --size s-1vcpu-1gb-amd --image ubuntu-24-04-x64 \
  --ssh-keys <id of a key on the account> \
  --user-data-file cloud-init.yml --wait
```

`cloud-init.yml` installs Ryan's ed25519 key on root at first boot, which is
what the very first playbook run connects with:

```bash
ansible-playbook -i inventory.ini playbook.yml -e ansible_user=root
```

After that run root is disabled and the inventory's default `ansible_user=ryan`
applies. The token needs `droplet`, `ssh_key:read`, `image:read`,
`regions:read`, `sizes:read`, `domain` read/update and `action:read`.

## Two-stage TLS

nginx will not start if a vhost points at certificate files that do not
exist, and a certificate cannot be issued over HTTP-01 until DNS points at
the droplet, which is the *last* step of the cutover, not the first.

1. **`enable_ssl=false`** (the default) installs `nginx-site-http.conf`,
   plain HTTP. Enough to verify the entire site over the raw IP.
2. Issue the certificate for the apex **and** www with a DNS-01 challenge,
   which works before DNS points here.
3. **`-e enable_ssl=true`** installs `nginx-site.conf`, the full TLS vhost.
4. Flip DNS. HTTPS works immediately.

DNS-01 needs the DigitalOcean token on the box for the issuance only. It is
placed, used, and removed; renewal uses the webroot over HTTP-01 and needs
no credentials once DNS resolves here.

## nginx notes

**`try_files $uri $uri/ =404`**: Astro writes `about/index.html`, so bare
paths resolve through the directory index.

**`/_astro/` is immutable for a year** because Astro writes content hashes
into those filenames. HTML must revalidate, or a deploy would never reach
anyone holding a cached copy.

**HSTS** starts at one week, not a year, and without `preload`.

**CSP is report-only.** The only third parties are the Web3Forms client and
hCaptcha on the contact page. Switch to enforcing once the console is clean.
