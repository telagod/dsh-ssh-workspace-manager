import test from "node:test";
import assert from "node:assert/strict";
import { apply } from "./index.js";
import { TYPERT } from "./typert.host.js";

const SERVERS = [{
  id: "s1",
  name: "38",
  host: "1.2.3.4",
  port: 22,
  username: "user1",
  authMethod: "agent",
  identityFile: "",
  jumpHost: "bastion.example.com",
  connectTimeout: 8,
  hostKeyPolicy: "strict",
  panel: "baota",
  keepAlive: 30,
  loginShell: true
}];
const BINDINGS = [{
  id: "b1",
  workspaceId: "w1",
  serverId: "s1",
  role: "production",
  remotePath: "/srv/app",
  runtime: "docker",
  composeFile: "docker-compose.yml",
  containerProject: "",
  exclude: ["node_modules", ".git"],
  isDefault: true
}];
const WORKSPACES = [
  { id: "w1", title: "app", path: "/home/u/app", sessionIds: ["sess-1"] },
  { id: "w2", title: "other", path: "/home/u/other", sessionIds: ["sess-2"] }
];

function harness(options = {}) {
  const state = {
    config: {
      servers: structuredClone(options.servers === undefined ? SERVERS : options.servers),
      bindings: structuredClone(options.bindings === undefined ? BINDINGS : options.bindings),
      preferences: options.preferences || {}
    }
  };
  const tools = new Map();
  const provided = new Map();
  const shellCalls = [];
  const shellResult = options.shellResult || (() => ({ exitCode: 0, stdout: { text: "ok" }, stderr: { text: "" } }));
  const ctx = {
    settings: {
      register(_ns, schema, opts) {
        return {
          get() {
            return schema(state.config === undefined ? opts.base : state.config);
          },
          async replace(value) {
            state.config = structuredClone(value);
          }
        };
      }
    },
    workspaceRegistry: {
      list: () => options.workspaces === undefined ? WORKSPACES : options.workspaces,
      get: (id) => (options.workspaces === undefined ? WORKSPACES : options.workspaces).find((item) => String(item.id) === String(id))
    },
    shell: {
      resolve: (spec) => spec,
      async run(spec) {
        shellCalls.push(spec);
        return shellResult(spec);
      }
    },
    tools: { register(definition) { tools.set(definition.name, definition); } },
    systemPrompt: { section() {}, context() {} },
    typert: { register() {} },
    provide(key, value) { provided.set(key, value); },
    get(name) { return options.services ? options.services[name] : undefined; }
  };
  apply(ctx);
  const agent = { session: { id: "sess-1", header: { cwd: "/home/u/app" } } };
  const exec = (callId) => ({ agent, callId: callId || "call-1" });
  return { state, tools, provided, shellCalls, service: provided.get("sshWorkspaceManager"), exec };
}

test("the host service implements every typert method", () => {
  const h = harness();
  for (const invocation of TYPERT.invocations) {
    assert.equal(typeof h.service[invocation.method], "function", invocation.method + " is missing on the service");
  }
});

test("ssh_status lists hosts, bindings and the current workspace", async () => {
  const h = harness();
  const result = await h.tools.get("ssh_status").execute({}, h.exec());
  assert.match(result.text, /38 user1@1\.2\.3\.4:22/);
  assert.match(result.text, /app · production → 38:\/srv\/app \(default\)/);
  assert.match(result.text, /Current workspace: app \(\/home\/u\/app\)/);
  assert.match(result.text, /Default target: 38:\/srv\/app/);
});

