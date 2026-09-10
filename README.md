# DSH SSH Workspace Manager

配套的文本模型快压插件在另一个仓库：[telagod/dsh-ledger-compact](https://github.com/telagod/dsh-ledger-compact)（`/fast-compact`，不打图、不调模型）。

Web profile 插件：人只负责 SSH 主机和连通；绑定、远端执行、同步、Compose 由 Agent 完成。

设置页与「通用」「模型」同级（侧栏「SSH 远程」）。

## 设置页

顶部只留标题和「重新加载」图标，正文分三个 Tab：

- **服务器**：紧凑卡片，第一行是名称 + `user@host:port`（带复制）+ 右侧图标按钮（测试连接 / 探测主机 / 编辑 / 删除），第二行徽章显示面板、认证方式、跳板、超时、保活、known_hosts、关联数；探测后追加 OS（悬停看内核）、容器运行时、识别到的面板、容器数。结果框就地展开。
- **关联**：按 Workspace 分组（标题 + 本地路径 + 条数），每行是角色徽章、默认标记、服务器、远程目录，以及运行时 / Compose / 排除项徽章，右侧图标按钮（复制路径 / 编辑 / 解除）。
- **偏好**：新关联默认环境 / 运行时 / Compose 文件，新主机默认超时 / 保活 / known_hosts / 登录 shell，以及会话标题栏芯片开关。

主机 + 关联超过 4 条时，Tab 行右侧出现筛选框（只过滤当前 Tab）；指向已删除 Workspace 的关联单独归组并排到最后。
侧栏图标：插件会把自己设置项的默认齿轮换成终端图标（对宿主 DOM 的装饰，找不到就什么都不做）。

### 可配置项

服务器：名称、主机、端口、用户名、面板类型、认证方式（SSH Agent / 指定私钥）、私钥路径、跳板机 ProxyJump、连接超时、保活间隔（ServerAliveInterval）、known_hosts 策略、登录 shell。

关联：Workspace、服务器、远程项目目录、环境（开发 / 测试 / 生产）、容器运行时、Compose 文件、Compose 项目名、同步排除项、是否默认关联。

偏好（`preferences`）：新关联默认环境 / 运行时、默认 Compose 文件、新主机默认超时 / 保活 / known_hosts / 登录 shell、会话标题栏芯片开关。

- **保活**：`ServerAliveInterval=N` + `ServerAliveCountMax=3`，0 表示关闭；长任务建议 30。
- **登录 shell**：远端命令包一层 `bash -lc`（没有 bash 时退回 `sh -lc`），能读到 `/etc/profile`、nvm、bun 等 PATH。
- **同步排除**：rsync 走 `--exclude`，本机没有 rsync 退回 tar 时走 `--exclude=`；`ssh_sync` 调用里也能临时加。

## 分工

- **人**：添加主机（Agent / 私钥）、测试连接、按需调默认值。不填绑定表，不在设置页敲命令。
- **Agent**：`ssh_status`、`ssh_bind`、`ssh_unbind`、`ssh_exec`、`ssh_sync`、`ssh_compose`、`ssh_inspect`。当前 Workspace 未绑定就自己 `ssh_bind`。可直接传 `server` + `remotePath`，不必先有绑定。
- **浏览器 RPC**：只暴露 `getState` / `saveServer` / `deleteServer` / `saveBinding` / `deleteBinding` / `savePreferences` / `testConnection` / `inspectServer`（最后两个是只读探测）。exec / sync / compose 不走 Typert。

SSH 需要 `~/.ssh` 和网络。Agent 调用走当前会话 sandbox；被拒后用 `sandbox_permissions: danger-full-access` + `justification` 重试一次（和 bash 相同）。设置页「测试连接」「探测主机」由人点，使用 `danger-full-access`。`ssh_sync deleteExtra` 和 `ssh_compose down` 会再问一次用户。

`ssh_bind`：一个 Workspace 的**第一条**关联成为默认；后续绑定不会抢走，除非显式 `isDefault: true`。`remotePath` 必须是绝对路径，且不能是 `/`。不传 `role` / `runtime` / `composeFile` 时用「默认值与显示」里的偏好。

## 包结构

- `lib/index.js`：Host 服务、settings 持久化、SSH 操作、Agent tools。
- `lib/client.js`：设置页和控制台、会话标题栏芯片、侧栏图标装饰。
- `lib/typert.host.js` / `lib/typert.remote-client.js`：Typert 契约（仅设置页方法）。
- `lib/ssh.test.js` / `lib/client.test.js`：`node --test` 单测（mock ctx + mock 远端；client 用假 window 求值）。

## 测试

    node --test lib/ssh.test.js lib/client.test.js

## 安装到 Web profile

不要拷贝目录。先克隆，再把 profile 插件符号链接到仓库根（这个包的 `package.json` 在仓库根）：

    git clone https://github.com/telagod/dsh-ssh-workspace-manager.git ~/project/dsh-ssh-workspace-manager
    ln -sfn ~/project/dsh-ssh-workspace-manager ~/.dsh/profiles/web/plugins/dsh-ssh-workspace-manager

`profile/package.json`：

    "dsh-ssh-workspace-manager": "file:./plugins/dsh-ssh-workspace-manager"

`file:` 依赖必须是 `node_modules` → `plugins/` 的符号链接，不能是拷贝，否则 Client HMR 轮询的不是你正在改的文件。

`profile/cordis.patch.yml`：

    - insert:
        - id: ssh-workspace-manager
          name: dsh-ssh-workspace-manager

Host 模块热更：`dsh-base` 默认关掉 `@cordisjs/plugin-hmr`。web profile 的 `cordis.patch.yml` 需要显式打开，并把 `root` 指到 `plugins/` **以及克隆下来的仓库路径**（Node 会 realpath 符号链接）。只改 `cordis.patch.yml` 才会走 `patchReload: live`。

Client 热更：`dsh-client-hmr` 每 500ms 轮询 `lib/client.js`。源码变更后浏览器会换插件，不必整页刷新；不需要 `pnpm run dev:web`（那是改 DSH 自己的 client 包时用的）。

## 使用

1. 设置 → SSH 远程：添加主机，点「测试连接」或「探测主机」。
2. 在项目会话里让 Agent 干活（deploy / 远端 / 同步）。它会 `ssh_status` → 必要时 `ssh_bind` → `ssh_exec` / `ssh_sync` / `ssh_compose`。
3. 设置页里的关联可以手动加/改/解除；Agent 也会自己维护。

## 许可

MIT。
