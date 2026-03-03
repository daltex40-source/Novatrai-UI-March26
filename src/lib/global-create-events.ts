export type GlobalCreateType = "deal" | "case" | "task" | "invoice" | "approval" | "company";

export type GlobalCreatePayload = {
  type: GlobalCreateType;
  company?: {
    id?: string;
    name: string;
  };
};

const OPEN_CREATE_EVENT = "novatrai:open-create";

export function dispatchOpenCreate(payload: GlobalCreatePayload) {
  window.dispatchEvent(new CustomEvent<GlobalCreatePayload>(OPEN_CREATE_EVENT, { detail: payload }));
}

export function onOpenCreate(listener: (payload: GlobalCreatePayload) => void) {
  const handler: EventListener = (event) => {
    const custom = event as CustomEvent<GlobalCreatePayload>;
    if (!custom.detail) return;
    listener(custom.detail);
  };
  window.addEventListener(OPEN_CREATE_EVENT, handler);
  return () => {
    window.removeEventListener(OPEN_CREATE_EVENT, handler);
  };
}