test("ssh_bind follows saved preferences and keeps the first default", async () => {
  const h = harness({ preferences: { role: "staging", runtime: "podman", composeFile: "compose.yaml", connectTimeout: 20 } });
  const bind = h.tools.get("ssh_bind");
  const first = await bind.execute({ server: "38", remotePath: "/srv/other" }, { agent: { session: { id: "sess-2", header: { cwd: "/home/u/other" } } } });
  assert.match(first.text, /\(staging\)/);
  const added = h.state.config.bindings.find((item) => item.workspaceId === "w2");
  assert.equal(added.runtime, "podman");
  assert.equal(added.composeFile, "compose.yaml");
  assert.equal(added.isDefault, true);
  assert.equal(h.state.config.preferences.role, "staging");
  const second = await bind.execute({ server: "38", remotePath: "/srv/other-dev", role: "development" }, { agent: { session: { id: "sess-2", header: { cwd: "/home/u/other" } } } });
  assert.doesNotMatch(second.text, /\(default\)/);
  const list = h.state.config.bindings.filter((item) => item.workspaceId === "w2");
  assert.equal(list.length, 2);
  assert.equal(list.filter((item) => item.isDefault).length, 1);
  assert.equal(list.find((item) => item.isDefault).role, "staging");
});

test("ssh_exec applies identity, keepalive, jump host and login shell", async () => {
  const h = harness({ servers: [{ ...SERVERS[0], authMethod: "key", identityFile: "~/.ssh/id_ed25519", port: 2222 }] });
  const result = await h.tools.get("ssh_exec").execute({ command: "echo hi" }, h.exec());
  assert.equal(result.text, "ok");
  const command = h.shellCalls.at(-1).command;
  assert.match(command, /ServerAliveInterval=30/);
  assert.match(command, /ProxyJump=bastion\.example\.com/);
  assert.match(command, /IdentitiesOnly=yes/);
  assert.match(command, /'-p' '2222'/);
  assert.match(command, /bash -lc/);
  assert.match(command, /mkdir -p .*\/srv\/app/);
  assert.match(command, /'StrictHostKeyChecking=yes'/);
});

test("ssh_exec without login shell keeps the remote command unwrapped", async () => {
  const h = harness({ servers: [{ ...SERVERS[0], loginShell: false, keepAlive: 0 }] });
  await h.tools.get("ssh_exec").execute({ command: "echo hi" }, h.exec());
  const command = h.shellCalls.at(-1).command;
  assert.doesNotMatch(command, /bash -lc/);
  assert.doesNotMatch(command, /ServerAliveInterval/);
});

test("ssh_sync passes binding exclude patterns to rsync", async () => {
  const h = harness({
    shellResult(spec) {
      if (spec.command.includes("command -v rsync")) return { exitCode: 0, stdout: { text: "/usr/bin/rsync" } };
      return { exitCode: 0, stdout: { text: "sent" }, stderr: { text: "" } };
    }
  });
  const result = await h.tools.get("ssh_sync").execute({}, h.exec());
  assert.match(result.text, /synced via rsync/);
  const rsync = h.shellCalls.map((call) => call.command).find((command) => command.startsWith("'rsync'"));
  assert.ok(rsync, "rsync command was not run");
  assert.match(rsync, /'--exclude' 'node_modules'/);
  assert.match(rsync, /'--exclude' '\.git'/);
  assert.match(rsync, /'\.git'/);
});

test("ssh_sync merges extra exclude patterns from the call", async () => {
  const h = harness({
    shellResult(spec) {
      if (spec.command.includes("command -v rsync")) return { exitCode: 0, stdout: { text: "/usr/bin/rsync" } };
      return { exitCode: 0, stdout: { text: "sent" }, stderr: { text: "" } };
    }
  });
  await h.tools.get("ssh_sync").execute({ exclude: "dist,cache" }, h.exec());
  const rsync = h.shellCalls.map((call) => call.command).find((command) => command.startsWith("'rsync'"));
  assert.match(rsync, /'--exclude' 'dist'/);
  assert.match(rsync, /'--exclude' 'cache'/);
  assert.match(rsync, /'--exclude' 'node_modules'/);
});

