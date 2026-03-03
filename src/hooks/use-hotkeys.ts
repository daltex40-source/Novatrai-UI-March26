import { useEffect } from "react";

type HotkeyOptions = {
  enabled?: boolean;
  preventDefault?: boolean;
};

function isTypingElement(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea" || tag === "select") return true;
  return target.isContentEditable;
}

export function useHotkeys(
  matcher: (event: KeyboardEvent) => boolean,
  handler: (event: KeyboardEvent) => void,
  options: HotkeyOptions = {},
) {
  useEffect(() => {
    if (options.enabled === false) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingElement(event.target) && !(event.metaKey || event.ctrlKey)) return;
      if (!matcher(event)) return;
      if (options.preventDefault !== false) {
        event.preventDefault();
      }
      handler(event);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [handler, matcher, options.enabled, options.preventDefault]);
}
