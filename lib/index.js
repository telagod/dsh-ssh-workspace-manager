import os from "node:os";
import path from "node:path";
import { TYPERT } from "./typert.host.js";

const NS = "dsh-ssh";
const SERVICE = "sshWorkspaceManager";
const PANELS = ["plain", "baota", "aapanel", "onepanel", "plesk", "cpanel"];
const ROLES = ["development", "staging", "production"];
const RUNTIMES = ["docker", "podman", "none"];
const COMPOSE_ACTIONS = ["ps", "logs", "up", "down"];
const ESCALATION_MODES = ["workspace-write", "danger-full-access"];
const HOST_KEY_POLICIES = ["strict", "accept-new"];
const MAX_EXCLUDES = 50;
const MAX_EXCLUDE_LENGTH = 200;
const DEFAULT_PREFERENCES = Object.freeze({
  role: "development",
  runtime: "none",
  composeFile: "docker-compose.yml",
  hostKeyPolicy: "accept-new",
  connectTimeout: 8,
  keepAlive: 0,
  loginShell: false,
  showSessionChip: true
});
const EMPTY = { servers: [], bindings: [], preferences: { ...DEFAULT_PREFERENCES } };
const WIDER_MODES = {
  "read-only": ["workspace-write", "danger-full-access"],
  "workspace-write": ["danger-full-access"]
};

function validateEscalationArgs(sandboxPermissions, justification) {
  if (sandboxPermissions !== undefined && justification === undefined) throw new Error("invalid escalation: sandbox_permissions requires a justification");
  if (justification !== undefined && sandboxPermissions === undefined) throw new Error("invalid escalation: justification is only valid together with sandbox_permissions");
  if (justification !== undefined && justification.trim().length === 0) throw new Error("invalid justification: expected a non-empty sentence");
}
function sandboxDenialMarker(mode) {
  return "[sandbox: file access denied under " + mode + " mode]";
}
function escalationHintMarker(subject) {
  return "[sandbox: escalation available — retry this exact " + subject + " once with sandbox_permissions (the narrowest wider mode that suffices) + justification; the approval prompt asks the user]";
}
async function approveEscalation(request, approval) {
  const mode = request.requestedMode;
  const effectiveMode = request.effectiveMode;
  if (!(WIDER_MODES[effectiveMode] || []).includes(mode)) {
    throw new Error("sandbox escalation to \"" + mode + "\" is not strictly wider than this call's current \"" + effectiveMode + "\" mode");
  }
  if (approval.approver === undefined) throw new Error("sandbox escalation to \"" + mode + "\" requires approval, but no approval service is composed");
  if (approval.agent === undefined) throw new Error("sandbox escalation to \"" + mode + "\" requires approval, but the call has no agent to route it through");
  const outcome = await approval.approver.request({
    agent: approval.agent,
    toolName: approval.toolName,
    callId: approval.callId,
    reason: "escalate sandbox to " + mode + ": " + request.justification,
    ...approval.signal ? { signal: approval.signal } : {}
  });
  if (outcome === "allowed-once") return mode;
  if (outcome === "rejected") throw new Error("the user rejected escalating this " + request.subject + " to \"" + mode + "\"");
  if (outcome === "cancelled") throw new Error("approval for escalating to \"" + mode + "\" was cancelled");
  throw new Error("sandbox escalation to \"" + mode + "\" requires approval, but no approval channel is available");
}

const text = (value) => {
  if (typeof value === "string") return value;
  if (value && typeof value.text === "string") return value.text;
  return "";
};
const trim = (value) => typeof value === "string" ? value.trim() : "";
const clampInt = (value, fallback, min, max) => {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsed)) return fallback;
  return Math.min(Math.max(parsed, min), max);
};
const panelOf = (value) => PANELS.includes(value) ? value : "plain";
const roleOf = (value) => ROLES.includes(value) ? value : "development";
const runtimeOf = (value) => RUNTIMES.includes(value) ? value : "none";
const hostKeyPolicyOf = (value) => value === "strict" ? "strict" : "accept-new";
const cloneConfig = (value) => ({
  servers: (value?.servers || []).map((item) => ({ ...item })),
  bindings: (value?.bindings || []).map((item) => ({ ...item, exclude: Array.isArray(item.exclude) ? [...item.exclude] : [] })),
  preferences: preferencesSchema(value?.preferences)
});
const expandHome = (value) => {
  const input = trim(value);
  if (input === "~") return os.homedir();
  if (input.startsWith("~/")) return path.join(os.homedir(), input.slice(2));
  return input;
};
const parsePort = (value) => {
  const port = Number.parseInt(String(value ?? "22"), 10);
  return Number.isInteger(port) ? port : 22;
};
const streamText = (output) => {
  const body = text(output);
  if (output && output.truncated === true) {
    const spill = output.spillPath ? "; full output: " + output.spillPath : "";
    return body + (body && !body.endsWith("\n") ? "\n" : "") + "[truncated" + spill + "]";
  }
  return body;
};
const shellQuote = (value) => "'" + String(value).replace(/'/g, "'\\''") + "'";
const hasUnsafeUser = (value) => [...value].some((character) => {
  const code = character.charCodeAt(0);
  return code < 33 || code === 127 || "/@\\\"'".includes(character);
});
const hasUnsafeHost = (value) => [...value].some((character) => {
  const code = character.charCodeAt(0);
  return code < 32 || code === 127 || character === " " || character === "@" || character === "/";
});
const argvLine = (args) => args.map((part) => /[\s'"\\]/.test(part) ? shellQuote(part) : part).join(" ");

function assertRemotePath(value) {
  const input = trim(value);
  if (!input) throw new Error("远程项目目录不能为空");
  if (!input.startsWith("/")) throw new Error("远程项目目录必须是绝对路径");
  if (/[\0\n\r]/.test(input)) throw new Error("远程项目目录无效");
  const normalized = path.posix.normalize(input).replace(/\/+$/, "");
  if (!normalized.startsWith("/") || normalized === "/") throw new Error("远程项目目录不能是 /");
  return normalized;
}

function preferencesSchema(value) {
  const input = value && typeof value === "object" ? value : {};
  return {
    role: roleOf(input.role),
    runtime: runtimeOf(input.runtime),
    composeFile: trim(input.composeFile) || DEFAULT_PREFERENCES.composeFile,
    hostKeyPolicy: hostKeyPolicyOf(input.hostKeyPolicy),
    connectTimeout: clampInt(input.connectTimeout, DEFAULT_PREFERENCES.connectTimeout, 1, 120),
    keepAlive: clampInt(input.keepAlive, DEFAULT_PREFERENCES.keepAlive, 0, 600),
    loginShell: input.loginShell === true,
    showSessionChip: input.showSessionChip !== false
  };
}
const excludePattern = (value) => {
  const pattern = trim(value);
  if (!pattern) return "";
  if (pattern.length > MAX_EXCLUDE_LENGTH) return "";
  if (/[\0\n\r]/.test(pattern)) return "";
  return pattern;
};
function normalizeExclude(value) {
  const source = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,]/) : [];
  const patterns = [];
  for (const item of source) {
    const pattern = excludePattern(item);
    if (!pattern || patterns.includes(pattern)) continue;
    patterns.push(pattern);
    if (patterns.length >= MAX_EXCLUDES) break;
  }
  return patterns;
}
function assertExclude(value) {
  const source = (Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,]/) : []).map((item) => trim(item)).filter(Boolean);
  for (const item of source) {
    if (!excludePattern(item)) throw new Error("排除模式无效：每行一个，最长 " + MAX_EXCLUDE_LENGTH + " 字符");
  }
  const pattern = normalizeExclude(source);
  if (pattern.length > MAX_EXCLUDES) throw new Error("排除模式最多 " + MAX_EXCLUDES + " 条");
  return pattern;
}

