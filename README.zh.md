# dsh-ssh-workspace-manager

[English](README.md) · 中文

**dsh-plugin**，用于 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)。设置页里的 **SSH 远程** 面板，以及使用它的 Agent 工具。人只负责加主机和私钥；绑定、远端执行、同步、Compose 由 Agent 完成。

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![dsh-plugin](https://img.shields.io/badge/dsh-plugin-111111)](https://github.com/topics/dsh-plugin)
[![test](https://github.com/telagod/dsh-ssh-workspace-manager/actions/workflows/test.yml/badge.svg)](https://github.com/telagod/dsh-ssh-workspace-manager/actions/workflows/test.yml)

配套的纯文本快压插件在另一个仓库：[telagod/dsh-ledger-compact](https://github.com/telagod/dsh-ledger-compact)（`/fast-compact`，不打图、不调模型）。

---

## 为什么

「把这个部署到服务器上」通常是一句 Agent 完不成的话：它不知道主机，只能猜路径，然后拼一条 `ssh` 命令交给沙箱去拒。决定结果的事实——哪台机器、哪个目录、什么运行时——本来就该待在设置里，而不是每一轮的提示词里。

于是这个插件把这些事实放到设置里，只放一次：

- **人有一张页面。** 加主机、选 Agent 或私钥认证、点「测试连接」、点「探测主机」。不填绑定表，不在页面上敲命令。
- **Agent 有一组工具。** `ssh_status` 读同一份事实，`ssh_bind` 为当前 Workspace 记下目标，其余工具通过它干活——不用拼 `ssh`，不用猜路径。
- **绑定是按 Workspace 落的。** 一条绑定是（Workspace → 主机 → 远程目录），运行时的、Compose 文件、排除项都挂在上面，「38 上那个项目」因此是一个事实，而不是每轮重新推一遍。

## 安装

本包**刻意不声明** `dsh.bundle`——原因见 [为什么不带 bundle patch](#为什么不带-bundle-patch)。它作为 profile 的一个依赖安装，插入权留在 profile 自己的 patch 层里。

先把仓库克隆到 profile 旁边：

```bash
git clone https://github.com/telagod/dsh-ssh-workspace-manager.git ~/project/dsh-ssh-workspace-manager
ln -sfn ~/project/dsh-ssh-workspace-manager ~/.dsh/profiles/web/plugins/dsh-ssh-workspace-manager
dsh plugin --profile web install
```

在 `profile/package.json` 里加依赖：

```json
"dsh-ssh-workspace-manager": "file:./plugins/dsh-ssh-workspace-manager"
```

在 `profile/cordis.patch.yml` 里插入：

```yaml
- insert:
    - id: ssh-workspace-manager
      name: dsh-ssh-workspace-manager
```

`file:` 依赖必须最终是 `node_modules` → `plugins/` 的**符号链接**，不能是拷贝，否则热重载轮询的不是你正在改的目录。

装完重启 web profile。不想克隆的话，`dsh plugin --profile web add github:telagod/dsh-ssh-workspace-manager` 也会装依赖，只是会打印一句 `declares no dsh.bundle — installed as a plain dependency, not a profile layer`。这句警告是预期的——本包是被**安装**的，不是被叠成一层——上面那条 insert 仍然要你自己加。

### 为什么不带 bundle patch

校正发生在 profile 里**任何一条**成功的 `dsh plugin` 命令之后，包括 `--help`、`ls` 这类只读命令；它会把每个声明了 bundle 的依赖追加进 `dsh.profile.bundles`。而 profile 是**一层层叠上去**的 patch，顶层 `insert` 是**追加**：id 相同也不会合并。于是「自己插入自己」的插件，必然和任何手工维护 patch 层的 profile 撞车，而且是硬失败：

    dsh: plugin tree failed to load: failed to apply loader entry include
    (cordis:include): duplicate loader entry id: ssh-workspace-manager

两条**不同** id 的条目则在更深一层失败——插件被挂两遍，第二次 `settings namespace "dsh-ssh" is already registered` 抛错。把 insert 留在 profile 自己的 patch 层里就绕开了整类问题：包只作为普通依赖安装，挂载它的永远只有一层。

**不要同时把它列进 `dsh.profile.bundles`。**安装 id 是 `ssh-workspace-manager`，它只能被一条条目挂载。

## 设置页

页面与「通用」「模型」同级（侧栏「SSH 远程」）。顶部只留标题和「重新加载」图标，正文分三个 Tab。

- **服务器** —— 每台主机一张紧凑卡片。第一行是名称 + `user@host:port`（带复制）和右侧图标按钮（测试连接 / 探测主机 / 编辑 / 删除）；第二行徽章显示面板、认证方式、跳板、超时、保活、known_hosts 策略、关联数。探测后追加 OS（悬停看内核）、容器运行时、识别到的面板、容器数。结果框就地展开。
- **关联** —— 按 Workspace 分组（标题 + 本地路径 + 条数）。每行是角色徽章、默认标记、服务器、远程目录，以及运行时 / Compose / 排除项徽章，右侧图标按钮（复制路径 / 编辑 / 解除）。
- **偏好** —— 新关联默认环境 / 运行时 / Compose 文件，新主机默认超时 / 保活 / known_hosts / 登录 shell，以及会话标题栏芯片开关。

主机 + 关联超过 4 条时，Tab 行右侧出现筛选框（只过滤当前 Tab）；指向已删除 Workspace 的关联单独归组（`已删除的 Workspace`）并排到最后。

侧栏图标会做一点装饰：插件把自己设置项的默认齿轮换成终端图标。这是对宿主 DOM 的尽力而为，找不到节点就什么都不做。

### 服务器

名称、主机、端口、用户名、面板类型、认证方式（SSH Agent / 指定私钥）、私钥路径、跳板机 ProxyJump、连接超时、保活间隔、known_hosts 策略、登录 shell。

**面板**只是标记（`plain` / `baota` / `aapanel` / `onepanel` / `plesk` / `cpanel`）：用来提示模型这套机器上有什么，不影响 SSH 命令。

### 关联

Workspace、服务器、远程项目目录、环境（`development` / `staging` / `production`）、容器运行时（`docker` / `podman` / `none`）、Compose 文件、Compose 项目名、同步排除项、是否默认关联。

- **保活** —— `ServerAliveInterval=N` 配 `ServerAliveCountMax=3`，`0` 表示关闭；长任务建议 30。
- **登录 shell** —— 远端命令包一层 `bash -lc`（没有 bash 时退回 `sh -lc`），能读到 `/etc/profile`，以及随之而来的 nvm、bun 等 PATH。
- **排除项** —— rsync 走 `--exclude`，退回 tar 时走 `--exclude=`；最多 50 条、每条 200 字符，逗号或换行分隔。`ssh_sync` 调用时还能为这一次推送临时加。

### 偏好

`role`、`runtime`、`composeFile`、`hostKeyPolicy`、`connectTimeout`、`keepAlive`、`loginShell`、`showSessionChip`——新主机 / 新关联的起点。越界值在保存时被夹到范围内，所以落盘的状态永远合法。

## Agent 工具

| 工具 | 作用 |
| --- | --- |
| `ssh_status` | 列出主机、绑定，以及当前 Workspace 的绑定。提示词要求 Agent 在用户提到服务器、deploy、远端、服务器时先读它。 |
| `ssh_bind` | 记下「这个 Workspace 部署到 *主机 + remotePath*」，连同 `role`、`runtime`、`composeFile`、`containerProject`、`exclude`。一个 Workspace 的**第一条**绑定成为默认，后续绑定不会抢走，除非显式 `isDefault: true`。`remotePath` 必须是绝对路径，且不能是 `/`。 |
| `ssh_unbind` | 按 id 解除一条绑定。 |
| `ssh_exec` | `cd` 到绑定的远程目录后执行命令。优先于即席 `bash ssh`。超时 1s–300s。 |
| `ssh_sync` | 把本地 Workspace 推到远程目录（`rsync -az`，没有 rsync 时退回 `tar`）。`deleteExtra` 会删掉远端多出来的文件，执行前问用户。 |
| `ssh_compose` | 在绑定的远程目录里跑 `ps` / `logs` / `up` / `down`。`down` 执行前问用户。 |
| `ssh_inspect` | 探测 OS、内核、容器运行时、面板目录、运行中的容器。 |

这些工具都可以直接传 `server` + `remotePath`，不必先有绑定——所以第一次部署不需要绑定。

### 分工

- **人** —— 在「设置 → SSH 远程」加主机、测试连接、按需调默认值。不填绑定表，不在设置页敲命令。
- **Agent** —— 拥有全部绑定。拿到服务器和项目后，它调 `ssh_status`，自己给当前 Workspace 绑定（`remotePath` 从用户的话、仓库名或一次 `ssh_exec ls` 里推），然后用工具干活。提示词明确要求它不要把用户打发去填绑定表，也永远不要编造主机、密码或密钥文件。
- **浏览器 RPC** —— 设置页只通过八个 Typert 方法访问 Host：`getState`、`saveServer`、`deleteServer`、`saveBinding`、`deleteBinding`、`savePreferences`，以及只读探测 `testConnection` / `inspectServer`。exec / sync / compose **不**走 Typert，只有 Agent 的工具能碰到。

### 沙箱与批准

SSH 需要 `~/.ssh` 和网络，会话沙箱可能拒绝。被拒时，Agent 被要求把**同一次**调用用 `sandbox_permissions: danger-full-access` 加一句 `justification` 重试一次——这次重试弹出的批准提示就是用户表达同意的方式。设置页的「测试连接」「探测主机」由人点击，直接以 `danger-full-access` 运行。

`ssh_sync deleteExtra` 和 `ssh_compose down` 会单独再问一次；被拒绝后不要重试。

## 存储

主机、绑定、偏好都存在 profile 设置文件的 `dsh-ssh` 命名空间里（`$DSH_HOME/settings.yaml`，默认 `~/.dsh/settings.yaml`）。除了你要发的东西，远端不会被写入别的；这里也只存私钥的*路径*，不存私钥本身。

## 包结构

| 文件 | 内容 |
| --- | --- |
| `lib/index.js` | Host 服务、设置持久化、SSH 操作、Agent 工具、系统提示词段落。 |
| `lib/client.js` | 设置页和控制台、会话标题栏芯片、侧栏图标装饰。 |
| `lib/typert.host.js` / `lib/typert.remote-client.js` | Typert 契约（仅设置页方法）。 |
| `lib/ssh.test.js` / `lib/client.test.js` | `node --test` 单测：host 服务跑在 mock `ctx` 和 mock 远端上，client 在假 `window` 里求值。 |

## 开发

```bash
node --test lib/ssh.test.js lib/client.test.js
```

在 dsh `0.1.5-rc.1`、Node ≥ 22 上验证。

**Host 热重载** —— `dsh-base` 默认关掉 `@cordisjs/plugin-hmr`。在 profile 的 `cordis.patch.yml` 里打开，并把 `root` 指到 `plugins/` **以及克隆下来的仓库路径**：Node 会 realpath 符号链接，而 loader 的缓存按真实路径记：

```yaml
- id: hmr
  disabled: false
  config:
    root:
      - !!js dshHomePath('profiles', 'web', 'plugins')
      - /path/to/dsh-ssh-workspace-manager
```

只有改 `cordis.patch.yml` 才会走 live patch 重载；插件 JS 的改动由 HMR 监视器看到。

**Client 热重载** —— `dsh-client-hmr` 每 500ms 轮询 `lib/client.js`，在浏览器里换掉插件，改源码不必整页刷新。这和 `pnpm run dev:web` 无关，后者是改 DSH 自己的 client 包时用的。

## 使用

1. **设置 → SSH 远程**：加主机，点「测试连接」，按需再点「探测主机」。
2. 在项目会话里直接提要求（「部署这个」「同步到 38」、远端/服务器）。Agent 会调 `ssh_status`，必要时绑定当前 Workspace，然后 `ssh_exec` / `ssh_sync` / `ssh_compose`。
3. 绑定可以在「关联」Tab 手动加/改/解除；Agent 也会自己维护。

## 许可

MIT。
