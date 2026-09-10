const PACKAGE = "dsh-ssh-workspace-manager";
const SERVICE = "sshWorkspaceManager";
const pass = Object.freeze({ parse(value) { return value; } });
function codec(symbol) {
  return { mode: "strict", typeSymbol: PACKAGE + "#" + symbol, schema: pass };
}
function descriptor(method, parameters) {
  return {
    id: PACKAGE + "#" + SERVICE + "/" + method,
    service: SERVICE,
    namespace: SERVICE,
    method,
    invocation: { kind: "direct" },
    parameters: parameters.map((name) => ({
      name,
      wire: name,
      source: "json",
      codec: codec(SERVICE + "/" + method + ":" + name)
    })),
    result: codec(SERVICE + "/" + method + ":result")
  };
}
export const TYPERT_REMOTE = {
  package: PACKAGE,
  descriptors: [
    descriptor("getState", []),
    descriptor("saveServer", ["server"]),
    descriptor("deleteServer", ["serverId"]),
    descriptor("saveBinding", ["binding"]),
    descriptor("deleteBinding", ["bindingId"]),
    descriptor("savePreferences", ["preferences"]),
    descriptor("testConnection", ["serverId"]),
    descriptor("inspectServer", ["serverId", "containers"])
  ]
};
export default TYPERT_REMOTE;
