"use client";

import { useEffect, type ReactNode } from "react";
import ReactLenis, { useLenis } from "lenis/react";

/* ─────────────────────────────────────────────────────────────────────────────
   LENIS smooth scrolling — the Project Gallery card stack (Skiper 16
   reference) wraps its demo in <ReactLenis root>, and the gallery inherits
   that behavior from here. Root mode drives real window scrolling, so
   position: sticky keeps working and every other section is untouched —
   the whole page just scrolls fluidly.

   While Lenis is active, globals.css neutralizes html { scroll-behavior:
   smooth }, so same-page anchor links (navbar, footer) are routed through
   Lenis here to keep them smooth.
───────────────────────────────────────────────────────────────────────────── */

function SmoothAnchors() {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis) return;

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const anchor = (event.target as Element | null)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.length < 2) return;

      let target: Element | null;
      try {
        target = document.querySelector(href);
      } catch {
        return; /* not a valid selector */
      }
      if (!target) return;

      event.preventDefault();
      /* Preserve native hash-in-URL behavior without triggering a jump. */
      window.history.pushState(null, "", href);
      /* -96 clears the fixed navbar (~78px) plus a little breathing room.
         Default lerp smoothing keeps anchor jumps consistent with wheel
         scrolling (passing `duration` would need an explicit easing). */
      lenis.scrollTo(target as HTMLElement, { offset: -96 });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [lenis]);

  return null;
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  return (
    <ReactLenis root>
      <SmoothAnchors />
      {children}
    </ReactLenis>
  );
}
