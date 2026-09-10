import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { TYPERT } from "./typert.host.js";
import { TYPERT_REMOTE } from "./typert.remote-client.js";

const source = await readFile(new URL("./client.js", import.meta.url), "utf8");

function loadPlugin() {
  const fakeWindow = { __ModuleLoader__: { load(definition) { fakeWindow.__definition = definition; } } };
  // eslint-disable-next-line no-new-func -- the bundle is a browser script, evaluated against a fake window
  const run = new Function("window", "document", source);
  run(fakeWindow, { querySelector: () => null, createElement: () => ({ dataset: {}, remove() {} }), head: { appendChild() {} } });
  const react = {
    createElement: (...args) => ({ type: args[0], props: args[1], children: args.slice(2) }),
    useState: (initial) => [initial, () => {}],
    useEffect: () => {},
    useCallback: (callback) => callback,
    useMemo: (factory) => factory()
  };
  const definition = fakeWindow.__definition;
  assert.equal(definition.id, "dsh-ssh-workspace-manager");
  return definition.factory((spec) => {
    if (spec === "react") return react;
    throw new Error("unexpected client require: " + spec);
  });
}

const plugin = loadPlugin();
const { normalizePreferences, splitPatterns, groupBindings, runLabel, runTone, typertRemote } = plugin.__internals;

const signature = (descriptor) => descriptor.method + "(" + descriptor.parameters.map((parameter) => parameter.name).join(",") + ")";

test("client, remote and host typert contracts declare the same methods", () => {
  const client = typertRemote.descriptors.map(signature).sort();
  const remote = TYPERT_REMOTE.descriptors.map(signature).sort();
  const host = TYPERT.invocations.map(signature).sort();
  assert.deepEqual(client, host);
  assert.deepEqual(remote, host);
  assert.ok(client.includes("inspectServer(serverId,containers)"));
  assert.ok(client.includes("savePreferences(preferences)"));
});

test("client exports the plugin shape and remote contracts", () => {
  assert.equal(plugin.name, "dsh-ssh-workspace-manager");
  assert.deepEqual(plugin.inject, ["slots", "remote"]);
  assert.equal(typeof plugin.apply, "function");
});

test("normalizePreferences clamps and defaults", () => {
  const prefs = normalizePreferences({ role: "nope", runtime: "docker", connectTimeout: 999, keepAlive: -5, loginShell: 1, showSessionChip: false, composeFile: "  " });
  assert.deepEqual(prefs, {
    role: "development",
    runtime: "docker",
    composeFile: "docker-compose.yml",
    hostKeyPolicy: "accept-new",
    connectTimeout: 120,
    keepAlive: 0,
    loginShell: false,
    showSessionChip: false
  });
  assert.equal(normalizePreferences(undefined).showSessionChip, true);
});

test("splitPatterns accepts commas and newlines", () => {
  assert.deepEqual(splitPatterns(" node_modules ,\n .git\n\ndist "), ["node_modules", ".git", "dist"]);
  assert.deepEqual(splitPatterns(undefined), []);
});

test("groupBindings groups by workspace and sorts by title", () => {
  const targets = [
    { id: "b2", workspaceId: "w2", workspaceTitle: "beta", workspacePath: "/b", remotePath: "/srv/b", serverName: "s2", role: "production" },
    { id: "b1", workspaceId: "w1", workspaceTitle: "alpha", workspacePath: "/a", remotePath: "/srv/a", serverName: "s1", role: "development" },
    { id: "b3", workspaceId: "w1", workspaceTitle: "alpha", workspacePath: "/a", remotePath: "/srv/a2", serverName: "s1", role: "production" },
    { id: "b4", workspaceId: "w9", missingWorkspace: true, remotePath: "/srv/z", serverName: "s1", role: "production" }
  ];
  const groups = groupBindings(targets, "");
  assert.deepEqual(groups.map((group) => group.title), ["alpha", "beta", "已删除的 Workspace"]);
  assert.equal(groups[0].items.length, 2);
  assert.equal(groups[0].path, "/a");
  assert.equal(groups[2].missing, true);
  const filtered = groupBindings(targets, "alpha");
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].items.length, 2);
  assert.equal(groupBindings(targets, "srv/a2")[0].items.length, 1);
});

test("run labels cover success, failure, timeout and sandbox denial", () => {
  assert.equal(runLabel({ ok: true }), "成功");
  assert.equal(runTone({ ok: true }), "ok");
  assert.equal(runLabel({ ok: false, exitCode: 2 }), "失败 exit 2");
  assert.equal(runTone({ ok: false, exitCode: 2 }), "error");
  assert.equal(runLabel({ ok: false, timedOut: true }), "超时");
  assert.equal(runTone({ ok: false, timedOut: true }), "warn");
  assert.equal(runLabel({ ok: false, denied: true }), "被沙箱拒绝");
  assert.equal(runLabel({ ok: false, aborted: true }), "已中止");
});