function settingsSchema(value) {
  const source = value && typeof value === "object" ? value : {};
  const servers = Array.isArray(source.servers) ? source.servers.map((item) => {
    const input = item && typeof item === "object" ? item : {};
    return {
      id: trim(input.id),
      name: trim(input.name),
      host: trim(input.host),
      port: parsePort(input.port),
      username: trim(input.username),
      authMethod: input.authMethod === "key" ? "key" : "agent",
      identityFile: trim(input.identityFile),
      jumpHost: trim(input.jumpHost),
      connectTimeout: (() => {
        const timeout = Number.parseInt(String(input.connectTimeout ?? "8"), 10);
        if (!Number.isInteger(timeout)) return 8;
        return Math.min(Math.max(timeout, 1), 120);
      })(),
      hostKeyPolicy: input.hostKeyPolicy === "strict" ? "strict" : "accept-new",
      keepAlive: clampInt(input.keepAlive, 0, 0, 600),
      loginShell: input.loginShell === true,
      panel: panelOf(input.panel)
    };
  }) : [];
  const bindings = Array.isArray(source.bindings) ? source.bindings.map((item) => {
    const input = item && typeof item === "object" ? item : {};
    let remotePath = trim(input.remotePath);
    try {
      if (remotePath) remotePath = assertRemotePath(remotePath);
    } catch {
      remotePath = trim(input.remotePath);
    }
    return {
      id: trim(input.id),
      workspaceId: trim(input.workspaceId),
      serverId: trim(input.serverId),
      role: roleOf(input.role),
      remotePath,
      runtime: runtimeOf(input.runtime),
      composeFile: trim(input.composeFile),
      containerProject: trim(input.containerProject),
      exclude: normalizeExclude(input.exclude),
      isDefault: input.isDefault === true
    };
  }) : [];
  return { servers, bindings, preferences: preferencesSchema(source.preferences) };
}
settingsSchema.toJSON = () => ({
  type: "object",
  properties: {
    servers: { type: "array" },
    bindings: { type: "array" },
    preferences: { type: "object" }
  }
});

