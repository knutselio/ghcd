import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

interface TooltipProps {
  /** Content rendered inside the tooltip popup. */
  content: ReactNode;
  /** The trigger element (must accept focus). */
  children: ReactNode;
}

/**
 * Accessible tooltip following the W3C ARIA APG tooltip pattern.
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 *
 * - Shows on hover / focus, hides on mouseleave / blur / Escape.
 * - `role="tooltip"` + `aria-describedby` for screen readers.
 * - Auto-positions above the trigger, flipping below if clipped.
 */
export default function Tooltip({ content, children }: TooltipProps) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [above, setAbove] = useState(true);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  // Escape closes the tooltip (APG requirement)
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Position: prefer above, flip below if not enough space
  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setAbove(rect.top > 48);
  }, [open]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: wrapper delegates focus/hover from interactive children
    <span
      ref={triggerRef}
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      aria-describedby={open ? id : undefined}
    >
      {children}
      {open && (
        <div
          ref={tooltipRef}
          id={id}
          role="tooltip"
          className={`absolute left-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-lg bg-gh-badge border border-gh-border px-3 py-2 text-xs text-gh-text-primary shadow-lg ${
            above ? "bottom-full mb-2" : "top-full mt-2"
          }`}
        >
          {content}
        </div>
      )}
    </span>
  );
}
