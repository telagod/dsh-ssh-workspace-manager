# Changelog

## 0.3.2

**Restored the bundle patch.** 0.3.1 pulled it after a false alarm. That was the wrong
call, and the official tutorial is explicit about why: a package without `dsh.bundle`
"still installs, but only as a plain dependency … Use that package format for a
**library** that plugin packages import rather than a **plugin users enable**"
(`docs/user/develop/basic/publish.md`). This is a plugin users enable. No `lib/` change.

### Why 0.3.1 was wrong

The collision 0.3.1 was reacting to is real, but its cause is a profile that mounts by
hand a package that also declares a bundle — never the bundle itself. The documented
workflow cannot produce that state: `dsh plugin` owns `dsh.profile.bundles` ("You never
write a profile manifest by hand"), and a profile's `cordis.patch.yml` is the *user*
layer — applied after every bundle layer, for overriding rows, not for mounting what a
bundle already mounts. The fix belongs in such a profile, not in the package.

### Restored

- `cordis.patch.yml` and the `dsh.bundle` declaration; `files[]` ships the patch again,
  and CI requires a declared patch to be shipped.
- `dsh plugin --profile web add github:telagod/dsh-ssh-workspace-manager` inserts the
  plugin itself again, with no hand-edited profile patch. Verify with
  `dsh --profile web --dump-config | grep ssh-workspace-manager`.

### Kept from 0.3.1

- The README's account of the failure modes: a top-level `insert` appends, so two
  entries with the same id fail the boot with `duplicate loader entry id`, and two with
  different ids mount the plugin twice (`settings namespace "dsh-ssh" is already
  registered`). It is now framed as *do not also insert it by hand* — which is what the
  docs imply, and what a profile migrating from the hand-wired shape has to undo.

## 0.3.1

**Reverted the bundle patch shipped in 0.3.0.** The plugin no longer declares
`dsh.bundle` and no longer inserts itself — the insert belongs in the profile's
own patch layer. No `lib/` change.

### Why

Reconciliation runs after *any* successful `dsh plugin` command in a profile,
including read-only ones such as `--help` or `ls`, and appends every
bundle-declaring dependency to `dsh.profile.bundles`. A profile is a stack of
layer patches and a top-level `insert` appends: two entries with the same id fail
the boot outright (`duplicate loader entry id: ssh-workspace-manager`), and two
with different ids mount the plugin twice (`settings namespace "dsh-ssh" is
already registered`). A self-inserting plugin therefore collides with any profile
whose patch layer is maintained by hand — which is the normal case here. Verified
against `dsh-app-boot`'s `applyEntryPatches` (the code `--dump-config` and
mounting share) and by booting scratch profiles both ways.

### Changed

- Removed `cordis.patch.yml` and the `dsh.bundle` declaration; `files[]` no
  longer ships the patch.
- `dsh plugin --profile web add github:telagod/dsh-ssh-workspace-manager` still
  installs the dependency, and prints `declares no dsh.bundle — installed as a
  plain dependency, not a profile layer`. That is now the intended shape: install
  through the CLI, mount through your own patch layer.
- README (both languages): manual wiring is the install path again, with a *Why no
  bundle patch* section recording both failure modes.

### Migrating

If you added this package as a bundle during 0.3.0's window, reconciliation removes
it from `dsh.profile.bundles` on the next `dsh plugin` command, which would leave
the plugin unmounted. Put the insert back in `profile/cordis.patch.yml`:

```yaml
- insert:
    - id: ssh-workspace-manager
      name: dsh-ssh-workspace-manager
```

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
