# Changelog

## 0.3.0

Packaging pass: the plugin can install itself as a profile layer. No `lib/` change.

### Added

- **`cordis.patch.yml` + `dsh.bundle.patch`** — `dsh plugin --profile web add github:telagod/dsh-ssh-workspace-manager`
  now inserts the plugin itself. Before this, the CLI warned that the package
  "declares no dsh.bundle — installed as a plain dependency, not a profile layer"
  and every install ended in a hand-edited `cordis.patch.yml`.
  The inserted id is `ssh-workspace-manager`, the id the manual recipe already used.

  **Migrating a hand-patched profile:** a top-level `insert` appends — same id or
  not, two entries never merge, and two with the same id fail the boot with
  `duplicate loader entry id: ssh-workspace-manager`. Reconciliation adds the
  bundle to `dsh.profile.bundles` after *any* successful `dsh plugin` command in
  that profile, so a profile that still hand-inserts the entry must drop it
  first. Verified against `dsh-app-boot`'s `applyEntryPatches` (the same code
  `--dump-config` and mounting run) and by booting a scratch profile both ways.
- **English `README.md`** with the previous Chinese README kept in step as
  `README.zh.md` (language switcher at the top, same structure).
- **`CHANGELOG.md`**.

### Changed

- **Install is one command.** The clone-and-symlink recipe is now the
  from-a-checkout variant; the primary path is `dsh plugin --profile web add`.
- **`package.json`**: declares `dsh.bundle.patch`; dropped `private: true`
  (the package is meant to be a dependency of someone else's profile, and the
  companion plugin ships without it); `files` now includes `cordis.patch.yml`,
  `CHANGELOG.md` and `README.zh.md`; description matches the companion's
  `dsh-plugin: ...` form.
- **CI** runs the suite on Node 22 and 24, and `node --check` every `lib/` file.

## 0.2.0

Initial public release.

- Host service, settings persistence under the `dsh-ssh` namespace, and the
  SSH operations (`exec` / `sync` / `compose` / `inspect`) behind the
  `sshWorkspaceManager` service.
- Settings page mounted beside General and Models: a **Servers** tab, a
  **Bindings** tab grouped by workspace, and a **Preferences** tab; the filter
  box appears past four rows.
- Agent tools `ssh_status` / `ssh_bind` / `ssh_unbind` / `ssh_exec` /
  `ssh_sync` / `ssh_compose` / `ssh_inspect`, plus the standing system-prompt
  section that tells the agent to bind the current workspace itself.
- Typert RPC surface limited to the settings page's eight methods.
- `node --test` suite (host service against a mock remote, client evaluated
  against a fake `window`).