test("saveServer rejects bad ports, hosts and key auth without a key", async () => {
  const h = harness();
  assert.throws(() => h.service.saveServer({ name: "x", host: "1.2.3.4", port: "abc", username: "u" }), /端口/);
  assert.throws(() => h.service.saveServer({ name: "x", host: "bad host", port: 22, username: "u" }), /主机名无效/);
  assert.throws(() => h.service.saveServer({ name: "x", host: "1.2.3.4", port: 22, username: "u", authMethod: "key" }), /私钥/);
  const saved = await h.service.saveServer({ name: "new", host: "5.6.7.8", port: "2200", username: "root", authMethod: "key", identityFile: "~/.ssh/id_ed25519", keepAlive: "45", loginShell: true });
  const server = saved.servers.find((item) => item.name === "new");
  assert.equal(server.port, 2200);
  assert.equal(server.keepAlive, 45);
  assert.equal(server.loginShell, true);
  assert.equal(saved.preferences.keepAlive, 0);
});

test("savePreferences clamps values and getState returns them", async () => {
  const h = harness();
  const state = await h.service.savePreferences({ role: "nope", runtime: "podman", connectTimeout: 999, keepAlive: -3, loginShell: true, showSessionChip: false });
  assert.equal(state.preferences.role, "development");
  assert.equal(state.preferences.runtime, "podman");
  assert.equal(state.preferences.connectTimeout, 120);
  assert.equal(state.preferences.keepAlive, 0);
  assert.equal(state.preferences.loginShell, true);
  assert.equal(state.preferences.showSessionChip, false);
  assert.equal(state.preferences.composeFile, "docker-compose.yml");
  assert.equal((await harness().service.getState()).preferences.composeFile, "docker-compose.yml");
});

test("assertBinding validates exclude lists", async () => {
  const h = harness();
  assert.throws(() => h.service.saveBinding({ workspaceId: "w1", serverId: "s1", role: "development", remotePath: "/srv/x", exclude: ["bad\npattern"] }), /排除模式无效/);
  const state = await h.service.saveBinding({ workspaceId: "w1", serverId: "s1", role: "staging", remotePath: "/srv/x/", exclude: "dist\n.cache, dist" });
  const binding = state.bindings.find((item) => item.role === "staging");
  assert.equal(binding.remotePath, "/srv/x");
  assert.deepEqual(binding.exclude, ["dist", ".cache"]);
});

test("inspectServer parses probe fields from the remote script", async () => {
  const h = harness({
    shellResult: () => ({
      exitCode: 0,
      stdout: { text: "OS=Ubuntu 24.04.1 LTS\nKERNEL=Linux 6.8.0-45-generic\nRUNTIME=docker\nRUNTIME_VERSION=Docker version 27.1.1, build abc\nPANELS=1panel baota-or-aapanel\n" },
      stderr: { text: "" }
    })
  });
  const value = await h.service.inspectServer("s1", false);
  assert.equal(value.ok, true);
  assert.equal(value.os, "Ubuntu 24.04.1 LTS");
  assert.equal(value.kernel, "Linux 6.8.0-45-generic");
  assert.equal(value.runtime, "docker");
  assert.deepEqual(value.panels, ["1panel", "baota-or-aapanel"]);
  assert.deepEqual(value.containers, []);
});

test("ssh_inspect tool reports containers when asked", async () => {
  const h = harness({
    shellResult(spec) {
      if (spec.command.includes("docker ps")) {
        return { exitCode: 0, stdout: { text: "web\tnginx:latest\tUp 2 hours\t0.0.0.0:80->80/tcp\n" }, stderr: { text: "" } };
      }
      return { exitCode: 0, stdout: { text: "OS=Debian\nKERNEL=Linux 6.1\nRUNTIME=docker\nRUNTIME_VERSION=Docker version 27\nPANELS=\n" }, stderr: { text: "" } };
    }
  });
  const result = await h.tools.get("ssh_inspect").execute({ server: "38", containers: true }, h.exec());
  assert.match(result.text, /OS=Debian/);
  assert.match(result.text, /--- containers ---/);
  assert.match(result.text, /web\tnginx:latest/);
  assert.match(result.text, /0\.0\.0\.0:80->80\/tcp/);
});
