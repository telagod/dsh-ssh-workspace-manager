window.__ModuleLoader__.load({
  id: "dsh-ssh-workspace-manager",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    let React = require("react");
    const h = React.createElement;
    const PACKAGE = "dsh-ssh-workspace-manager";
    const SERVICE = "sshWorkspaceManager";
    const CSS = `
.dsh-ssh-root{box-sizing:border-box;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.4;width:100%;max-width:720px}
.dsh-ssh-root *,.dsh-ssh-root *::before,.dsh-ssh-root *::after{box-sizing:border-box}
.dsh-ssh-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}
.dsh-ssh-title{display:flex;align-items:center;gap:8px;min-width:0}
.dsh-ssh-title-icon{width:26px;height:26px;border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-brand-primary);display:inline-grid;place-items:center;flex:none}
.dsh-ssh-title-icon svg{width:15px;height:15px}
.dsh-ssh-title h2{margin:0;font-size:16px;line-height:23px;font-weight:600}
.dsh-ssh-sub{color:var(--dsw-alias-label-tertiary);font-size:11.5px;line-height:16px;margin-top:1px}
.dsh-ssh-head-actions{display:flex;gap:4px;flex:none}
.dsh-ssh-tabrow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:12px 0 9px;min-height:30px}
.dsh-ssh-tabs{display:inline-flex;align-items:center;gap:2px;padding:2px;border-radius:10px;background:var(--dsw-alias-bg-layer-3);flex:none}
.dsh-ssh-tab{border:0;background:transparent;border-radius:8px;min-height:26px;padding:2px 9px;font:inherit;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;display:inline-flex;align-items:center;gap:5px}
.dsh-ssh-tab svg{width:13px;height:13px;flex:none}
.dsh-ssh-tab:hover{color:var(--dsw-alias-label-primary)}
.dsh-ssh-tab:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
.dsh-ssh-tab-active{background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-primary);font-weight:600}
.dsh-ssh-tabrow-actions{display:flex;align-items:center;gap:6px;min-width:0}
.dsh-ssh-tabpanel{display:grid;gap:8px}
.dsh-ssh-count{display:inline-flex;align-items:center;justify-content:center;min-width:16px;height:16px;padding:0 5px;border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-tertiary);font-size:10.5px;font-weight:500}
.dsh-ssh-tab-active .dsh-ssh-count{background:var(--dsw-alias-bg-layer-2)}
.dsh-ssh-group-head .dsh-ssh-count{background:var(--dsw-alias-bg-layer-3)}
.dsh-ssh-button{box-sizing:border-box;min-height:28px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:12px;padding:3px 9px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;white-space:nowrap;min-width:0}
.dsh-ssh-button svg{width:13px;height:13px;flex:none}
.dsh-ssh-button:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:var(--dsw-alias-border-l3)}
.dsh-ssh-button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px}
.dsh-ssh-button:disabled{opacity:.5;cursor:default}
.dsh-ssh-button-primary{background:var(--dsw-alias-button-primary-fill);border-color:transparent;color:var(--dsw-alias-label-primary-foreground)}
.dsh-ssh-button-primary:hover:not(:disabled){background:var(--dsw-alias-button-primary-hover);border-color:transparent}
.dsh-ssh-button-ghost{border-color:transparent;background:transparent;color:var(--dsw-alias-label-secondary)}
.dsh-ssh-button-ghost:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover);border-color:transparent;color:var(--dsw-alias-label-primary)}
.dsh-ssh-button-danger{color:var(--dsw-alias-state-error-primary)}
.dsh-ssh-button-danger:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover-danger)}
.dsh-ssh-button-icon{padding:3px 6px}
.dsh-ssh-badge{display:inline-flex;align-items:center;gap:3px;max-width:100%;min-height:18px;padding:0 6px;border-radius:5px;border:1px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);color:var(--dsw-alias-label-secondary);font-size:10.5px;line-height:16px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dsh-ssh-badge svg{width:10px;height:10px;flex:none}
.dsh-ssh-badge-brand{border-color:transparent;background:var(--dsw-alias-brand-primary);color:var(--dsw-alias-label-primary-foreground)}
.dsh-ssh-badge-success{border-color:transparent;background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.dsh-ssh-badge-warn{border-color:transparent;background:var(--dsw-alias-state-warn-tertiary);color:var(--dsw-alias-state-warn-label)}
.dsh-ssh-badge-danger{border-color:transparent;background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}
.dsh-ssh-badge-mono{font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace)}
.dsh-ssh-badges{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.dsh-ssh-mono{font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace)}
.dsh-ssh-list{display:grid;gap:7px}
.dsh-ssh-card{border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-layer-2);padding:9px 10px}
.dsh-ssh-card-head{display:flex;align-items:flex-start;gap:8px}
.dsh-ssh-card-icon{width:26px;height:26px;border-radius:8px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-secondary);display:inline-grid;place-items:center;flex:none}
.dsh-ssh-card-icon svg{width:14px;height:14px}
.dsh-ssh-card-body{min-width:0;flex:1;display:grid;gap:1px}
.dsh-ssh-card-title-row{display:flex;align-items:center;flex-wrap:wrap;gap:6px;min-width:0}
.dsh-ssh-card-title{font-size:13.5px;font-weight:600;overflow-wrap:anywhere}
.dsh-ssh-addr{display:inline-flex;align-items:center;gap:1px;color:var(--dsw-alias-label-secondary);font-size:11.5px;min-width:0}
.dsh-ssh-card-actions{display:flex;align-items:center;gap:2px;flex:none;margin-left:auto}
.dsh-ssh-group{border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.dsh-ssh-group-head{display:flex;align-items:center;gap:7px;padding:7px 10px;background:var(--dsw-alias-bg-layer-2);border-bottom:1px solid var(--dsw-alias-border-l1);min-width:0}
.dsh-ssh-group-head > svg{width:13px;height:13px;color:var(--dsw-alias-label-tertiary);flex:none}
.dsh-ssh-group-title{font-size:12.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:45%}
.dsh-ssh-group-path{color:var(--dsw-alias-label-tertiary);font-size:10.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0;flex:1}
.dsh-ssh-row{display:flex;align-items:flex-start;gap:8px;padding:8px 10px}
.dsh-ssh-row + .dsh-ssh-row{border-top:1px solid var(--dsw-alias-border-l1)}
.dsh-ssh-row-main{min-width:0;flex:1;display:grid;gap:1px}
.dsh-ssh-row-title{display:flex;align-items:center;flex-wrap:wrap;gap:5px;min-width:0}
.dsh-ssh-row-server{font-size:12.5px;font-weight:600}
.dsh-ssh-row-arrow{color:var(--dsw-alias-label-tertiary)}
.dsh-ssh-path{font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11.5px;overflow-wrap:anywhere}
.dsh-ssh-row-meta{display:flex;flex-wrap:wrap;gap:4px;margin-top:4px}
.dsh-ssh-row-actions{display:flex;align-items:center;gap:2px;flex:none;margin-left:auto}
.dsh-ssh-form{display:grid;gap:9px;border:1px solid var(--dsw-alias-border-l1);border-radius:10px;background:var(--dsw-alias-bg-layer-2);padding:11px}
.dsh-ssh-form-title{display:flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600}
.dsh-ssh-form-title svg{width:14px;height:14px;color:var(--dsw-alias-label-secondary)}
.dsh-ssh-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));align-items:start;gap:9px}
.dsh-ssh-span{grid-column:1/-1}
.dsh-ssh-field{display:grid;align-content:start;gap:4px;min-width:0}
.dsh-ssh-field label{color:var(--dsw-alias-label-secondary);font-size:11.5px;display:flex;align-items:center;gap:6px}
.dsh-ssh-opt{color:var(--dsw-alias-label-tertiary);font-size:10.5px;font-weight:400}
.dsh-ssh-field input,.dsh-ssh-field select,.dsh-ssh-field textarea{box-sizing:border-box;width:100%;min-height:30px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;padding:4px 8px}
.dsh-ssh-field textarea{min-height:58px;resize:vertical;font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11.5px;line-height:17px}
.dsh-ssh-field input:focus-visible,.dsh-ssh-field select:focus-visible,.dsh-ssh-field textarea:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px;border-color:transparent}
.dsh-ssh-hint{color:var(--dsw-alias-label-tertiary);font-size:10.5px;line-height:15px}
.dsh-ssh-check{display:flex;align-items:center;gap:6px;color:var(--dsw-alias-label-secondary);font-size:11.5px}
.dsh-ssh-check input{margin:0;accent-color:var(--dsw-alias-brand-primary)}
.dsh-ssh-check span{min-width:0}
.dsh-ssh-check small{display:block;color:var(--dsw-alias-label-tertiary);font-size:10.5px;line-height:15px}
.dsh-ssh-actions{display:flex;flex-wrap:wrap;gap:6px}
.dsh-ssh-result{margin-top:8px;border:1px solid var(--dsw-alias-border-l1);border-radius:8px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}
.dsh-ssh-result-head{display:flex;align-items:center;gap:6px;padding:5px 9px;font-size:11.5px}
.dsh-ssh-result-dot{width:6px;height:6px;border-radius:50%;flex:none;background:var(--dsw-alias-state-success-primary)}
.dsh-ssh-result-error .dsh-ssh-result-dot{background:var(--dsw-alias-state-error-primary)}
.dsh-ssh-result-warn .dsh-ssh-result-dot{background:var(--dsw-alias-state-warn-primary)}
.dsh-ssh-result-label{font-weight:600;flex:none}
.dsh-ssh-result-meta{color:var(--dsw-alias-label-tertiary);font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0}
.dsh-ssh-result-body{margin:0;padding:0 9px 8px;color:var(--dsw-alias-label-secondary);font-family:var(--dsw-font-markdown-code-font-family,ui-monospace,SFMono-Regular,Menlo,monospace);font-size:11.5px;line-height:1.5;white-space:pre-wrap;overflow-wrap:anywhere;max-height:88px;overflow:auto}
.dsh-ssh-result-open .dsh-ssh-result-body{max-height:420px}
.dsh-ssh-empty{border:1px dashed var(--dsw-alias-border-l2);border-radius:10px;padding:16px 14px;text-align:center;color:var(--dsw-alias-label-tertiary);font-size:11.5px;display:grid;gap:3px;justify-items:center;line-height:17px}
.dsh-ssh-empty strong{color:var(--dsw-alias-label-secondary);font-size:12.5px;font-weight:600}
.dsh-ssh-empty svg{width:18px;height:18px;color:var(--dsw-alias-label-dimmed)}
.dsh-ssh-banner{display:flex;align-items:flex-start;gap:6px;margin:8px 0 0;padding:6px 9px;border-radius:8px;font-size:11.5px;line-height:16px}
.dsh-ssh-banner svg{width:13px;height:13px;flex:none;margin-top:1px}
.dsh-ssh-banner-error{background:var(--dsw-alias-interactive-bg-hover-danger);color:var(--dsw-alias-state-error-primary)}
.dsh-ssh-banner-ok{background:var(--dsw-alias-state-success-tertiary);color:var(--dsw-alias-state-success-primary)}
.dsh-ssh-filter{box-sizing:border-box;min-height:28px;width:140px;border:1px solid var(--dsw-alias-border-l2);border-radius:7px;background:var(--dsw-alias-bg-layer-3);color:var(--dsw-alias-label-primary);font:inherit;font-size:11.5px;padding:3px 8px}
.dsh-ssh-filter:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:1px;border-color:transparent}
.dsh-ssh-nav{--dsh-ssh-nav-icon:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='4 17 10 11 4 5'/%3E%3Cline x1='12' y1='19' x2='20' y2='19'/%3E%3C/svg%3E")}
.dsh-ssh-nav>svg{display:none}
.dsh-ssh-nav::before{content:"";box-sizing:border-box;width:16px;height:16px;flex:none;background-color:currentColor;-webkit-mask:var(--dsh-ssh-nav-icon) center/16px 16px no-repeat;mask:var(--dsh-ssh-nav-icon) center/16px 16px no-repeat}
.dsh-ssh-chip{box-sizing:border-box;max-width:260px;min-height:26px;border:0;border-radius:7px;background:transparent;color:var(--dsw-alias-label-tertiary);font:11.5px/17px inherit;padding:3px 6px;display:inline-flex;align-items:center;gap:5px;overflow:hidden;cursor:default}
.dsh-ssh-chip:hover{background:var(--dsw-alias-interactive-bg-hover);color:var(--dsw-alias-label-secondary)}
.dsh-ssh-chip-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-ssh-chip-dot{width:6px;height:6px;border-radius:50%;flex:none;background:var(--dsw-alias-state-success-primary)}
@media(max-width:560px){.dsh-ssh-grid{grid-template-columns:1fr}}
`;

    const PANEL_LABELS = { plain: "纯系统", baota: "宝塔", aapanel: "aaPanel", onepanel: "1Panel", plesk: "Plesk", cpanel: "cPanel" };
    const ROLE_LABELS = { development: "开发", staging: "测试", production: "生产" };
    const ROLE_TONES = { development: "neutral", staging: "warn", production: "brand" };
    const RUNTIME_LABELS = { none: "无容器", docker: "Docker", podman: "Podman" };
    const AUTH_LABELS = { agent: "SSH Agent", key: "私钥" };
    const HOST_KEY_LABELS = { strict: "严格校验", "accept-new": "接受新指纹" };
    const DETECTED_PANEL_LABELS = { "baota-or-aapanel": "宝塔/aaPanel", "1panel": "1Panel", plesk: "Plesk", cpanel: "cPanel" };
    const PREFERENCES_EVENT = "dsh-ssh:preferences-changed";
    function announcePreferences() {
      if (typeof window !== "undefined" && typeof window.dispatchEvent === "function") {
        window.dispatchEvent(new Event(PREFERENCES_EVENT));
      }
    }
    const SAVE_NOTICE = {
      saveServer: "服务器已保存",
      deleteServer: "服务器已删除，相关关联一并清理",
      saveBinding: "关联已保存",
      deleteBinding: "关联已解除",
      savePreferences: "偏好已保存"
    };
    const PREFS_FALLBACK = Object.freeze({
      role: "development",
      runtime: "none",
      composeFile: "docker-compose.yml",
      hostKeyPolicy: "accept-new",
      connectTimeout: 8,
      keepAlive: 0,
      loginShell: false,
      showSessionChip: true
    });
    function normalizePreferences(value) {
      const input = value && typeof value === "object" ? value : {};
      const clamp = (raw, fallback, min, max) => {
        const parsed = Number.parseInt(String(raw == null ? "" : raw), 10);
        if (!Number.isInteger(parsed)) return fallback;
        return Math.min(Math.max(parsed, min), max);
      };
      return {
        role: ROLE_LABELS[input.role] ? input.role : PREFS_FALLBACK.role,
        runtime: RUNTIME_LABELS[input.runtime] ? input.runtime : PREFS_FALLBACK.runtime,
        composeFile: (typeof input.composeFile === "string" ? input.composeFile.trim() : "") || PREFS_FALLBACK.composeFile,
        hostKeyPolicy: input.hostKeyPolicy === "strict" ? "strict" : "accept-new",
        connectTimeout: clamp(input.connectTimeout, PREFS_FALLBACK.connectTimeout, 1, 120),
        keepAlive: clamp(input.keepAlive, PREFS_FALLBACK.keepAlive, 0, 600),
        loginShell: input.loginShell === true,
        showSessionChip: input.showSessionChip !== false
      };
    }
    function splitPatterns(value) {
      return String(value == null ? "" : value).split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
    }
    function matchesText(query, values) {
      if (!query) return true;
      return values.filter(Boolean).join(" ").toLowerCase().indexOf(query) >= 0;
    }
    function groupBindings(targets, filter) {
      const list = Array.isArray(targets) ? targets : [];
      const query = String(filter || "").trim().toLowerCase();
      const groups = new Map();
      for (const target of list) {
        if (!matchesText(query, [target.workspaceTitle, target.workspacePath, target.workspaceId, target.serverName, target.serverHost, target.serverId, target.remotePath, target.role])) continue;
        const key = target.workspaceId || "unknown";
        if (!groups.has(key)) {
          groups.set(key, {
            key,
            title: target.workspaceTitle || (target.missingWorkspace ? "已删除的 Workspace" : target.workspaceId || "未知 Workspace"),
            path: target.workspacePath || "",
            missing: target.missingWorkspace === true,
            items: []
          });
        }
        groups.get(key).items.push(target);
      }
      return [...groups.values()].sort((a, b) => {
        if (a.missing !== b.missing) return a.missing ? 1 : -1;
        return a.title.localeCompare(b.title, "zh-Hans-CN");
      });
    }
    function serverVisible(server, bindings, query) {
      return matchesText(query, [server.name, server.host, server.username, server.port, server.jumpHost, PANEL_LABELS[server.panel]]);
    }
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
    const TYPERT_REMOTE = {
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
    function Icon(size, children) {
      return h("svg", {
        viewBox: "0 0 24 24",
        width: size || 16,
        height: size || 16,
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round",
        strokeLinejoin: "round",
        "aria-hidden": "true"
      }, children);
    }
    function TerminalIcon(size) {
      return Icon(size, [
        h("polyline", { key: "p", points: "4 17 10 11 4 5" }),
        h("line", { key: "l", x1: "12", y1: "19", x2: "20", y2: "19" })
      ]);
    }
    function ServerIcon(size) {
      return Icon(size, [
        h("rect", { key: "a", x: "2", y: "2", width: "20", height: "8", rx: "2" }),
        h("rect", { key: "b", x: "2", y: "14", width: "20", height: "8", rx: "2" }),
        h("line", { key: "c", x1: "6", y1: "6", x2: "6.01", y2: "6" }),
        h("line", { key: "d", x1: "6", y1: "18", x2: "6.01", y2: "18" })
      ]);
    }
    function LinkIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" }),
        h("path", { key: "b", d: "M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" })
      ]);
    }
    function PlusIcon(size) {
      return Icon(size, [
        h("line", { key: "a", x1: "12", y1: "5", x2: "12", y2: "19" }),
        h("line", { key: "b", x1: "5", y1: "12", x2: "19", y2: "12" })
      ]);
    }
    function PlugIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "M12 22v-5" }),
        h("path", { key: "b", d: "M9 8V2" }),
        h("path", { key: "c", d: "M15 8V2" }),
        h("path", { key: "d", d: "M18 8v5a6 6 0 0 1-12 0V8Z" })
      ]);
    }
    function ScanIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "M3 7V5a2 2 0 0 1 2-2h2" }),
        h("path", { key: "b", d: "M17 3h2a2 2 0 0 1 2 2v2" }),
        h("path", { key: "c", d: "M21 17v2a2 2 0 0 1-2 2h-2" }),
        h("path", { key: "d", d: "M7 21H5a2 2 0 0 1-2-2v-2" }),
        h("line", { key: "e", x1: "7", y1: "12", x2: "17", y2: "12" })
      ]);
    }
    function PencilIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "M12 20h9" }),
        h("path", { key: "b", d: "M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" })
      ]);
    }
    function TrashIcon(size) {
      return Icon(size, [
        h("polyline", { key: "a", points: "3 6 5 6 21 6" }),
        h("path", { key: "b", d: "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" })
      ]);
    }
    function UnlinkIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" }),
        h("path", { key: "b", d: "m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" }),
        h("line", { key: "c", x1: "8", y1: "2", x2: "8", y2: "5" }),
        h("line", { key: "d", x1: "2", y1: "8", x2: "5", y2: "8" }),
        h("line", { key: "e", x1: "16", y1: "19", x2: "16", y2: "22" }),
        h("line", { key: "f", x1: "19", y1: "16", x2: "22", y2: "16" })
      ]);
    }
    function RefreshIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "M21 12a9 9 0 1 1-2.64-6.36" }),
        h("polyline", { key: "b", points: "21 3 21 9 15 9" })
      ]);
    }
    function ChevronIcon(size) {
      return Icon(size, [h("polyline", { key: "a", points: "9 18 15 12 9 6" })]);
    }
    function CopyIcon(size) {
      return Icon(size, [
        h("rect", { key: "a", x: "9", y: "9", width: "13", height: "13", rx: "2" }),
        h("path", { key: "b", d: "M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" })
      ]);
    }
    function CheckIcon(size) {
      return Icon(size, [h("polyline", { key: "a", points: "20 6 9 17 4 12" })]);
    }
    function AlertIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" }),
        h("line", { key: "b", x1: "12", y1: "9", x2: "12", y2: "13" }),
        h("line", { key: "c", x1: "12", y1: "17", x2: "12.01", y2: "17" })
      ]);
    }
    function SlidersIcon(size) {
      return Icon(size, [
        h("line", { key: "a", x1: "4", y1: "21", x2: "4", y2: "14" }),
        h("line", { key: "b", x1: "4", y1: "10", x2: "4", y2: "3" }),
        h("line", { key: "c", x1: "12", y1: "21", x2: "12", y2: "12" }),
        h("line", { key: "d", x1: "12", y1: "8", x2: "12", y2: "3" }),
        h("line", { key: "e", x1: "20", y1: "21", x2: "20", y2: "16" }),
        h("line", { key: "f", x1: "20", y1: "12", x2: "20", y2: "3" }),
        h("line", { key: "g", x1: "1", y1: "14", x2: "7", y2: "14" }),
        h("line", { key: "i", x1: "9", y1: "8", x2: "15", y2: "8" }),
        h("line", { key: "j", x1: "17", y1: "16", x2: "23", y2: "16" })
      ]);
    }
    function BoxIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "m21 8-9-5-9 5 9 5 9-5Z" }),
        h("path", { key: "b", d: "m3 8 9 5 9-5" }),
        h("path", { key: "c", d: "M12 13v9" })
      ]);
    }
    function KeyIcon(size) {
      return Icon(size, [
        h("circle", { key: "a", cx: "7.5", cy: "15.5", r: "4.5" }),
        h("path", { key: "b", d: "m10.5 12.5 8-8" }),
        h("path", { key: "c", d: "m16 7 3 3" }),
        h("path", { key: "d", d: "m13.5 9.5 3 3" })
      ]);
    }
    function RouteIcon(size) {
      return Icon(size, [
        h("circle", { key: "a", cx: "6", cy: "19", r: "3" }),
        h("circle", { key: "b", cx: "18", cy: "5", r: "3" }),
        h("path", { key: "c", d: "M9 19h6a4 4 0 0 0 4-4V8" })
      ]);
    }
    function ClockIcon(size) {
      return Icon(size, [
        h("circle", { key: "a", cx: "12", cy: "12", r: "9" }),
        h("polyline", { key: "b", points: "12 7 12 12 15 14" })
      ]);
    }
    function ShieldIcon(size) {
      return Icon(size, [
        h("path", { key: "a", d: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" }),
        h("polyline", { key: "b", points: "9 12 11 14 15 10" })
      ]);
    }
    function errorMessage(reason) {
      if (reason && typeof reason.message === "string") return reason.message;
      return String(reason);
    }
    function remoteError(result) {
      if (result && result.error) {
        const code = result.error.code ? String(result.error.code) + ": " : "";
        return new Error(code + (result.error.message || "远程调用失败"));
      }
      return new Error("远程调用失败");
    }
    async function invoke(api, method, args) {
      const result = await api[method](...args);
      if (!result || result.ok !== true) throw remoteError(result);
      return result.value;
    }
    function timeLabel(at) {
      if (!at) return "";
      try {
        return new Date(at).toLocaleTimeString();
      } catch {
        return "";
      }
    }
    function runTone(value) {
      if (value.timedOut || value.aborted || value.denied) return "warn";
      return value.ok === true ? "ok" : "error";
    }
    function runLabel(value) {
      if (value.timedOut) return "超时";
      if (value.aborted) return "已中止";
      if (value.denied) return "被沙箱拒绝";
      if (value.ok === true) return "成功";
      if (typeof value.exitCode === "number" && value.exitCode !== 0) return "失败 exit " + value.exitCode;
      return "失败";
    }
    function resultBody(value) {
      const parts = [];
      if (value.text) parts.push(String(value.text));
      if (Array.isArray(value.containers) && value.containers.length) {
        if (parts.length) parts.push("");
        parts.push("运行中的容器 " + value.containers.length + " 个：");
        for (const item of value.containers) {
          parts.push("  " + [item.name, item.image, item.status, item.ports].filter(Boolean).join("   "));
        }
      }
      return parts.join("\n");
    }
    function Button(props) {
      const classes = ["dsh-ssh-button"];
      if (props.tone === "primary") classes.push("dsh-ssh-button-primary");
      if (props.tone === "ghost") classes.push("dsh-ssh-button-ghost");
      if (props.danger) classes.push("dsh-ssh-button-danger");
      if (props.iconOnly) classes.push("dsh-ssh-button-icon");
      return h("button", {
        type: "button",
        className: classes.join(" "),
        disabled: props.disabled === true,
        title: props.title || undefined,
        "aria-label": props.ariaLabel || props.title || undefined,
        onClick: props.onClick
      }, props.icon || null, props.iconOnly ? null : props.children);
    }
    function Badge(props) {
      const classes = ["dsh-ssh-badge"];
      if (props.tone && props.tone !== "neutral") classes.push("dsh-ssh-badge-" + props.tone);
      if (props.mono) classes.push("dsh-ssh-badge-mono");
      return h("span", { className: classes.join(" "), title: props.title || undefined },
        props.icon ? props.icon(11) : null,
        h("span", null, props.children)
      );
    }
    function Field(props) {
      const className = "dsh-ssh-field" + (props.span ? " dsh-ssh-span" : "");
      return h("div", { className },
        h("label", null, props.label, props.optional ? h("span", { className: "dsh-ssh-opt" }, "可选") : null),
        props.multiline
          ? h("textarea", {
              value: props.value == null ? "" : props.value,
              placeholder: props.placeholder || "",
              spellCheck: false,
              onChange: (event) => props.onChange(event.target.value)
            })
          : h("input", {
              type: props.type || "text",
              value: props.value == null ? "" : props.value,
              placeholder: props.placeholder || "",
              min: props.min,
              max: props.max,
              spellCheck: false,
              onChange: (event) => props.onChange(event.target.value)
            }),
        props.hint ? h("div", { className: "dsh-ssh-hint" }, props.hint) : null
      );
    }
    function SelectField(props) {
      return h("div", { className: "dsh-ssh-field" + (props.span ? " dsh-ssh-span" : "") },
        h("label", null, props.label, props.optional ? h("span", { className: "dsh-ssh-opt" }, "可选") : null),
        h("select", { value: props.value, onChange: (event) => props.onChange(event.target.value) },
          props.options.map((option) => h("option", { key: option[0], value: option[0] }, option[1]))
        ),
        props.hint ? h("div", { className: "dsh-ssh-hint" }, props.hint) : null
      );
    }
    function CheckField(props) {
      return h("label", { className: "dsh-ssh-check" + (props.span === false ? "" : " dsh-ssh-span") },
        h("input", {
          type: "checkbox",
          checked: props.checked === true,
          onChange: (event) => props.onChange(event.target.checked)
        }),
        h("span", null, props.label, props.hint ? h("small", null, props.hint) : null)
      );
    }
    function CopyButton(props) {
      const [copied, setCopied] = React.useState(false);
      const copy = async () => {
        try {
          if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(props.text);
          }
          setCopied(true);
          if (typeof window !== "undefined") window.setTimeout(() => setCopied(false), 1400);
        } catch {
          setCopied(false);
        }
      };
      return h(Button, {
        icon: copied ? CheckIcon(13) : CopyIcon(13),
        iconOnly: true,
        tone: "ghost",
        title: copied ? "已复制" : (props.title || "复制"),
        onClick: copy
      });
    }
    function Result(props) {
      const [open, setOpen] = React.useState(false);
      const value = props.value;
      if (!value) return null;
      const body = resultBody(value);
      const long = body ? body.split("\n").length > 6 || body.length > 420 : false;
      const tone = runTone(value);
      const meta = [];
      const at = timeLabel(value.at);
      if (at) meta.push(at);
      if (value.sandboxMode) meta.push(value.sandboxMode);
      const classes = ["dsh-ssh-result"];
      if (tone === "error") classes.push("dsh-ssh-result-error");
      if (tone === "warn") classes.push("dsh-ssh-result-warn");
      if (open) classes.push("dsh-ssh-result-open");
      return h("div", { className: classes.join(" ") },
        h("div", { className: "dsh-ssh-result-head" },
          h("span", { className: "dsh-ssh-result-dot" }),
          h("span", { className: "dsh-ssh-result-label" }, runLabel(value)),
          h("span", { className: "dsh-ssh-result-meta" }, meta.join(" · ")),
          long ? h(Button, { tone: "ghost", onClick: () => setOpen(!open) }, open ? "收起" : "展开") : null
        ),
        body ? h("pre", { className: "dsh-ssh-result-body" }, body) : null
      );
    }
    function EmptyState(props) {
      return h("div", { className: "dsh-ssh-empty" },
        props.icon || null,
        h("strong", null, props.title),
        h("span", null, props.children)
      );
    }
    function ServerForm(props) {
      const draft = props.draft;
      const set = (patch) => props.setDraft({ ...draft, ...patch });
      return h("div", { className: "dsh-ssh-form" },
        h("div", { className: "dsh-ssh-form-title" }, ServerIcon(15), draft.id ? "编辑服务器" : "添加服务器"),
        h("div", { className: "dsh-ssh-grid" },
          h(Field, { label: "名称", value: draft.name, placeholder: "38 / 生产机", onChange: (name) => set({ name }) }),
          h(Field, { label: "主机", value: draft.host, placeholder: "example.com 或 1.2.3.4", onChange: (host) => set({ host }) }),
          h(Field, { label: "端口", type: "number", min: 1, max: 65535, value: draft.port, onChange: (port) => set({ port }) }),
          h(Field, { label: "用户名", value: draft.username, placeholder: "root", onChange: (username) => set({ username }) }),
          h(SelectField, {
            label: "面板类型",
            optional: true,
            value: draft.panel || "plain",
            onChange: (panel) => set({ panel }),
            options: Object.entries(PANEL_LABELS),
            hint: "只作标记，用来提示模型这套机器上有什么；不影响 SSH 命令。"
          }),
          h(SelectField, {
            label: "认证方式",
            value: draft.authMethod,
            onChange: (authMethod) => set({ authMethod }),
            options: [["agent", "SSH Agent / 默认密钥"], ["key", "指定私钥文件"]]
          }),
          h(Field, {
            label: "私钥文件路径",
            optional: draft.authMethod !== "key",
            value: draft.identityFile,
            placeholder: "~/.ssh/id_ed25519",
            onChange: (identityFile) => set({ identityFile }),
            hint: draft.authMethod === "key" ? "必填。只使用这个文件（IdentitiesOnly）。" : "可选。填写后会加 -i，并打开 IdentitiesOnly。"
          }),
          h(Field, {
            label: "跳板机 ProxyJump",
            optional: true,
            value: draft.jumpHost,
            placeholder: "user@bastion.example.com",
            onChange: (jumpHost) => set({ jumpHost }),
            hint: "可选。写成 user@host 或 host。"
          }),
          h(Field, {
            label: "连接超时（秒）",
            optional: true,
            type: "number",
            min: 1,
            max: 120,
            value: draft.connectTimeout,
            onChange: (connectTimeout) => set({ connectTimeout }),
            hint: "1–120，默认 8。"
          }),
          h(Field, {
            label: "保活间隔（秒）",
            optional: true,
            type: "number",
            min: 0,
            max: 600,
            value: draft.keepAlive,
            onChange: (keepAlive) => set({ keepAlive }),
            hint: "0 关闭。长任务建议 30，避免空闲掉线。"
          }),
          h(SelectField, {
            label: "known_hosts 策略",
            value: draft.hostKeyPolicy,
            onChange: (hostKeyPolicy) => set({ hostKeyPolicy }),
            options: [["strict", "严格校验（需已有指纹）"], ["accept-new", "接受新指纹"]],
            hint: "首次连接可用「接受新指纹」，之后建议改回严格。"
          }),
          h(CheckField, {
            label: "用登录 shell 执行远端命令",
            hint: "默认直接执行；勾选后走 bash -lc / sh -lc，能读到 /etc/profile、nvm、bun 等 PATH。",
            checked: draft.loginShell === true,
            onChange: (loginShell) => set({ loginShell })
          })
        ),
        h("div", { className: "dsh-ssh-actions" },
          h(Button, { tone: "primary", disabled: props.busy, onClick: props.onSave }, props.busy ? "保存中" : "保存服务器"),
          h(Button, { disabled: props.busy, onClick: props.onCancel }, "取消")
        )
      );
    }
    function BindingForm(props) {
      const draft = props.draft;
      const workspaces = props.workspaces || [];
      const servers = props.servers || [];
      const set = (patch) => props.setDraft({ ...draft, ...patch });
      return h("div", { className: "dsh-ssh-form" },
        h("div", { className: "dsh-ssh-form-title" }, LinkIcon(15), draft.id ? "编辑关联" : "添加关联"),
        h("div", { className: "dsh-ssh-grid" },
          h(SelectField, {
            label: "Workspace",
            value: draft.workspaceId,
            onChange: (workspaceId) => set({ workspaceId }),
            options: workspaces.length ? workspaces.map((item) => [item.id, item.title || item.id]) : [["", "没有 Workspace"]]
          }),
          h(SelectField, {
            label: "服务器",
            value: draft.serverId,
            onChange: (serverId) => set({ serverId }),
            options: servers.length ? servers.map((item) => [item.id, item.name || item.id]) : [["", "没有服务器"]]
          }),
          h(Field, {
            label: "远程项目目录",
            span: true,
            value: draft.remotePath,
            placeholder: "/home/user/app",
            onChange: (remotePath) => set({ remotePath }),
            hint: "绝对路径，不能是 /。ssh_exec 会先 cd 到这里。"
          }),
          h(SelectField, {
            label: "环境",
            optional: true,
            value: draft.role || "development",
            onChange: (role) => set({ role }),
            options: Object.entries(ROLE_LABELS)
          }),
          h(SelectField, {
            label: "容器运行时",
            optional: true,
            value: draft.runtime || "none",
            onChange: (runtime) => set({ runtime }),
            options: Object.entries(RUNTIME_LABELS),
            hint: "ssh_compose 需要 docker 或 podman。"
          }),
          h(Field, {
            label: "Compose 文件",
            optional: true,
            value: draft.composeFile,
            placeholder: "docker-compose.yml",
            onChange: (composeFile) => set({ composeFile })
          }),
          h(Field, {
            label: "Compose 项目名",
            optional: true,
            value: draft.containerProject,
            placeholder: "myapp",
            onChange: (containerProject) => set({ containerProject }),
            hint: "对应 docker compose -p。"
          }),
          h(Field, {
            label: "同步排除",
            optional: true,
            span: true,
            multiline: true,
            value: draft.excludeText == null ? "" : draft.excludeText,
            placeholder: "node_modules\n.git\ndist",
            onChange: (excludeText) => set({ excludeText }),
            hint: "ssh_sync 用，每行一个；rsync 与 tar 都会带上。"
          }),
          h(CheckField, {
            label: "作为这个 Workspace 的默认关联",
            hint: "同一个 Workspace 里不带 role 的调用默认走这里。",
            checked: draft.isDefault === true,
            onChange: (isDefault) => set({ isDefault })
          })
        ),
        h("div", { className: "dsh-ssh-actions" },
          h(Button, { tone: "primary", disabled: props.busy, onClick: props.onSave }, props.busy ? "保存中" : "保存关联"),
          h(Button, { disabled: props.busy, onClick: props.onCancel }, "取消")
        )
      );
    }
    function ServerCard(props) {
      const server = props.server;
      const probe = props.probe;
      const badges = [];
      if (server.panel && server.panel !== "plain") badges.push({ key: "panel", label: PANEL_LABELS[server.panel] || server.panel });
      badges.push({ key: "auth", label: AUTH_LABELS[server.authMethod] || server.authMethod, icon: KeyIcon, title: server.identityFile || "使用 SSH Agent / 默认密钥" });
      if (server.jumpHost) badges.push({ key: "jump", label: "跳板 " + server.jumpHost, icon: RouteIcon });
      badges.push({ key: "timeout", label: "超时 " + (server.connectTimeout || 8) + "s", icon: ClockIcon });
      if (server.keepAlive > 0) badges.push({ key: "keepalive", label: "保活 " + server.keepAlive + "s", icon: ClockIcon });
      badges.push({ key: "hostkey", label: HOST_KEY_LABELS[server.hostKeyPolicy] || "严格校验", tone: server.hostKeyPolicy === "accept-new" ? "warn" : "neutral", icon: ShieldIcon });
      if (server.loginShell) badges.push({ key: "login", label: "登录 shell" });
      if (props.bindingCount) badges.push({ key: "bindings", label: props.bindingCount + " 条关联", icon: LinkIcon });
      if (probe && probe.ok === true) {
        if (probe.os) badges.push({ key: "os", label: probe.os, mono: true, title: [probe.os, probe.kernel].filter(Boolean).join(" · ") });
        if (probe.runtime && probe.runtime !== "none") badges.push({ key: "runtime", label: RUNTIME_LABELS[probe.runtime] || probe.runtime, icon: BoxIcon });
        for (const panel of probe.panels || []) badges.push({ key: "panel-" + panel, label: DETECTED_PANEL_LABELS[panel] || panel });
        if (Array.isArray(probe.containers) && probe.containers.length) badges.push({ key: "containers", label: probe.containers.length + " 个容器", icon: BoxIcon });
      }
      const address = server.username + "@" + server.host + ":" + server.port;
      return h("div", { className: "dsh-ssh-card" },
        h("div", { className: "dsh-ssh-card-head" },
          h("span", { className: "dsh-ssh-card-icon" }, ServerIcon(14)),
          h("div", { className: "dsh-ssh-card-body" },
            h("div", { className: "dsh-ssh-card-title-row" },
              h("span", { className: "dsh-ssh-card-title" }, server.name),
              h("span", { className: "dsh-ssh-addr" },
                h("span", { className: "dsh-ssh-mono" }, address),
                h(CopyButton, { text: address, title: "复制地址" })
              ),
              probe && probe.ok === true ? h(Badge, { tone: "success", icon: CheckIcon }, "已连通") : null
            ),
            h("div", { className: "dsh-ssh-badges" },
              badges.map((badge) => h(Badge, { key: badge.key, tone: badge.tone, mono: badge.mono, icon: badge.icon, title: badge.title }, badge.label))
            )
          ),
          h("div", { className: "dsh-ssh-card-actions" },
            h(Button, { icon: PlugIcon(13), iconOnly: true, title: "测试连接", disabled: props.busy, onClick: props.onTest }),
            h(Button, { icon: ScanIcon(13), iconOnly: true, title: "探测主机", disabled: props.busy, onClick: props.onProbe }),
            h(Button, { icon: PencilIcon(13), iconOnly: true, title: "编辑", disabled: props.busy, onClick: props.onEdit }),
            h(Button, { icon: TrashIcon(13), iconOnly: true, danger: true, title: "删除", disabled: props.busy, onClick: props.onDelete })
          )
        ),
        h(Result, { value: props.result }),
        h(Result, { value: probe })
      );
    }
    function BindingRow(props) {
      const binding = props.binding;
      const server = props.server;
      const meta = [];
      if (server) meta.push({ key: "host", label: server.username + "@" + server.host + ":" + server.port, mono: true });
      if (binding.runtime && binding.runtime !== "none") meta.push({ key: "runtime", label: RUNTIME_LABELS[binding.runtime] || binding.runtime, icon: BoxIcon });
      if (binding.composeFile) meta.push({ key: "compose", label: binding.composeFile, mono: true });
      if (binding.containerProject) meta.push({ key: "project", label: "-p " + binding.containerProject, mono: true });
      if (Array.isArray(binding.exclude) && binding.exclude.length) meta.push({ key: "exclude", label: "排除 " + binding.exclude.length + " 项", title: binding.exclude.join(", ") });
      return h("div", { className: "dsh-ssh-row" },
        h("div", { className: "dsh-ssh-row-main" },
          h("div", { className: "dsh-ssh-row-title" },
            h(Badge, { tone: ROLE_TONES[binding.role] || "neutral" }, ROLE_LABELS[binding.role] || binding.role),
            binding.isDefault ? h(Badge, { tone: "success" }, "默认") : null,
            binding.missingServer ? h(Badge, { tone: "danger" }, "服务器已删除") : null,
            binding.missingWorkspace ? h(Badge, { tone: "danger" }, "Workspace 已删除") : null,
            h("span", { className: "dsh-ssh-row-server" }, server ? server.name : binding.serverId),
            h("span", { className: "dsh-ssh-row-arrow" }, "→"),
            h("code", { className: "dsh-ssh-path" }, binding.remotePath)
          ),
          h("div", { className: "dsh-ssh-row-meta" },
            meta.map((item) => h(Badge, { key: item.key, mono: item.mono, icon: item.icon, title: item.title }, item.label))
          )
        ),
        h("div", { className: "dsh-ssh-row-actions" },
          h(CopyButton, { text: binding.remotePath, title: "复制远程目录" }),
          h(Button, { icon: PencilIcon(13), iconOnly: true, title: "编辑", disabled: props.busy, onClick: props.onEdit }),
          h(Button, { icon: UnlinkIcon(13), iconOnly: true, danger: true, title: "解除关联", disabled: props.busy, onClick: props.onDelete })
        )
      );
    }
    function PreferencesPanel(props) {
      const draft = props.draft;
      const set = (patch) => props.setDraft({ ...draft, ...patch });
      return h("div", { className: "dsh-ssh-form" },
        h("div", { className: "dsh-ssh-form-title" }, SlidersIcon(14), "默认值与显示"),
        h("div", { className: "dsh-ssh-hint" }, "只影响之后新建的主机和关联，不改动已有条目。"),
        h("div", { className: "dsh-ssh-grid" },
          h(SelectField, { label: "新关联默认环境", value: draft.role, onChange: (role) => set({ role }), options: Object.entries(ROLE_LABELS) }),
          h(SelectField, { label: "新关联默认运行时", value: draft.runtime, onChange: (runtime) => set({ runtime }), options: Object.entries(RUNTIME_LABELS) }),
          h(Field, { label: "默认 Compose 文件", optional: true, value: draft.composeFile, placeholder: "docker-compose.yml", onChange: (composeFile) => set({ composeFile }) }),
          h(Field, { label: "新主机默认超时（秒）", optional: true, type: "number", min: 1, max: 120, value: draft.connectTimeout, onChange: (connectTimeout) => set({ connectTimeout }) }),
          h(Field, { label: "新主机默认保活（秒）", optional: true, type: "number", min: 0, max: 600, value: draft.keepAlive, onChange: (keepAlive) => set({ keepAlive }) }),
          h(SelectField, { label: "新主机默认 known_hosts 策略", value: draft.hostKeyPolicy, onChange: (hostKeyPolicy) => set({ hostKeyPolicy }), options: [["strict", "严格校验"], ["accept-new", "接受新指纹"]] }),
          h(CheckField, { label: "新主机默认使用登录 shell", checked: draft.loginShell, onChange: (loginShell) => set({ loginShell }) }),
          h(CheckField, { label: "在会话标题栏显示 SSH 目标", checked: draft.showSessionChip, onChange: (showSessionChip) => set({ showSessionChip }) })
        ),
        h("div", { className: "dsh-ssh-actions" },
          h(Button, { tone: "primary", disabled: props.busy, onClick: props.onSave }, props.busy ? "保存中" : "保存偏好"),
          h(Button, { disabled: props.busy, onClick: props.onReset }, "恢复默认")
        )
      );
    }
    function Manager(props) {
      const api = props.api;
      const [data, setData] = React.useState(null);
      const [loading, setLoading] = React.useState(true);
      const [busyKey, setBusyKey] = React.useState("");
      const [error, setError] = React.useState("");
      const [notice, setNotice] = React.useState("");
      const [tab, setTab] = React.useState("servers");
      const [filter, setFilter] = React.useState("");
      const [serverDraft, setServerDraft] = React.useState(null);
      const [bindingDraft, setBindingDraft] = React.useState(null);
      const [outputs, setOutputs] = React.useState({});
      const [probes, setProbes] = React.useState({});
      const [prefsDraft, setPrefsDraft] = React.useState(null);
      const load = React.useCallback(async () => {
        setLoading(true);
        try {
          const next = await invoke(api, "getState", []);
          setData(next);
          setError("");
        } catch (reason) {
          setError(errorMessage(reason));
        } finally {
          setLoading(false);
        }
      }, [api]);
      React.useEffect(() => { load(); }, [load]);
      React.useEffect(() => {
        if (data && prefsDraft === null) setPrefsDraft(normalizePreferences(data.preferences));
      }, [data, prefsDraft]);
      const save = async (method, args, done) => {
        setBusyKey(method);
        setError("");
        setNotice("");
        try {
          const next = await invoke(api, method, args);
          if (next && next.servers) setData(next);
          if (method === "savePreferences") announcePreferences();
          setNotice(SAVE_NOTICE[method] || "已保存");
          if (done) done(next);
          return next;
        } catch (reason) {
          setError(errorMessage(reason));
          return null;
        } finally {
          setBusyKey("");
        }
      };
      const action = async (key, method, args) => {
        setBusyKey(key);
        setError("");
        try {
          const result = await invoke(api, method, args);
          setOutputs((current) => ({ ...current, [key]: { ...result, at: Date.now() } }));
        } catch (reason) {
          setOutputs((current) => ({ ...current, [key]: { ok: false, text: errorMessage(reason), at: Date.now() } }));
        } finally {
          setBusyKey("");
        }
      };
      const probe = async (server) => {
        setBusyKey(server.id);
        setError("");
        try {
          const result = await invoke(api, "inspectServer", [server.id, true]);
          setProbes((current) => ({ ...current, [server.id]: { ...result, at: Date.now() } }));
        } catch (reason) {
          setProbes((current) => ({ ...current, [server.id]: { ok: false, text: errorMessage(reason), at: Date.now() } }));
        } finally {
          setBusyKey("");
        }
      };
      if (loading) {
        return h("div", { className: "dsh-ssh-root" }, h("div", { className: "dsh-ssh-empty" }, "正在加载 SSH 配置…"));
      }
      if (!data) {
        return h("div", { className: "dsh-ssh-root" },
          h("div", { className: "dsh-ssh-banner dsh-ssh-banner-error" }, AlertIcon(13), h("span", null, error || "无法加载 SSH 配置")),
          h("div", { className: "dsh-ssh-actions" }, h(Button, { icon: RefreshIcon(13), onClick: load }, "重试"))
        );
      }
      const preferences = normalizePreferences(data.preferences);
      const busy = Boolean(busyKey);
      const query = filter.trim().toLowerCase();
      const visibleServers = data.servers.filter((server) => serverVisible(server, data.bindings, query));
      const groups = groupBindings(data.targets, filter);
      const totalItems = data.servers.length + data.bindings.length;
      const newServer = () => setServerDraft({
        id: "",
        name: "",
        host: "",
        port: 22,
        username: "",
        authMethod: "agent",
        identityFile: "",
        jumpHost: "",
        connectTimeout: preferences.connectTimeout,
        keepAlive: preferences.keepAlive,
        loginShell: preferences.loginShell,
        hostKeyPolicy: preferences.hostKeyPolicy,
        panel: "plain"
      });
      const newBinding = () => setBindingDraft({
        id: "",
        workspaceId: (data.workspaces[0] && data.workspaces[0].id) || "",
        serverId: (data.servers[0] && data.servers[0].id) || "",
        remotePath: "",
        role: preferences.role,
        runtime: preferences.runtime,
        composeFile: preferences.runtime === "none" ? "" : preferences.composeFile,
        containerProject: "",
        excludeText: "",
        isDefault: !(data.bindings || []).length
      });
      const editBinding = (binding) => setBindingDraft({
        composeFile: "",
        containerProject: "",
        runtime: "none",
        role: "development",
        isDefault: false,
        ...binding,
        excludeText: (binding.exclude || []).join("\n")
      });
      const saveBinding = () => {
        const payload = { ...bindingDraft, exclude: splitPatterns(bindingDraft.excludeText), excludeText: undefined };
        return save("saveBinding", [payload], () => setBindingDraft(null));
      };
      const tabButton = (id, icon, label, count) => h("button", {
        key: id,
        type: "button",
        role: "tab",
        "aria-selected": tab === id ? "true" : "false",
        className: "dsh-ssh-tab" + (tab === id ? " dsh-ssh-tab-active" : ""),
        onClick: () => setTab(id)
      }, icon, h("span", null, label), count ? h("span", { className: "dsh-ssh-count" }, String(count)) : null);
      const serversPanel = h("div", { className: "dsh-ssh-tabpanel", role: "tabpanel" },
        serverDraft ? h(ServerForm, {
          draft: serverDraft,
          setDraft: setServerDraft,
          busy,
          onSave: () => save("saveServer", [serverDraft], () => setServerDraft(null)),
          onCancel: () => setServerDraft(null)
        }) : null,
        data.servers.length === 0
          ? h(EmptyState, { icon: ServerIcon(18), title: "还没有 SSH 主机" }, "添加主机和密钥后，Agent 才能在远端执行、同步和拉起容器。")
          : visibleServers.length === 0
            ? h(EmptyState, { icon: ServerIcon(18), title: "没有匹配的主机" }, "换个筛选词试试。")
            : h("div", { className: "dsh-ssh-list" }, visibleServers.map((server) => h(ServerCard, {
                key: server.id,
                server,
                bindingCount: data.bindings.filter((item) => item.serverId === server.id).length,
                result: outputs[server.id],
                probe: probes[server.id],
                busy,
                onTest: () => action(server.id, "testConnection", [server.id]),
                onProbe: () => probe(server),
                onEdit: () => setServerDraft({
                  connectTimeout: preferences.connectTimeout,
                  keepAlive: preferences.keepAlive,
                  loginShell: preferences.loginShell,
                  jumpHost: "",
                  identityFile: "",
                  panel: "plain",
                  hostKeyPolicy: "accept-new",
                  ...server
                }),
                onDelete: () => {
                  if (typeof window !== "undefined" && !window.confirm("删除服务器会同时删除它的所有 Workspace 关联。继续？")) return;
                  save("deleteServer", [server.id]);
                }
              })))
      );
      const bindingsPanel = h("div", { className: "dsh-ssh-tabpanel", role: "tabpanel" },
        bindingDraft ? h(BindingForm, {
          draft: bindingDraft,
          setDraft: setBindingDraft,
          workspaces: data.workspaces,
          servers: data.servers,
          busy,
          onSave: saveBinding,
          onCancel: () => setBindingDraft(null)
        }) : null,
        data.bindings.length === 0
          ? h(EmptyState, { icon: LinkIcon(18), title: "还没有 Workspace 关联" }, "在会话里说一句「把当前项目绑到某台主机」，Agent 会自己 ssh_bind；也可以在这里手动加。")
          : groups.length === 0
            ? h(EmptyState, { icon: LinkIcon(18), title: "没有匹配的关联" }, "换个筛选词试试。")
            : h("div", { className: "dsh-ssh-list" }, groups.map((group) => h("div", { key: group.key, className: "dsh-ssh-group" },
                h("div", { className: "dsh-ssh-group-head" },
                  LinkIcon(13),
                  h("span", { className: "dsh-ssh-group-title" }, group.title),
                  group.path ? h("span", { className: "dsh-ssh-group-path", title: group.path }, group.path) : null,
                  h("span", { className: "dsh-ssh-count" }, String(group.items.length))
                ),
                group.items.map((binding) => h(BindingRow, {
                  key: binding.id,
                  binding,
                  server: data.servers.find((item) => item.id === binding.serverId),
                  busy,
                  onEdit: () => editBinding(binding),
                  onDelete: () => {
                    if (typeof window !== "undefined" && !window.confirm("解除这条 Workspace 关联？")) return;
                    save("deleteBinding", [binding.id]);
                  }
                }))
              )))
      );
      const prefsPanel = h("div", { className: "dsh-ssh-tabpanel", role: "tabpanel" },
        h(PreferencesPanel, {
          draft: prefsDraft || preferences,
          setDraft: setPrefsDraft,
          busy,
          onReset: () => setPrefsDraft(normalizePreferences(undefined)),
          onSave: () => save("savePreferences", [prefsDraft || preferences], () => setPrefsDraft(null))
        })
      );
      return h("div", { className: "dsh-ssh-root" },
        h("div", { className: "dsh-ssh-head" },
          h("div", { className: "dsh-ssh-title" },
            h("span", { className: "dsh-ssh-title-icon" }, TerminalIcon(15)),
            h("div", null,
              h("h2", null, "SSH 远程"),
              h("div", { className: "dsh-ssh-sub" }, "人管主机和密钥；绑定、执行、同步、Compose 交给会话里的 Agent。")
            )
          ),
          h("div", { className: "dsh-ssh-head-actions" },
            h(Button, { icon: RefreshIcon(13), iconOnly: true, tone: "ghost", title: "重新加载", disabled: busy, onClick: load })
          )
        ),
        error ? h("div", { className: "dsh-ssh-banner dsh-ssh-banner-error" }, AlertIcon(13), h("span", null, error)) : null,
        notice ? h("div", { className: "dsh-ssh-banner dsh-ssh-banner-ok" }, CheckIcon(13), h("span", null, notice)) : null,
        h("div", { className: "dsh-ssh-tabrow" },
          h("div", { className: "dsh-ssh-tabs", role: "tablist" },
            tabButton("servers", ServerIcon(13), "服务器", data.servers.length),
            tabButton("bindings", LinkIcon(13), "关联", data.bindings.length),
            tabButton("prefs", SlidersIcon(13), "偏好", 0)
          ),
          h("div", { className: "dsh-ssh-tabrow-actions" },
            tab !== "prefs" && totalItems > 4 ? h("input", {
              className: "dsh-ssh-filter",
              value: filter,
              placeholder: "筛选",
              spellCheck: false,
              onChange: (event) => setFilter(event.target.value)
            }) : null,
            tab === "servers" ? h(Button, { icon: PlusIcon(13), tone: "primary", onClick: newServer }, "添加服务器") : null,
            tab === "bindings" ? h(Button, { icon: PlusIcon(13), tone: "primary", disabled: !data.servers.length || !data.workspaces.length, onClick: newBinding }, "添加关联") : null
          )
        ),
        tab === "servers" ? serversPanel : tab === "bindings" ? bindingsPanel : prefsPanel
      );
    }
    function RemoteChip(props) {
      const api = props.api;
      const sessionId = props.sessionId;
      const useWorkspaces = props.useWorkspaces;
      const workspaceId = useWorkspaces ? useWorkspaces((snapshot) => {
        const workspace = (snapshot.items || []).find((item) => (item.sessionIds || []).some((id) => String(id) === String(sessionId)));
        return workspace ? String(workspace.workspaceId || workspace.id) : "";
      }) : "";
      const [target, setTarget] = React.useState(null);
      const [revision, setRevision] = React.useState(0);
      React.useEffect(() => {
        if (typeof window === "undefined") return undefined;
        const onChange = () => setRevision((value) => value + 1);
        window.addEventListener(PREFERENCES_EVENT, onChange);
        return () => window.removeEventListener(PREFERENCES_EVENT, onChange);
      }, []);
      React.useEffect(() => {
        let cancelled = false;
        if (!workspaceId) {
          setTarget(null);
          return undefined;
        }
        invoke(api, "getState", []).then((state) => {
          if (cancelled) return;
          if (state && state.preferences && state.preferences.showSessionChip === false) {
            setTarget(null);
            return;
          }
          const current = (state.targets || []).filter((item) => item.workspaceId === workspaceId);
          setTarget(current.find((item) => item.isDefault) || current[0] || null);
        }).catch(() => {
          if (!cancelled) setTarget(null);
        });
        return () => { cancelled = true; };
      }, [api, workspaceId, revision]);
      if (!target) return null;
      const role = ROLE_LABELS[target.role] || target.role;
      const title = (target.serverHost || target.serverName || "SSH") + " → " + target.remotePath + " · " + role + (target.isDefault ? " · 默认" : "");
      return h("span", { className: "dsh-ssh-chip", title },
        h("span", { className: "dsh-ssh-chip-dot" }),
        h("span", { className: "dsh-ssh-chip-text" }, (target.serverName || "SSH") + " · " + role)
      );
    }
    const NAV_LABEL = "SSH 远程";
    const NAV_CLASS = "dsh-ssh-nav";
    function installNavIcon() {
      if (typeof document === "undefined" || typeof MutationObserver === "undefined") return () => {};
      const paint = () => {
        try {
          for (const label of document.querySelectorAll('span[class*="_navLabel"]')) {
            if (label.textContent !== NAV_LABEL) continue;
            const cell = label.closest ? label.closest("button") : null;
            if (!cell || cell.classList.contains(NAV_CLASS)) continue;
            cell.classList.add(NAV_CLASS);
          }
        } catch {
          /* the settings shell markup is not ours; a failed decoration must stay harmless */
        }
      };
      let scheduled = false;
      const schedule = () => {
        if (scheduled) return;
        scheduled = true;
        const run = () => { scheduled = false; paint(); };
        if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
        else setTimeout(run, 60);
      };
      paint();
      const observer = new MutationObserver(schedule);
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });
      return () => observer.disconnect();
    }
    const inject = ["slots", "remote"];
    const name = PACKAGE;
    async function apply(ctx) {
      ctx.effect(() => {
        const styleId = PACKAGE + ".css";
        let tag = document.querySelector("style[data-plugin-css=" + JSON.stringify(styleId) + "]");
        if (tag === null) {
          tag = document.createElement("style");
          tag.dataset.plugin = PACKAGE;
          tag.dataset.pluginCss = styleId;
          document.head.appendChild(tag);
        }
        tag.textContent = CSS;
        return () => { tag.remove(); };
      }, "ssh-workspace-manager: css");
      ctx.effect(() => installNavIcon(), "ssh-workspace-manager: nav icon");
      await ctx.remote.$mount(TYPERT_REMOTE);
      ctx.inject(["slots", "remote.sshWorkspaceManager"], (scope) => {
        const api = scope.remote[SERVICE];
        scope.slots.inject("settings.section", () => scope.slots.register({
          name: "settings.section",
          id: "ssh-workspace-manager",
          order: 12,
          label: "SSH 远程"
        }, () => h(Manager, { api })));
        scope.slots.inject("conversation.session.header.actions", () => scope.slots.register({
          name: "conversation.session.header.actions",
          id: "ssh-remote-target",
          order: 25
        }, (slotProps) => h(RemoteChip, { api, sessionId: slotProps.sessionId, useWorkspaces: slotProps.useWorkspaces })));
      });
    }
    const plugin = { name, inject, apply };
    exports.apply = apply;
    exports.inject = inject;
    exports.name = name;
    exports.default = plugin;
    exports.__internals = { normalizePreferences, groupBindings, splitPatterns, runLabel, runTone, typertRemote: TYPERT_REMOTE };
    return module.exports;
  }
});