function assertServer(input) {
  const rawPort = trim(input?.port);
  if (rawPort && !/^\d+$/.test(rawPort)) throw new Error("端口必须是 1 到 65535 之间的整数");
  const server = settingsSchema({ servers: [input] }).servers[0];
  if (!server.name) throw new Error("服务器名称不能为空");
  if (server.name.length > 60) throw new Error("服务器名称不能超过 60 个字符");
  if (!server.host || hasUnsafeHost(server.host)) throw new Error("主机名无效");
  if (!server.username || hasUnsafeUser(server.username)) throw new Error("用户名无效");
  if (!Number.isInteger(server.port) || server.port < 1 || server.port > 65535) throw new Error("端口必须是 1 到 65535 之间的整数");
  if (server.authMethod === "key" && !server.identityFile) throw new Error("私钥认证需要填写私钥文件路径");
  if (server.identityFile) {
    const identityFile = expandHome(server.identityFile);
    if (!identityFile || identityFile.startsWith("-")) throw new Error("私钥文件路径无效");
  }
  if (server.jumpHost) {
    if (/[\s'"\\]/.test(server.jumpHost) || [...server.jumpHost].some((character) => character.charCodeAt(0) < 32 || character.charCodeAt(0) === 127)) {
      throw new Error("跳板机无效");
    }
  }
  return server;
}
function assertBinding(input) {
  const binding = settingsSchema({ bindings: [input] }).bindings[0];
  if (!binding.workspaceId || !binding.serverId) {
    throw new Error("Workspace、服务器和远程项目目录不能为空");
  }
  binding.remotePath = assertRemotePath(binding.remotePath);
  binding.exclude = assertExclude(input?.exclude);
  return binding;
}
function formatHost(host) {
  return host.includes(":") && !host.startsWith("[") ? "[" + host + "]" : host;
}
function sshArgv(server) {
  const identityFile = expandHome(server.identityFile);
  const timeout = Number.isInteger(server.connectTimeout) ? String(server.connectTimeout) : "8";
  const args = [
    "ssh",
    "-o", "BatchMode=yes",
    "-o", "ConnectTimeout=" + timeout,
    "-o", "ConnectionAttempts=1",
    "-o", "LogLevel=ERROR",
    "-o", "StrictHostKeyChecking=" + (server.hostKeyPolicy === "accept-new" ? "accept-new" : "yes"),
    "-p", String(server.port)
  ];
  if (server.jumpHost) args.push("-o", "ProxyJump=" + server.jumpHost);
  if (Number.isInteger(server.keepAlive) && server.keepAlive > 0) {
    args.push("-o", "ServerAliveInterval=" + server.keepAlive, "-o", "ServerAliveCountMax=3");
  }
  if (identityFile) {
    if (identityFile.startsWith("-")) throw new Error("私钥文件路径无效");
    args.push("-o", "IdentitiesOnly=yes", "-i", identityFile);
  }
  args.push(server.username + "@" + formatHost(server.host));
  return args;
}
function loginShellCommand(command) {
  const quoted = shellQuote(command);
  return "if command -v bash >/dev/null 2>&1; then exec bash -lc " + quoted + "; else exec sh -lc " + quoted + "; fi";
}
function sshCommand(server, remoteCommand) {
  const body = server?.loginShell === true ? loginShellCommand(remoteCommand) : remoteCommand;
  return [...sshArgv(server), body].map(shellQuote).join(" ");
}
function toolOutput() {
  return {
    schema: {
      type: "object",
      additionalProperties: false,
      properties: { text: { type: "string" } },
      required: ["text"]
    },
    render(_args, value) {
      return [{ type: "text", text: value.text }];
    }
  };
}

const targetProperties = {
  server: { type: "string", description: "Host id, name, or hostname when not using a binding." },
  remotePath: { type: "string", description: "Absolute remote directory when not using a binding. Must not be /." },
  bindingId: { type: "string", description: "Optional binding id from ssh_status." },
  role: { type: "string", enum: [...ROLES], description: "Optional environment: development, staging, or production." }
};
const sandboxProperties = {
  sandbox_permissions: {
    type: "string",
    enum: [...ESCALATION_MODES],
    description: "Retry once with the narrowest wider mode after a sandbox denial. SSH typically needs danger-full-access for ~/.ssh and the network."
  },
  justification: {
    type: "string",
    description: "One sentence for the user explaining why this SSH call needs the wider access."
  }
};

function registerTool(ctx, options) {
  const required = Array.isArray(options.parameters?.required) ? options.parameters.required : [];
  const execute = options.execute;
  ctx.tools.register({
    ...options,
    async execute(args, exec) {
      const missing = required.filter((key) => args == null || args[key] === undefined);
      if (missing.length) throw new Error("invalid arguments: missing " + missing.join(", "));
      return execute(args, exec);
    }
  });
}

function apply(ctx) {
  const scope = ctx.settings.register(NS, settingsSchema, { base: EMPTY });
  let sequence = 0;
  let writeTail = Promise.resolve();
  const getConfig = () => cloneConfig(scope.get());
  const listWorkspaces = () => ctx.workspaceRegistry.list().map((workspace) => ({
    id: String(workspace.id),
    title: String(workspace.title ?? workspace.name ?? workspace.id),
    path: String(workspace.path ?? "")
  }));
  const describeTarget = (binding, config, workspaces) => {
    const server = config.servers.find((item) => item.id === binding.serverId);
    const workspace = workspaces.find((item) => item.id === binding.workspaceId);
    return {
      ...binding,
      serverName: server ? server.name : "",
      serverHost: server ? server.username + "@" + server.host + ":" + server.port : "",
      workspaceTitle: workspace ? workspace.title : "",
      workspacePath: workspace ? workspace.path : "",
      missingServer: !server,
      missingWorkspace: !workspace
    };
  };
  const getState = () => {
    const config = getConfig();
    const workspaces = listWorkspaces();
    return {
      servers: config.servers,
      bindings: config.bindings,
      preferences: config.preferences,
      workspaces,
      targets: config.bindings.map((binding) => describeTarget(binding, config, workspaces))
    };
  };
  const mutate = (mutator) => {
    const run = writeTail.catch(() => undefined).then(async () => {
      const config = getConfig();
      mutator(config);
      await scope.replace(cloneConfig(config));
      return getState();
    });
    writeTail = run.then(() => undefined, () => undefined);
    return run;
  };
  const getServer = (id) => {
    const server = getConfig().servers.find((item) => item.id === id);
    if (!server) throw new Error("未知服务器");
    return server;
  };
  const standingPolicy = (exec) => {
    const policy = ctx.get("sandboxPolicy");
    if (policy === undefined) return undefined;
    if (exec?.agent?.session) return policy.resolve({ session: exec.agent.session });
    return policy.resolve({ mode: "danger-full-access" });
  };
  const resolveCallPolicy = async (request, exec, toolName) => {
    const requested = request?.sandbox_permissions;
    const justification = request?.justification;
    const standing = standingPolicy(exec);
    if (standing === undefined) {
      if (requested !== undefined || justification !== undefined) {
        throw new Error("sandbox_permissions is not available in this composition (no sandboxing executor to escalate)");
      }
      return undefined;
    }
    validateEscalationArgs(requested, justification);
    if (requested === undefined) return standing;
    const mode = await approveEscalation({
      requestedMode: requested,
      justification,
      effectiveMode: standing.mode,
      subject: "ssh command"
    }, {
      approver: ctx.get("approval"),
      agent: exec?.agent,
      callId: exec?.callId,
      toolName,
      signal: exec?.signal
    });
    return { ...standing, mode };
  };
  const approveDestructive = async (exec, toolName, reason) => {
    if (!exec?.agent) throw new Error("destructive SSH action requires an agent turn");
    const approval = ctx.get("approval");
    if (approval === undefined) throw new Error("destructive SSH action requires approval, but no approval service is composed");
    const outcome = await approval.request({
      agent: exec.agent,
      toolName,
      callId: exec.callId,
      reason,
      ...exec.signal ? { signal: exec.signal } : {}
    });
    if (outcome !== "allowed-once") throw new Error("user did not allow this destructive SSH action (" + outcome + ")");
  };
  const runShell = async (command, timeoutMs, signal, policy) => {
    const result = await ctx.shell.run(ctx.shell.resolve({
      command,
      timeoutMs,
      stdoutMaxBytes: 120000,
      ...policy !== undefined ? { sandboxPolicy: policy } : {},
      ...signal ? { signal } : {}
    }));
    const stdout = streamText(result?.stdout);
    const stderr = streamText(result?.stderr);
    const denied = result?.sandbox?.denied === true;
    return {
      ok: result?.exitCode === 0 && result?.timedOut !== true && result?.aborted !== true && !denied,
      exitCode: Number.isInteger(result?.exitCode) ? result.exitCode : null,
      timedOut: result?.timedOut === true,
      aborted: result?.aborted === true,
      denied,
      sandboxMode: result?.sandbox?.mode || "",
      stdout,
      stderr
    };
  };
  const runRemote = (server, remoteCommand, timeoutMs, signal, policy) => runShell(sshCommand(server, remoteCommand), timeoutMs, signal, policy);
  const formatRun = (result, policy) => {
    let body = result.stdout || "";
    if (result.stderr) body += (body && !body.endsWith("\n") ? "\n" : "") + "[stderr]\n" + result.stderr;
    const markers = [];
    if (result.denied) {
      markers.push(sandboxDenialMarker(result.sandboxMode || policy?.mode || "unknown"));
      if (policy?.mode && policy.mode !== "danger-full-access") markers.push(escalationHintMarker("ssh command"));
    }
    if (result.timedOut) markers.push("[timed out]");
    if (result.aborted) markers.push("[aborted]");
    else if (result.exitCode !== 0 && result.exitCode !== null) markers.push("[exit code: " + result.exitCode + "]");
    if (!body && markers.length === 0) body = "(no output)";
    return {
      ...result,
      text: body + (markers.length ? (body && !body.endsWith("\n") ? "\n" : "") + markers.join("\n") : "")
    };
  };
  const workspaceById = (id) => listWorkspaces().find((item) => item.id === id);
  const workspaceForAgent = (agent) => {
    const session = agent?.session;
    if (!session) return undefined;
    const sid = String(session.id);
    const cwd = session.header?.cwd ? String(session.header.cwd) : "";
    const workspaces = listWorkspaces();
    const owned = ctx.workspaceRegistry.list().find((workspace) => (workspace.sessionIds || []).some((item) => String(item) === sid));
    if (owned) return workspaces.find((item) => item.id === String(owned.id));
    if (cwd) return workspaces.find((item) => item.path === cwd);
    return undefined;
  };
  const findServer = (ref) => {
    const id = trim(ref);
    if (!id) return undefined;
    const servers = getConfig().servers;
    return servers.find((item) => item.id === id)
      || servers.find((item) => item.name === id)
      || servers.find((item) => item.host === id)
      || servers.find((item) => item.username + "@" + item.host === id);
  };
  const resolveBinding = (request, agent) => {
    const input = request && typeof request === "object" ? request : {};
    const config = getConfig();
    const bindingId = trim(input.bindingId);
    if (bindingId) {
      const binding = config.bindings.find((item) => item.id === bindingId);
      if (!binding) throw new Error("未知关联");
      return binding;
    }
    let workspaceId = trim(input.workspaceId);
    if (!workspaceId) {
      const workspace = workspaceForAgent(agent);
      if (workspace) workspaceId = workspace.id;
    }
    if (!workspaceId) throw new Error("当前会话没有 Workspace。传 server + remotePath，或先 ssh_bind。");
    const candidates = config.bindings.filter((item) => item.workspaceId === workspaceId);
    if (!candidates.length) throw new Error("这个 Workspace 还没有 SSH 关联。用 ssh_bind 记下 host 和 remotePath，不要让用户去设置页填表。");
    const role = trim(input.role);
    if (role) {
      const matched = candidates.find((item) => item.role === role);
      if (!matched) throw new Error("这个 Workspace 没有 " + role + " 环境的 SSH 关联");
      return matched;
    }
    return candidates.find((item) => item.isDefault) || candidates[0];
  };
  const resolvePair = (request, agent) => {
    const input = request && typeof request === "object" ? request : {};
    const serverRef = trim(input.serverId || input.server);
    const remotePath = trim(input.remotePath);
    const workspace = trim(input.workspaceId) ? workspaceById(input.workspaceId) : workspaceForAgent(agent);
    if (serverRef) {
      const server = findServer(serverRef);
      if (!server) throw new Error("未知服务器 " + serverRef + "。主机只能由用户在设置 → SSH 远程里添加。");
      if (remotePath) {
        return {
          binding: {
            id: "",
            workspaceId: workspace ? workspace.id : "",
            serverId: server.id,
            role: roleOf(input.role),
            remotePath: assertRemotePath(remotePath),
            runtime: runtimeOf(input.runtime),
            composeFile: trim(input.composeFile),
            containerProject: trim(input.containerProject),
            exclude: normalizeExclude(input.exclude),
            isDefault: false
          },
          server,
          workspace
        };
      }
    }
    const binding = resolveBinding(request, agent);
    const server = getServer(binding.serverId);
    return {
      binding: { ...binding, remotePath: assertRemotePath(binding.remotePath) },
      server,
      workspace: workspaceById(binding.workspaceId) || workspace
    };
  };
  const remoteInProject = (binding, script) => "mkdir -p " + shellQuote(binding.remotePath) + " && cd " + shellQuote(binding.remotePath) + " && " + script;
  const inspectServer = async (serverId, exec, request) => {
    const server = getServer(trim(serverId));
    const policy = await resolveCallPolicy(request, exec, "ssh_inspect");
    const script = [
      "printf 'OS=%s\\n' \"$( (. /etc/os-release 2>/dev/null; printf %s \"${PRETTY_NAME:-unknown}\") )\"",
      "printf 'KERNEL=%s\\n' \"$(uname -sr 2>/dev/null || printf unknown)\"",
      "if command -v docker >/dev/null 2>&1; then printf 'RUNTIME=docker\\n'; printf 'RUNTIME_VERSION=%s\\n' \"$(docker --version 2>/dev/null | head -n 1)\";",
      "elif command -v podman >/dev/null 2>&1; then printf 'RUNTIME=podman\\n'; printf 'RUNTIME_VERSION=%s\\n' \"$(podman --version 2>/dev/null | head -n 1)\";",
      "else printf 'RUNTIME=none\\n'; printf 'RUNTIME_VERSION=\\n'; fi",
      "panels=",
      "if [ -d /www/server/panel ]; then panels=\"$panels baota-or-aapanel\"; fi",
      "if [ -d /opt/1panel ] || command -v 1pctl >/dev/null 2>&1; then panels=\"$panels 1panel\"; fi",
      "if [ -d /usr/local/psa ]; then panels=\"$panels plesk\"; fi",
      "if [ -d /usr/local/cpanel ]; then panels=\"$panels cpanel\"; fi",
      "printf 'PANELS=%s\\n' \"$(printf %s \"$panels\" | sed 's/^ //')\""
    ].join("; ");
    const result = formatRun(await runRemote(server, script, 15000, exec?.signal, policy), policy);
    const fields = {};
    for (const line of result.stdout.split("\n")) {
      const index = line.indexOf("=");
      if (index > 0) fields[line.slice(0, index)] = line.slice(index + 1);
    }
    return {
      ...result,
      os: fields.OS || "",
      kernel: fields.KERNEL || "",
      runtime: fields.RUNTIME || "none",
      runtimeVersion: fields.RUNTIME_VERSION || "",
      panels: trim(fields.PANELS || "") ? trim(fields.PANELS).split(/\s+/) : []
    };
  };
  const listContainers = async (serverId, exec, request) => {
    const server = getServer(trim(serverId));
    const policy = await resolveCallPolicy(request, exec, "ssh_inspect");
    const script = "if command -v docker >/dev/null 2>&1; then docker ps --format '{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}'; elif command -v podman >/dev/null 2>&1; then podman ps --format '{{.Names}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}'; else printf ''; fi";
    const result = formatRun(await runRemote(server, script, 15000, exec?.signal, policy), policy);
    const containers = result.ok ? result.stdout.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
      const parts = line.split("\t");
      return { name: parts[0] || "", image: parts[1] || "", status: parts[2] || "", ports: parts[3] || "" };
    }) : [];
    return { ...result, containers };
  };
  const execOn = async (request, exec) => {
    const command = trim(request?.command);
    if (!command) throw new Error("远程命令不能为空");
    const { binding, server } = resolvePair(request, exec?.agent);
    const timeoutMs = Number.isFinite(request?.timeoutMs) ? Math.min(Math.max(Number(request.timeoutMs), 1000), 300000) : 30000;
    const policy = await resolveCallPolicy(request, exec, "ssh_exec");
    const result = formatRun(await runRemote(server, remoteInProject(binding, command), timeoutMs, exec?.signal, policy), policy);
    return { ...result, bindingId: binding.id, remotePath: binding.remotePath };
  };
  const hasRsync = async (policy, signal) => {
    const result = await ctx.shell.run(ctx.shell.resolve({
      command: "command -v rsync",
      timeoutMs: 5000,
      ...policy !== undefined ? { sandboxPolicy: policy } : {},
      ...signal ? { signal } : {}
    }));
    return result?.exitCode === 0;
  };
  const syncOn = async (request, exec) => {
    const { binding, server, workspace } = resolvePair(request, exec?.agent);
    if (!workspace) throw new Error("当前会话没有 Workspace，无法同步。ssh_sync 需要本地路径。");
    if (!workspace.path) throw new Error("Workspace 没有本地路径");
    const timeoutMs = Number.isFinite(request?.timeoutMs) ? Math.min(Math.max(Number(request.timeoutMs), 5000), 600000) : 180000;
    const deleteExtra = request?.deleteExtra === true;
    const excludes = normalizeExclude([...(binding.exclude || []), ...normalizeExclude(request?.exclude)]);
    if (deleteExtra) await approveDestructive(exec, "ssh_sync", "rsync --delete " + workspace.path + " → " + server.name + ":" + binding.remotePath);
    const policy = await resolveCallPolicy(request, exec, "ssh_sync");
    const mkdir = await runRemote(server, "mkdir -p " + shellQuote(binding.remotePath), 15000, exec?.signal, policy);
    if (!mkdir.ok) return { ...formatRun(mkdir, policy), bindingId: binding.id, method: "mkdir", localPath: workspace.path, remotePath: binding.remotePath };
    if (await hasRsync(policy, exec?.signal)) {
      const dest = server.username + "@" + formatHost(server.host) + ":" + binding.remotePath.replace(/\/?$/, "/");
      const args = ["rsync", "-az"];
      if (deleteExtra) args.push("--delete");
      for (const pattern of excludes) args.push("--exclude", pattern);
      args.push("-e", argvLine(sshArgv(server).slice(0, -1)), workspace.path.replace(/\/?$/, "/"), dest);
      const result = formatRun(await runShell(args.map(shellQuote).join(" "), timeoutMs, exec?.signal, policy), policy);
      return { ...result, bindingId: binding.id, method: "rsync", localPath: workspace.path, remotePath: binding.remotePath, excludes };
    }
    if (deleteExtra) throw new Error("删除远端多余文件需要本机安装 rsync");
    const archive = [
      "tar -C", shellQuote(workspace.path), excludes.map((pattern) => "--exclude=" + shellQuote(pattern)).join(" "), "-czf - .",
      "|",
      sshCommand(server, "mkdir -p " + shellQuote(binding.remotePath) + " && tar -C " + shellQuote(binding.remotePath) + " -xzf -")
    ].filter(Boolean).join(" ");
    const result = formatRun(await runShell(archive, timeoutMs, exec?.signal, policy), policy);
    return { ...result, bindingId: binding.id, method: "tar", localPath: workspace.path, remotePath: binding.remotePath, excludes };
  };
  const composeOn = async (request, exec) => {
    const action = trim(request?.action);
    if (!COMPOSE_ACTIONS.includes(action)) throw new Error("compose action 必须是 ps、logs、up 或 down");
    const { binding, server } = resolvePair(request, exec?.agent);
    const runtime = trim(request?.runtime) ? runtimeOf(request.runtime) : binding.runtime;
    if (runtime === "none") throw new Error("没有容器运行时。ssh_compose 传 runtime: docker 或 podman，或先 ssh_bind 写上 runtime。");
    if (action === "down") await approveDestructive(exec, "ssh_compose", "compose down on " + server.name + ":" + binding.remotePath);
    const file = trim(request?.composeFile) || binding.composeFile || "docker-compose.yml";
    const project = binding.containerProject ? " -p " + shellQuote(binding.containerProject) : "";
    const fileArg = " -f " + shellQuote(file);
    const tail = Number.isInteger(request?.tail) ? Math.min(Math.max(request.tail, 20), 500) : 120;
    const verb = action === "logs" ? "logs --no-color --tail=" + tail : action === "up" ? "up -d" : action;
    const bin = runtime === "podman"
      ? "if podman compose version >/dev/null 2>&1; then podman compose" + fileArg + project + " " + verb + "; elif command -v podman-compose >/dev/null 2>&1; then podman-compose" + fileArg + project + " " + verb + "; else printf 'podman compose 不可用\\n'; exit 127; fi"
      : "if docker compose version >/dev/null 2>&1; then docker compose" + fileArg + project + " " + verb + "; elif command -v docker-compose >/dev/null 2>&1; then docker-compose" + fileArg + project + " " + verb + "; else printf 'docker compose 不可用\\n'; exit 127; fi";
    const timeoutMs = action === "logs" || action === "ps" ? 20000 : 180000;
    const policy = await resolveCallPolicy(request, exec, "ssh_compose");
    const result = formatRun(await runRemote(server, remoteInProject(binding, bin), timeoutMs, exec?.signal, policy), policy);
    return { ...result, bindingId: binding.id, action, remotePath: binding.remotePath };
  };
  const applyBinding = (config, next) => {
    if (!config.servers.some((item) => item.id === next.serverId)) throw new Error("服务器不存在");
    const same = config.bindings.find((item) => item.workspaceId === next.workspaceId && item.serverId === next.serverId && item.role === next.role);
    if (same && next.id && same.id !== next.id) throw new Error("同一 Workspace、服务器和环境只能有一条关联");
    const id = next.id || same?.id || "binding-" + Date.now() + "-" + (++sequence);
    const value = { ...next, id };
    const index = config.bindings.findIndex((item) => item.id === id);
    if (index < 0) config.bindings.push(value);
    else config.bindings[index] = value;
    if (value.isDefault) {
      config.bindings = config.bindings.map((item) => item.workspaceId === value.workspaceId && item.id !== id ? { ...item, isDefault: false } : item);
    }
    return value;
  };
  const bindOn = async (request, agent) => {
    const workspace = trim(request?.workspaceId) ? workspaceById(request.workspaceId) : workspaceForAgent(agent);
    if (!workspace) throw new Error("当前会话没有 Workspace，无法绑定");
    const server = findServer(request?.server || request?.serverId);
    if (!server) throw new Error("未知服务器。主机只能由用户在设置 → SSH 远程添加。");
    const preferences = getConfig().preferences;
    const role = trim(request?.role) ? roleOf(request.role) : preferences.role;
    const runtime = trim(request?.runtime) ? runtimeOf(request.runtime) : preferences.runtime;
    const existingForWorkspace = getConfig().bindings.filter((item) => item.workspaceId === workspace.id);
    const same = existingForWorkspace.find((item) => item.serverId === server.id && item.role === role);
    let isDefault;
    if (request?.isDefault === true) isDefault = true;
    else if (request?.isDefault === false) isDefault = false;
    else if (same) isDefault = same.isDefault === true;
    else isDefault = existingForWorkspace.length === 0;
    const next = assertBinding({
      workspaceId: workspace.id,
      serverId: server.id,
      remotePath: request?.remotePath,
      role,
      runtime,
      composeFile: trim(request?.composeFile) || (runtime === "none" ? "" : preferences.composeFile),
      containerProject: request?.containerProject,
      exclude: request?.exclude,
      isDefault
    });
    const state = await mutate((config) => {
      applyBinding(config, next);
    });
    return {
      text: "bound " + workspace.title + " → " + server.name + ":" + next.remotePath + " (" + next.role + ")" + (isDefault ? " (default)" : ""),
      state
    };
  };
  const describeStatus = (agent, workspaceId) => {
    const state = getState();
    const current = workspaceId ? workspaceById(workspaceId) : workspaceForAgent(agent);
    const lines = ["SSH is available. Humans only add hosts in Settings → SSH 远程. You bind, exec, sync, and compose."];
    if (!state.servers.length) {
      lines.push("Hosts: (none). Ask the user to add an SSH host in settings. Do not invent credentials.");
      return lines.join("\n");
    }
    lines.push("Hosts:");
    for (const server of state.servers) {
      lines.push("- " + server.name + " " + server.username + "@" + server.host + ":" + server.port + " [" + server.id + "]");
    }
    if (state.targets.length) {
      lines.push("Bindings:");
      for (const target of state.targets) {
        const mark = current && target.workspaceId === current.id ? "*" : " ";
        lines.push(mark + " " + (target.workspaceTitle || target.workspaceId) + " · " + target.role + " → " + (target.serverName || target.serverId) + ":" + target.remotePath + (target.isDefault ? " (default)" : "") + " [" + target.id + "]");
      }
    } else lines.push("Bindings: (none)");
    if (current) {
      lines.push("Current workspace: " + current.title + " (" + current.path + ")");
      const mine = state.targets.filter((item) => item.workspaceId === current.id);
      if (!mine.length) lines.push("This workspace is unbound. Use ssh_bind with a host and remotePath (infer from the user or ls the server). Do not send the user to the binding form.");
      else {
        const target = mine.find((item) => item.isDefault) || mine[0];
        lines.push("Default target: " + target.serverName + ":" + target.remotePath + " [" + target.id + "]");
      }
    } else lines.push("Current workspace: (none)");
    return lines.join("\n");
  };

  const service = {
    getState,
    saveServer(server) {
      const next = assertServer(server);
      return mutate((config) => {
        const id = next.id || "server-" + Date.now() + "-" + (++sequence);
        const value = { ...next, id };
        const index = config.servers.findIndex((item) => item.id === id);
        if (index < 0) config.servers.push(value);
        else config.servers[index] = value;
      });
    },
    deleteServer(serverId) {
      const id = trim(serverId);
      return mutate((config) => {
        config.servers = config.servers.filter((item) => item.id !== id);
        config.bindings = config.bindings.filter((item) => item.serverId !== id);
      });
    },
    saveBinding(binding) {
      const next = assertBinding(binding);
      if (!ctx.workspaceRegistry.get(next.workspaceId)) throw new Error("Workspace 不存在或已被删除");
      return mutate((config) => {
        applyBinding(config, next);
      });
    },
    async deleteBinding(bindingId) {
      const id = trim(bindingId);
      if (!id) throw new Error("关联 id 不能为空");
      return mutate((config) => {
        const before = config.bindings.length;
        config.bindings = config.bindings.filter((item) => item.id !== id);
        if (config.bindings.length === before) throw new Error("未知关联");
      });
    },
    async testConnection(serverId) {
      const policy = await resolveCallPolicy({}, undefined, "testConnection");
      return formatRun(await runRemote(getServer(trim(serverId)), "printf dsh-ssh-ok", 12000, undefined, policy), policy);
    },
    savePreferences(preferences) {
      return mutate((config) => {
        config.preferences = preferencesSchema(preferences);
      });
    },
    async inspectServer(serverId, containers) {
      const id = trim(serverId);
      const result = await inspectServer(id, undefined, {});
      if (containers !== true) return { ...result, containers: [] };
      const listed = await listContainers(id, undefined, {});
      return { ...result, containers: listed.containers, containersOk: listed.ok, containersText: listed.text };
    }
  };
  service.typertRemote = { service, serviceKey: SERVICE, namespace: SERVICE };
  ctx.provide(SERVICE, service);
  ctx.typert.register(TYPERT);

  registerTool(ctx, {
    name: "ssh_status",
    description: "List configured SSH hosts and workspace bindings. Call this when the user mentions a server, deploy, 远端, or 服务器. Humans only add hosts; you create bindings.",
    parameters: {
      type: "object",
      properties: {
        workspaceId: { type: "string", description: "Optional workspace id. Defaults to the current session workspace." }
      }
    },
    timeoutMs: 8000,
    isConcurrencySafe: () => true,
    output: toolOutput(),
    async execute(args, exec) {
      return { text: describeStatus(exec.agent, trim(args?.workspaceId)) };
    }
  });
  registerTool(ctx, {
    name: "ssh_bind",
    description: "Remember that this workspace deploys to a configured SSH host + remotePath. You should do this; do not ask the user to fill the settings binding form. The first bind for a workspace becomes default; later binds keep the existing default unless isDefault is true.",
    parameters: {
      type: "object",
      properties: {
        server: { type: "string", description: "Host id, name, or hostname from ssh_status." },
        remotePath: { type: "string", description: "Absolute project directory on the server. Must not be /." },
        role: { type: "string", enum: [...ROLES], description: "development, staging, or production. Default development." },
        runtime: { type: "string", enum: [...RUNTIMES], description: "docker, podman, or none." },
        composeFile: { type: "string", description: "Compose file name if the project uses one." },
        containerProject: { type: "string", description: "Optional compose project name." },
        exclude: {
          type: "array",
          items: { type: "string" },
          description: "Optional rsync/tar exclude patterns for ssh_sync, e.g. node_modules, .git, dist."
        },
        workspaceId: { type: "string", description: "Defaults to the current session workspace." },
        isDefault: { type: "boolean", description: "If true, this bind becomes the workspace default. If omitted, only the first bind for the workspace is default." }
      },
      required: ["server", "remotePath"]
    },
    timeoutMs: 8000,
    output: toolOutput(),
    async execute(args, exec) {
      const result = await bindOn(args, exec.agent);
      return { text: result.text };
    }
  });
  registerTool(ctx, {
    name: "ssh_unbind",
    description: "Remove one SSH workspace binding by id from ssh_status.",
    parameters: {
      type: "object",
      properties: {
        bindingId: { type: "string", description: "Binding id to remove." }
      },
      required: ["bindingId"]
    },
    timeoutMs: 8000,
    output: toolOutput(),
    async execute(args) {
      await service.deleteBinding(args.bindingId);
      return { text: "removed binding " + trim(args.bindingId) };
    }
  });
  registerTool(ctx, {
    name: "ssh_exec",
    description: "Run a command on a configured SSH host, after cd into the project directory. Uses this workspace's binding, or pass server + remotePath. Prefer this over ad-hoc bash ssh. After a sandbox denial, retry once with sandbox_permissions + justification.",
    parameters: {
      type: "object",
      properties: {
        command: { type: "string", description: "Remote shell command, run after cd into the bound project directory." },
        ...targetProperties,
        timeoutMs: { type: "number", description: "Timeout in milliseconds (1s–300s)." },
        ...sandboxProperties
      },
      required: ["command"]
    },
    timeoutMs: 310000,
    output: toolOutput(),
    async execute(args, exec) {
      const result = await execOn(args, exec);
      return { text: result.text };
    }
  });
  registerTool(ctx, {
    name: "ssh_sync",
    description: "Push the local workspace directory to the bound remote project directory (rsync -az, or tar if rsync is missing). deleteExtra requires user approval. After a sandbox denial, retry once with sandbox_permissions + justification.",
    parameters: {
      type: "object",
      properties: {
        ...targetProperties,
        deleteExtra: { type: "boolean", description: "If true, delete remote files that do not exist locally. Requires rsync and user approval." },
        exclude: {
          type: "array",
          items: { type: "string" },
          description: "Extra exclude patterns for this push; merged with the binding's own list."
        },
        timeoutMs: { type: "number", description: "Timeout in milliseconds (5s–600s)." },
        ...sandboxProperties
      }
    },
    timeoutMs: 610000,
    output: toolOutput(),
    async execute(args, exec) {
      const result = await syncOn(args, exec);
      return { text: (result.ok ? "synced via " + result.method : "sync failed") + "\n" + result.localPath + " → " + result.remotePath + "\n" + result.text };
    }
  });
  registerTool(ctx, {
    name: "ssh_compose",
    description: "Run docker/podman compose in the bound remote project directory. Actions: ps, logs, up, down. down requires user approval. After a sandbox denial, retry once with sandbox_permissions + justification.",
    parameters: {
      type: "object",
      properties: {
        action: { type: "string", enum: [...COMPOSE_ACTIONS], description: "ps, logs, up, or down." },
        ...targetProperties,
        runtime: { type: "string", enum: ["docker", "podman"], description: "docker or podman when not using a binding." },
        composeFile: { type: "string", description: "Compose file; default docker-compose.yml." },
        tail: { type: "integer", description: "Log tail lines for action=logs (20–500)." },
        ...sandboxProperties
      },
      required: ["action"]
    },
    timeoutMs: 190000,
    output: toolOutput(),
    async execute(args, exec) {
      const result = await composeOn(args, exec);
      return { text: result.text };
    }
  });
  registerTool(ctx, {
    name: "ssh_inspect",
    description: "Probe a configured SSH host: OS, kernel, container runtime, panel dirs, and running containers. After a sandbox denial, retry once with sandbox_permissions + justification.",
    parameters: {
      type: "object",
      properties: {
        server: { type: "string", description: "Host id, name, or hostname from ssh_status." },
        containers: { type: "boolean", description: "If true, also list running containers." },
        ...sandboxProperties
      },
      required: ["server"]
    },
    timeoutMs: 20000,
    output: toolOutput(),
    async execute(args, exec) {
      const server = findServer(args.server);
      if (!server) throw new Error("未知服务器 " + String(args.server));
      const inspect = await inspectServer(server.id, exec, args);
      let text = inspect.text;
      if (args.containers === true) {
        const listed = await listContainers(server.id, exec, args);
        text += "\n--- containers ---\n" + listed.text;
      }
      return { text };
    }
  });
  ctx.systemPrompt.section({
    name: "tool:ssh-workspace",
    order: 1650,
    text: [
      "SSH remotes: humans only add hosts and keys in Settings → SSH 远程. You own everything else.",
      "Use ssh_status when the user mentions a server, deploy, 远端, or 服务器.",
      "If hosts exist and this workspace is unbound, ssh_bind it yourself after inferring remotePath (user text, repo name, or ssh_exec ls). Do not send the user to the binding form.",
      "The first bind for a workspace is default; later binds do not steal it unless you pass isDefault: true.",
      "Prefer ssh_exec / ssh_sync / ssh_compose / ssh_inspect over ad-hoc bash ssh or rsync. ssh_exec cds into remotePath.",
      "You may pass server + remotePath without a binding. Never invent hosts, passwords, or key files.",
      "SSH needs ~/.ssh and the network. If a call is sandbox-denied, retry that exact call once with sandbox_permissions: danger-full-access and a justification.",
      "ssh_bind also records runtime, composeFile, and exclude patterns (node_modules, .git, ...) used by ssh_sync.",
      "ssh_sync deleteExtra and ssh_compose down ask the user; do not retry them after a rejection."
    ].join(" ")
  });
  ctx.systemPrompt.context({
    name: "ssh-workspace-targets",
    order: 80,
    text: (assemble) => {
      const state = getState();
      if (!state.servers.length && !state.targets.length) return "";
      return describeStatus(assemble?.agent);
    }
  });
}

const name = "dsh-ssh-workspace-manager";
const inject = ["settings", "workspaceRegistry", "shell", "typert", "tools", "systemPrompt"];
const plugin = { name, inject, apply };
export { apply, inject, name };
export default plugin;
