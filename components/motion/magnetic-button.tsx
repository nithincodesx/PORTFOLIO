"use client";

import {
  type AnchorHTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";

export type MagneticButtonProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "children" | "href"
> & {
  children: ReactNode;
  href: string;
  magnetic?: boolean;
};

const MAX_OFFSET = 8;

function supportsMagneticMotion() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }

  return (
    window.matchMedia("(pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function MagneticButton({
  children,
  magnetic = true,
  onPointerLeave,
  onPointerMove,
  ...anchorProps
}: MagneticButtonProps) {
  const anchorRef = useRef<HTMLAnchorElement>(null);
  const frameRef = useRef<number | null>(null);
  const originalTransformRef = useRef<string | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  const resetTransform = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    const anchor = anchorRef.current;
    if (anchor && originalTransformRef.current !== null) {
      anchor.style.transform = originalTransformRef.current ?? "";
    }

    originalTransformRef.current = null;
    offsetRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => resetTransform, [resetTransform]);

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      onPointerMove?.(event);

      if (
        !magnetic ||
        event.pointerType === "touch" ||
        !supportsMagneticMotion()
      ) {
        resetTransform();
        return;
      }

      const anchor = anchorRef.current;
      if (!anchor) return;

      if (originalTransformRef.current === null) {
        originalTransformRef.current = anchor.style.transform;
      }

      const bounds = anchor.getBoundingClientRect();
      if (bounds.width === 0 || bounds.height === 0) return;

      const centerX = bounds.left + bounds.width / 2;
      const centerY = bounds.top + bounds.height / 2;

      offsetRef.current = {
        x: clamp(
          ((event.clientX - centerX) / (bounds.width / 2)) * MAX_OFFSET,
          -MAX_OFFSET,
          MAX_OFFSET,
        ),
        y: clamp(
          ((event.clientY - centerY) / (bounds.height / 2)) * MAX_OFFSET,
          -MAX_OFFSET,
          MAX_OFFSET,
        ),
      };

      if (frameRef.current !== null) return;

      frameRef.current = window.requestAnimationFrame(() => {
        const currentAnchor = anchorRef.current;
        if (currentAnchor) {
          const { x, y } = offsetRef.current;
          currentAnchor.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        }
        frameRef.current = null;
      });
    },
    [magnetic, onPointerMove],
  );

  const handlePointerLeave = useCallback(
    (event: ReactPointerEvent<HTMLAnchorElement>) => {
      resetTransform();
      onPointerLeave?.(event);
    },
    [onPointerLeave, resetTransform],
  );

  return (
    <a
      {...anchorProps}
      ref={anchorRef}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      {children}
    </a>
  );
}
