/* =========================================================
   Glow: mouse-follow highlight controller
   - Only applies to ".card.hover-lift"
   - Throttled with requestAnimationFrame (lightweight)
   ========================================================= */

(() => {
  const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasFinePointer = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (prefersReduced || !hasFinePointer) return;

  let activeCard = null;
  let rafId = 0;
  let lastEvent = null;

  function setGlow(card, clientX, clientY) {
    const rect = card.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;

    const cx = Math.max(0, Math.min(100, x));
    const cy = Math.max(0, Math.min(100, y));

    card.style.setProperty("--glow-x", `${cx}%`);
    card.style.setProperty("--glow-y", `${cy}%`);
  }

  function clearGlow(card) {
    card.style.removeProperty("--glow-x");
    card.style.removeProperty("--glow-y");
  }

  function onPointerMove(e) {
    lastEvent = e;
    if (rafId) return;

    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (!lastEvent) return;

      const target = lastEvent.target;
      if (!(target instanceof Element)) return;

      const card = target.closest(".card.hover-lift");
      if (!card) {
        if (activeCard) {
          clearGlow(activeCard);
          activeCard = null;
        }
        return;
      }

      if (activeCard && activeCard !== card) {
        clearGlow(activeCard);
      }
      activeCard = card;

      setGlow(card, lastEvent.clientX, lastEvent.clientY);
    });
  }

  function onPointerOut(e) {
    const from = e.target instanceof Element ? e.target.closest(".card.hover-lift") : null;
    const to = e.relatedTarget instanceof Element ? e.relatedTarget.closest(".card.hover-lift") : null;

    if (from && from !== to) {
      clearGlow(from);
      if (activeCard === from) activeCard = null;
    }
  }

  document.addEventListener("pointermove", onPointerMove, { passive: true });
  document.addEventListener("pointerout", onPointerOut, { passive: true });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && activeCard) {
      clearGlow(activeCard);
      activeCard = null;
    }
  });
})();
