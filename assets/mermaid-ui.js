/* =========================================================
   Mermaid UI Helpers
   - init config for UI-consistent palette
   - post-render rounded nodes + smooth cross-fade
   ========================================================= */

(() => {
  const TRANSITION_MS = 160;

  const prefersReducedMotion = () =>
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function getMermaidInitConfig() {
    return {
      startOnLoad: false,
      securityLevel: "strict",
      theme: "base",
      flowchart: { curve: "basis", useMaxWidth: true },
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", sans-serif',
      themeVariables: {
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Noto Sans JP", sans-serif',
        fontSize: "12px",
        background: "transparent",
        mainBkg: "transparent",
        secondBkg: "transparent",
        tertiaryBkg: "transparent",
        primaryColor: "var(--panel-2)",
        primaryBorderColor: "var(--border)",
        primaryTextColor: "var(--text)",
        secondaryColor: "var(--panel-2)",
        tertiaryColor: "var(--panel)",
        lineColor: "var(--border)",
        textColor: "var(--text)",
        nodeBorder: "var(--border)",
        nodeTextColor: "var(--text)",
        clusterBkg: "transparent",
        clusterBorder: "var(--border)",
        edgeLabelBackground: "transparent"
      }
    };
  }

  function resolveNodeRadiusPx() {
    const raw = getComputedStyle(document.documentElement).getPropertyValue("--radius").trim();
    const parsed = Number.parseFloat(raw);
    if (!Number.isFinite(parsed)) return 14;
    return Math.max(12, Math.min(16, parsed));
  }

  function enforceRoundedNodes(mermaidEl) {
    const svg = mermaidEl.querySelector("svg");
    if (!svg) return;

    const radius = resolveNodeRadiusPx();
    const rects = svg.querySelectorAll(".node rect");
    rects.forEach((rect) => {
      rect.setAttribute("rx", String(radius));
      rect.setAttribute("ry", String(radius));
    });

    svg.style.background = "transparent";
  }

  function showWithTransition({ mermaidEl, fallbackEl }) {
    const reduced = prefersReducedMotion();

    if (reduced) {
      if (fallbackEl) fallbackEl.hidden = true;
      mermaidEl.classList.add("is-ready");
      return;
    }

    if (fallbackEl) {
      fallbackEl.classList.add("is-fading-out");
      window.setTimeout(() => {
        fallbackEl.hidden = true;
      }, TRANSITION_MS);
    }

    requestAnimationFrame(() => {
      mermaidEl.classList.add("is-ready");
    });
  }

  function enhanceAndAnimate({ mount, mermaidEl, fallbackEl }) {
    if (!mount || !mermaidEl) return;
    enforceRoundedNodes(mermaidEl);
    showWithTransition({ mermaidEl, fallbackEl });
  }

  window.MermaidUI = {
    getMermaidInitConfig,
    enhanceAndAnimate
  };
})();
