# dsh-ssh-workspace-manager

English · [中文](README.zh.md)

**dsh-plugin** for [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness). An **SSH remote** page in Settings — and the agent tools that use it. A human adds hosts and keys; the agent binds the current workspace, runs commands, syncs, and drives compose.

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-111111)](https://github.com/topics/dsh-plugin)
[![test](https://github.com/telagod/dsh-ssh-workspace-manager/actions/workflows/test.yml/badge.svg)](https://github.com/telagod/dsh-ssh-workspace-manager/actions/workflows/test.yml)

Companion plugin for plain-text compaction: [telagod/dsh-ledger-compact](https://github.com/telagod/dsh-ledger-compact) (`/fast-compact`, no image, no model call).

---

## Why

"Deploy this to the server" is normally a conversation the agent cannot finish: it does not know the host, it guesses a path, and it shells out to `ssh` with a command the sandbox may refuse. The facts that decide the outcome — which host, which directory, which runtime — belong in settings, not in a prompt.

This plugin puts them there, once:

- **The human gets a page.** Add a host, pick agent-or-key auth, press **Test connection**, press **Inspect**. No binding form, no commands to type.
- **The agent gets tools.** `ssh_status` reads the same facts, `ssh_bind` records a target for the current workspace, and the rest run work through them — no ad-hoc `ssh`, no path guessing.
- **The mount is workspace-scoped.** A binding is (workspace → host → remote directory), with its runtime, compose file and exclude list attached, so "the project on 38" is a fact rather than a re-derivation every turn.

## Install

This package deliberately does **not** declare `dsh.bundle` — see [why](#why-no-bundle-patch). It installs as a dependency of the profile, and the insert belongs in the profile's own patch layer.

Clone it once, next to the profile:

```bash
git clone https://github.com/telagod/dsh-ssh-workspace-manager.git ~/project/dsh-ssh-workspace-manager
ln -sfn ~/project/dsh-ssh-workspace-manager ~/.dsh/profiles/web/plugins/dsh-ssh-workspace-manager
dsh plugin --profile web install
```

Add the dependency to `profile/package.json`:

```json
"dsh-ssh-workspace-manager": "file:./plugins/dsh-ssh-workspace-manager"
```

and insert it in `profile/cordis.patch.yml`:

```yaml
- insert:
    - id: ssh-workspace-manager
      name: dsh-ssh-workspace-manager
```

The `file:` dependency must land in `node_modules` as a **symlink** to `plugins/`, never a copy — otherwise hot reload polls a directory you are not editing.

Restart the web profile. If you would rather not clone anything, `dsh plugin --profile web add github:telagod/dsh-ssh-workspace-manager` installs the dependency as well; it prints `declares no dsh.bundle — installed as a plain dependency, not a profile layer`. That warning is expected — this package is *installed*, not layered — and the insert above is still yours to make.

### Why no bundle patch

Reconciliation runs after *any* successful `dsh plugin` command in a profile, including read-only ones such as `--help` or `ls`, and appends every bundle-declaring dependency to `dsh.profile.bundles`. A profile is a *stack* of layer patches, and a top-level `insert` **appends**: nothing merges two entries that share an id. A self-inserting plugin therefore collides with any profile whose patch layer is maintained by hand, and the failure is a hard one:

    dsh: plugin tree failed to load: failed to apply loader entry include
    (cordis:include): duplicate loader entry id: ssh-workspace-manager

Two entries with *different* ids fail one layer deeper — the plugin mounts twice and the second `settings namespace "dsh-ssh" is already registered` throws. Keeping the insert in the profile's own patch layer avoids the whole class: the plugin is installed as a plain dependency, and exactly one layer mounts it.

**Do not also list it in `dsh.profile.bundles`.** The install id is `ssh-workspace-manager`, and it must be mounted by exactly one entry.

## Settings page

The page sits beside **General** and **Models** (sidebar: **SSH 远程**). The header carries only the title and a reload icon; the body has three tabs.

- **Servers** — one compact card per host. First line: name + `user@host:port` with a copy button, and icon buttons for *test connection*, *inspect*, *edit*, *delete*. Second line: badges for panel, auth, jump host, timeout, keepalive, known_hosts policy, and how many bindings use it. After an inspect, OS (kernel on hover), container runtime, detected panel and container count are appended. Results expand in place.
- **Bindings** — grouped by workspace (title + local path + count). Each row carries the role badge, the default marker, the server, the remote directory, and runtime / compose / exclude badges, with icon buttons for *copy path*, *edit*, *unbind*.
- **Preferences** — defaults for new bindings (role, runtime, compose file), new hosts (timeout, keepalive, known_hosts, login shell), and the session title-bar chip.

Past four hosts or bindings a filter box appears at the right of the tab row; it filters the current tab only. Bindings pointing at a deleted workspace are grouped separately (`已删除的 Workspace`) and sorted last.

The sidebar icon is decorated: the plugin swaps its own settings entry's default gear for a terminal icon. It is best-effort DOM work on the host page — if the node is not found, it does nothing.

### Servers

Name, host, port, username, panel type, auth method (SSH agent / identity file), identity file path, ProxyJump host, connect timeout, keepalive interval, known_hosts policy, login shell.

**Panel** is a label only (`plain` / `baota` / `aapanel` / `onepanel` / `plesk` / `cpanel`): it tells the model what is on the machine, and does not change the SSH command.

### Bindings

Workspace, server, remote project directory, environment (`development` / `staging` / `production`), container runtime (`docker` / `podman` / `none`), compose file, compose project name, sync excludes, default flag.

- **Keepalive** — `ServerAliveInterval=N` with `ServerAliveCountMax=3`; `0` disables it. 30 is the useful value for long tasks.
- **Login shell** — wraps the remote command in `bash -lc`, falling back to `sh -lc`, so `/etc/profile` and with it nvm, bun and friends are on `PATH`.
- **Excludes** — `--exclude` for rsync, `--exclude=` for the tar fallback; up to 50 patterns of 200 characters, comma or newline separated. `ssh_sync` calls may add more for one push.

### Preferences

`role`, `runtime`, `composeFile`, `hostKeyPolicy`, `connectTimeout`, `keepAlive`, `loginShell`, `showSessionChip` — the defaults a new host or binding starts from. Out-of-range values are clamped on save, so the stored state is always valid.

## Agent tools

| Tool | What it does |
| --- | --- |
| `ssh_status` | Lists hosts, bindings and the current workspace's binding. The agent is told to reach for it when the user mentions a server, deploy, 远端 or 服务器. |
| `ssh_bind` | Records that this workspace deploys to *host + remotePath*, with `role`, `runtime`, `composeFile`, `containerProject` and `exclude`. The **first** binding for a workspace becomes the default; later ones do not steal it unless `isDefault: true`. `remotePath` must be absolute and not `/`. |
| `ssh_unbind` | Removes one binding by id. |
| `ssh_exec` | Runs a command after `cd` into the bound remote directory. Prefer it over ad-hoc `bash ssh`. Timeout 1s–300s. |
| `ssh_sync` | Pushes the local workspace to the remote directory (`rsync -az`, `tar` when rsync is missing). `deleteExtra` removes remote-only files and asks the user first. |
| `ssh_compose` | `ps` / `logs` / `up` / `down` in the bound remote directory. `down` asks the user first. |
| `ssh_inspect` | Probes OS, kernel, container runtime, panel directories and running containers. |

Any of these may take `server` + `remotePath` directly instead of a binding, so a first deploy does not need one.

### Division of labor

- **Human** — adds hosts in Settings → SSH 远程, tests the connection, adjusts defaults. Does not fill a binding form, does not type commands into the settings page.
- **Agent** — owns every binding. Given a server and a project it calls `ssh_status`, binds the current workspace itself (inferring `remotePath` from the user's words, the repo name, or an `ssh_exec ls`), then works through the tools. It is told not to send the user to the binding form, and never to invent a host, password or key file.
- **Browser RPC** — the settings page reaches the host through exactly eight Typert methods: `getState`, `saveServer`, `deleteServer`, `saveBinding`, `deleteBinding`, `savePreferences`, and the read-only probes `testConnection` / `inspectServer`. exec, sync and compose do **not** go through Typert; only the agent's tools reach them.

### Sandbox and approvals

SSH needs `~/.ssh` and the network, which a session sandbox may refuse. When a call is denied, the agent is instructed to retry that exact call **once** with `sandbox_permissions: danger-full-access` plus a one-sentence `justification` — the approval prompt raised by that retry is how the user consents. The settings page's *test connection* and *inspect* buttons are human-initiated and run with `danger-full-access` directly.

`ssh_sync` with `deleteExtra` and `ssh_compose down` ask for confirmation separately, and are not retried after a rejection.

## Storage

Hosts, bindings and preferences persist in the `dsh-ssh` namespace of the profile's settings file (`$DSH_HOME/settings.yaml`, by default `~/.dsh/settings.yaml`). Nothing is written to the remote but what you asked for; no secrets beyond an optional identity-file *path* are stored here.

## Package layout

| File | Contents |
| --- | --- |
| `lib/index.js` | Host service, settings persistence, the SSH operations, the agent tools, the system-prompt section. |
| `lib/client.js` | Settings page and console, the session title-bar chip, the sidebar icon decoration. |
| `lib/typert.host.js` / `lib/typert.remote-client.js` | The Typert contract (settings-page methods only). |
| `lib/ssh.test.js` / `lib/client.test.js` | `node --test` unit tests: the host service against a mocked `ctx` and a mocked remote, the client evaluated against a fake `window`. |

## Development

```bash
node --test lib/ssh.test.js lib/client.test.js
```

Verified on dsh `0.1.5-rc.1`, Node ≥ 22.

**Host hot reload** — `dsh-base` ships `@cordisjs/plugin-hmr` disabled. Enable it in the profile's `cordis.patch.yml` and point `root` at `plugins/` **and at the checkout**, because Node resolves the symlink and the loader keys its cache on the real path:

```yaml
- id: hmr
  disabled: false
  config:
    root:
      - !!js dshHomePath('profiles', 'web', 'plugins')
      - /path/to/dsh-ssh-workspace-manager
```

Only edits to `cordis.patch.yml` are picked up as a live patch reload; a change to plugin JS is seen by the HMR watcher.

**Client hot reload** — `dsh-client-hmr` polls `lib/client.js` every 500 ms and replaces the plugin in the browser, so a source change needs no page refresh. This is unrelated to `pnpm run dev:web`, which is for developing DSH's own client packages.

## Usage

1. **Settings → SSH 远程**: add a host, press *Test connection*, optionally *Inspect*.
2. In a project session, ask for the work ("deploy this", "sync to 38", 远端/服务器). The agent calls `ssh_status`, binds the workspace if needed, then `ssh_exec` / `ssh_sync` / `ssh_compose`.
3. Bindings can be edited or removed by hand on the **Bindings** tab; the agent maintains them too.

## License

MIT.
