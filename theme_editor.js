(function () {
  const STORAGE_KEY = "css-theme-vars";
  const LIVE_STYLE_ID = "css-theme-live-overrides";

  function getLiveStyleTag() {
    let tag = document.getElementById(LIVE_STYLE_ID);

    if (!tag) {
      tag = document.createElement("style");
      tag.id = LIVE_STYLE_ID;
      tag.setAttribute("data-theme-editor", "true");
      document.body.appendChild(tag);
    }

    return tag;
  }

  function getVars() {
    const styles = getComputedStyle(document.documentElement);
    const vars = [];

    for (let i = 0; i < styles.length; i++) {
      const name = styles[i];

      if (name.startsWith("--")) {
        vars.push({
          name,
          value: styles.getPropertyValue(name).trim()
        });
      }
    }

    return vars;
  }

  function writeLiveOverrides(vars) {
    const css = `:root {\n${vars
      .map(v => `  ${v.name}: ${v.value};`)
      .join("\n")}\n}`;

    getLiveStyleTag().textContent = css;
  }

  function save(vars) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(vars));
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function exportCSS(vars) {
    return `:root {\n${vars
      .map(v => `  ${v.name}: ${v.value};`)
      .join("\n")}\n}`;
  }

  function createUI() {
    const panel = document.createElement("div");
    panel.style = `
      position:fixed; top:20px; right:20px; z-index:99999;
      width:350px; max-height:80vh; overflow:auto;
      background:#fff; border:1px solid #ccc;
      padding:10px; font-family:sans-serif;
    `;

    const vars = getVars();
    const saved = load();

    vars.forEach(v => {
      if (saved[v.name]) {
        v.value = saved[v.name];
      }
    });

    writeLiveOverrides(vars);

    vars.forEach(v => {
      const row = document.createElement("div");
      row.style.marginBottom = "8px";

      const label = document.createElement("div");
      label.textContent = v.name;
      label.style.fontSize = "12px";

      const input = document.createElement("input");
      input.value = v.value;
      input.style.width = "100%";

      input.oninput = () => {
        v.value = input.value;

        writeLiveOverrides(vars);

        save(Object.fromEntries(
          vars.map(x => [x.name, x.value])
        ));
      };

      row.appendChild(label);
      row.appendChild(input);
      panel.appendChild(row);
    });

    const exportBtn = document.createElement("button");
    exportBtn.textContent = "Export CSS";
    exportBtn.onclick = () => {
      const css = exportCSS(vars);
      navigator.clipboard.writeText(css);
      alert("Copied CSS to clipboard");
    };

    panel.appendChild(exportBtn);
    document.body.appendChild(panel);

    // Ensure the live style tag is the final element before </body>
    document.body.appendChild(getLiveStyleTag());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createUI);
  } else {
    createUI();
  }
})();
