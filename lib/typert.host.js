const PACKAGE = "dsh-ssh-workspace-manager";
const SERVICE = "sshWorkspaceManager";
const json = { mode: "src-json" };
const specs = [
  ["getState", []],
  ["saveServer", ["server"]],
  ["deleteServer", ["serverId"]],
  ["saveBinding", ["binding"]],
  ["deleteBinding", ["bindingId"]],
  ["savePreferences", ["preferences"]],
  ["testConnection", ["serverId"]],
  ["inspectServer", ["serverId", "containers"]]
];
const invocations = specs.map(([method, parameters]) => ({
  id: PACKAGE + "#" + SERVICE + "/" + method,
  service: SERVICE,
  namespace: SERVICE,
  method,
  invocation: { kind: "direct" },
  parameters: parameters.map((name) => ({
    name,
    wire: name,
    source: "json",
    codec: json
  })),
  result: json
}));
const members = specs.map(([method, parameters]) => ({
  kind: "method",
  name: method,
  signature: "@Remote('" + method + "') " + method + "(" + parameters.join(", ") + "): Promise<JsonValue>"
}));
export const TYPERT = {
  package: PACKAGE,
  face: "host",
  schemas: [],
  invocations,
  model: {
    services: [{
      description: "Manages SSH hosts. Exec/sync/compose stay on Agent tools, not the browser RPC.",
      summary: "SSH remote host settings service.",
      tags: [],
      jsDoc: "Manages SSH hosts. Exec/sync/compose stay on Agent tools, not the browser RPC.",
      key: SERVICE,
      exportName: "SshWorkspaceManagerService",
      members,
      types: []
    }],
    events: [],
    objects: []
  }
};
export default TYPERT;
