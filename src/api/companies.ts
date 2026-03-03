import { apiGetRaw, apiPostRaw } from "@/api/client";

export type CompanyStatus = "PROSPECT" | "ACTIVE" | "DORMANT" | "ARCHIVED";

type CompanyPrimaryContact = {
  name: string;
  email: string;
  phone: string;
};

type NormalizedCompany = {
  id: string;
  name: string;
  trading_name: string;
  registration_no: string;
  vat_no: string;
  industry: string;
  status: CompanyStatus;
  primary_contact?: CompanyPrimaryContact;
  notes?: string;
  created_at: string;
  updated_at: string;
};

export type Company = {
  id: string;
  name: string;
  tradingName: string;
  status: CompanyStatus;
  primaryContact: string;
  openDealsCount: number | null;
  openCasesCount: number | null;
  updatedAt: string;
  registrationNo: string;
  vatNo: string;
  industry: string;
  notes: string;
};

export type CompanyContact = {
  id: string;
  name: string;
  roleTitle: string;
  email: string;
  phone: string;
  isPrimary: boolean;
};

export type Person = {
  id: string;
  name: string;
  email: string;
  phone: string;
};

export type CompanyTimelineItem = {
  id: string;
  label: string;
  actor: string;
  createdAt: string;
};

export type CompanyLinkedItem = {
  id: string;
  type: string;
  label: string;
};

export type CompaniesPage = {
  items: Company[];
  nextCursor: string | null;
  source: "api" | "demo";
};

type ListCompaniesParams = {
  q?: string;
  status?: "ALL" | CompanyStatus;
  limit?: number;
  cursor?: string;
};

type DemoCompaniesStore = {
  version: 1;
  updated_at: string;
  items: NormalizedCompany[];
};

type DemoPersonRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
};

type DemoPeopleStore = {
  version: 1;
  items: DemoPersonRow[];
};

type DemoCompanyContactRow = {
  id: string;
  company_id: string;
  person_id: string;
  role_title: string;
  is_primary: boolean;
  status: string;
  created_at: string;
  updated_at: string;
};

type DemoCompanyContactsStore = {
  version: 1;
  items: DemoCompanyContactRow[];
};

declare global {
  interface Window {
    NOVATRAI?: {
      offlineCompanies?: boolean;
      offlineCompaniesToastShown?: boolean;
    };
  }
}

const COMPANIES_STORE_KEY = "novatrai_demo_companies_v1";
const PEOPLE_STORE_KEY = "novatrai_demo_people_v1";
const COMPANY_CONTACTS_STORE_KEY = "novatrai_demo_company_contacts_v1";

const seedCompaniesStore: DemoCompaniesStore = {
  version: 1,
  updated_at: "2026-03-03T12:00:00.000Z",
  items: [
    {
      id: "cmp_demo_001",
      name: "Novatrai (Pty) Ltd",
      trading_name: "Novatrai",
      registration_no: "2026/123456/07",
      vat_no: "4123456789",
      industry: "Software",
      status: "ACTIVE",
      primary_contact: {
        name: "Admin User",
        email: "admin@example.com",
        phone: "+27 82 000 0000",
      },
      notes: "Primary internal demo entity",
      created_at: "2026-03-01T08:00:00.000Z",
      updated_at: "2026-03-03T10:30:00.000Z",
    },
    {
      id: "cmp_demo_002",
      name: "Ridgeway Capital",
      trading_name: "Ridgeway",
      registration_no: "2024/445678/07",
      vat_no: "4987654321",
      industry: "Financial Services",
      status: "PROSPECT",
      primary_contact: {
        name: "Chris Naidoo",
        email: "chris@ridgeway.example.com",
        phone: "+27 82 111 0001",
      },
      notes: "Prospect in negotiation stage.",
      created_at: "2026-02-14T09:00:00.000Z",
      updated_at: "2026-03-02T13:15:00.000Z",
    },
    {
      id: "cmp_demo_003",
      name: "Goldline Holdings",
      trading_name: "Goldline",
      registration_no: "2023/908877/07",
      vat_no: "4555666777",
      industry: "Advisory",
      status: "ACTIVE",
      primary_contact: {
        name: "Tina Mokoena",
        email: "tina@goldline.example.com",
        phone: "+27 82 111 0002",
      },
      notes: "Active delivery client with multiple linked cases.",
      created_at: "2026-01-07T10:10:00.000Z",
      updated_at: "2026-03-03T09:10:00.000Z",
    },
    {
      id: "cmp_demo_004",
      name: "Summit Freight Logistics",
      trading_name: "Summit Freight",
      registration_no: "2019/100122/07",
      vat_no: "4777888999",
      industry: "Logistics",
      status: "DORMANT",
      primary_contact: {
        name: "Lebo Khumalo",
        email: "lebo@summitfreight.example.com",
        phone: "+27 82 111 0003",
      },
      notes: "Dormant account, quarterly check-ins only.",
      created_at: "2025-08-11T08:30:00.000Z",
      updated_at: "2026-02-01T11:25:00.000Z",
    },
    {
      id: "cmp_demo_005",
      name: "Northbank Engineering",
      trading_name: "Northbank Eng",
      registration_no: "2018/550044/07",
      vat_no: "4333222111",
      industry: "Engineering",
      status: "ACTIVE",
      primary_contact: {
        name: "Mila Pretorius",
        email: "mila@northbank.example.com",
        phone: "+27 82 111 0004",
      },
      notes: "Large active account with compliance approvals.",
      created_at: "2025-11-20T12:05:00.000Z",
      updated_at: "2026-03-03T07:42:00.000Z",
    },
    {
      id: "cmp_demo_006",
      name: "Blue Cedar Retail Group",
      trading_name: "Blue Cedar",
      registration_no: "2017/220199/07",
      vat_no: "4222111000",
      industry: "Retail",
      status: "ARCHIVED",
      primary_contact: {
        name: "Johan de Vries",
        email: "johan@bluecedar.example.com",
        phone: "+27 82 111 0005",
      },
      notes: "Archived after contract closure.",
      created_at: "2024-05-01T09:40:00.000Z",
      updated_at: "2025-12-18T16:00:00.000Z",
    },
  ],
};

const seedPeopleStore: DemoPeopleStore = {
  version: 1,
  items: [
    {
      id: "per_demo_001",
      first_name: "Admin",
      last_name: "User",
      email: "admin@example.com",
      phone: "+27 82 000 0000",
      created_at: "2026-03-01T08:00:00.000Z",
      updated_at: "2026-03-01T08:00:00.000Z",
    },
    {
      id: "per_demo_002",
      first_name: "Chris",
      last_name: "Naidoo",
      email: "chris@ridgeway.example.com",
      phone: "+27 82 111 0001",
      created_at: "2026-02-14T09:00:00.000Z",
      updated_at: "2026-03-02T13:15:00.000Z",
    },
    {
      id: "per_demo_003",
      first_name: "Tina",
      last_name: "Mokoena",
      email: "tina@goldline.example.com",
      phone: "+27 82 111 0002",
      created_at: "2026-01-07T10:10:00.000Z",
      updated_at: "2026-03-03T09:10:00.000Z",
    },
    {
      id: "per_demo_004",
      first_name: "Lebo",
      last_name: "Khumalo",
      email: "lebo@summitfreight.example.com",
      phone: "+27 82 111 0003",
      created_at: "2025-08-11T08:30:00.000Z",
      updated_at: "2026-02-01T11:25:00.000Z",
    },
    {
      id: "per_demo_005",
      first_name: "Mila",
      last_name: "Pretorius",
      email: "mila@northbank.example.com",
      phone: "+27 82 111 0004",
      created_at: "2025-11-20T12:05:00.000Z",
      updated_at: "2026-03-03T07:42:00.000Z",
    },
    {
      id: "per_demo_006",
      first_name: "Johan",
      last_name: "de Vries",
      email: "johan@bluecedar.example.com",
      phone: "+27 82 111 0005",
      created_at: "2024-05-01T09:40:00.000Z",
      updated_at: "2025-12-18T16:00:00.000Z",
    },
  ],
};

const seedCompanyContactsStore: DemoCompanyContactsStore = {
  version: 1,
  items: [
    {
      id: "cc_demo_001",
      company_id: "cmp_demo_001",
      person_id: "per_demo_001",
      role_title: "Owner",
      is_primary: true,
      status: "ACTIVE",
      created_at: "2026-03-01T08:00:00.000Z",
      updated_at: "2026-03-01T08:00:00.000Z",
    },
    {
      id: "cc_demo_002",
      company_id: "cmp_demo_002",
      person_id: "per_demo_002",
      role_title: "Finance Director",
      is_primary: true,
      status: "ACTIVE",
      created_at: "2026-02-14T09:00:00.000Z",
      updated_at: "2026-03-02T13:15:00.000Z",
    },
    {
      id: "cc_demo_003",
      company_id: "cmp_demo_003",
      person_id: "per_demo_003",
      role_title: "Operations Lead",
      is_primary: true,
      status: "ACTIVE",
      created_at: "2026-01-07T10:10:00.000Z",
      updated_at: "2026-03-03T09:10:00.000Z",
    },
    {
      id: "cc_demo_004",
      company_id: "cmp_demo_004",
      person_id: "per_demo_004",
      role_title: "Owner",
      is_primary: true,
      status: "ACTIVE",
      created_at: "2025-08-11T08:30:00.000Z",
      updated_at: "2026-02-01T11:25:00.000Z",
    },
    {
      id: "cc_demo_005",
      company_id: "cmp_demo_005",
      person_id: "per_demo_005",
      role_title: "CFO",
      is_primary: true,
      status: "ACTIVE",
      created_at: "2025-11-20T12:05:00.000Z",
      updated_at: "2026-03-03T07:42:00.000Z",
    },
    {
      id: "cc_demo_006",
      company_id: "cmp_demo_006",
      person_id: "per_demo_006",
      role_title: "Former Director",
      is_primary: true,
      status: "ACTIVE",
      created_at: "2024-05-01T09:40:00.000Z",
      updated_at: "2025-12-18T16:00:00.000Z",
    },
  ],
};

function toText(value: unknown): string {
  if (value == null) return "";
  return String(value).trim();
}

function normalizeStatus(value: unknown): CompanyStatus {
  const status = toText(value).toUpperCase().replaceAll(" ", "_");
  if (status === "ACTIVE" || status === "DORMANT" || status === "ARCHIVED") return status;
  return "PROSPECT";
}

function toNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const text = toText(value);
  if (!text) return null;
  const parsed = Number.parseInt(text, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function extractItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  if (Array.isArray(record.items)) return record.items;
  if (Array.isArray(record.results)) return record.results;
  if (record.data && typeof record.data === "object") {
    const data = record.data as Record<string, unknown>;
    if (Array.isArray(data.items)) return data.items;
    if (Array.isArray(data.results)) return data.results;
  }
  return [];
}

function getNovatraiRuntime() {
  if (!window.NOVATRAI) window.NOVATRAI = {};
  return window.NOVATRAI;
}

function markCompaniesOffline() {
  const runtime = getNovatraiRuntime();
  runtime.offlineCompanies = true;
}

function markCompaniesOnline() {
  const runtime = getNovatraiRuntime();
  runtime.offlineCompanies = false;
  runtime.offlineCompaniesToastShown = false;
}

function isCompaniesOfflineMode() {
  const runtime = getNovatraiRuntime();
  return runtime.offlineCompanies === true;
}

function parseDemoCompaniesStore(raw: unknown): DemoCompaniesStore | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  if (!Array.isArray(record.items)) return null;

  const items = record.items
    .map((item) => normalizeCompany(item))
    .filter((item): item is NormalizedCompany => item !== null);

  return {
    version: 1,
    updated_at: toText(record.updated_at) || new Date().toISOString(),
    items,
  };
}

function readCompaniesStore(): DemoCompaniesStore {
  try {
    const raw = window.localStorage.getItem(COMPANIES_STORE_KEY);
    if (!raw) return seedCompaniesStore;
    const parsed: unknown = JSON.parse(raw);
    return parseDemoCompaniesStore(parsed) ?? seedCompaniesStore;
  } catch {
    return seedCompaniesStore;
  }
}

function writeCompaniesStore(store: DemoCompaniesStore) {
  try {
    window.localStorage.setItem(COMPANIES_STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore local write failures.
  }
}

function readPeopleStore(): DemoPeopleStore {
  try {
    const raw = window.localStorage.getItem(PEOPLE_STORE_KEY);
    if (!raw) return seedPeopleStore;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return seedPeopleStore;
    const record = parsed as Record<string, unknown>;
    if (!Array.isArray(record.items)) return seedPeopleStore;
    return {
      version: 1,
      items: record.items
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id: toText(item.id) || `per_demo_${Date.now()}`,
          first_name: toText(item.first_name),
          last_name: toText(item.last_name),
          email: toText(item.email),
          phone: toText(item.phone),
          created_at: toText(item.created_at) || new Date().toISOString(),
          updated_at: toText(item.updated_at) || new Date().toISOString(),
        })),
    };
  } catch {
    return seedPeopleStore;
  }
}

function writePeopleStore(store: DemoPeopleStore) {
  try {
    window.localStorage.setItem(PEOPLE_STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore local write failures.
  }
}

function readCompanyContactsStore(): DemoCompanyContactsStore {
  try {
    const raw = window.localStorage.getItem(COMPANY_CONTACTS_STORE_KEY);
    if (!raw) return seedCompanyContactsStore;
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return seedCompanyContactsStore;
    const record = parsed as Record<string, unknown>;
    if (!Array.isArray(record.items)) return seedCompanyContactsStore;
    return {
      version: 1,
      items: record.items
        .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
        .map((item) => ({
          id: toText(item.id) || `cc_demo_${Date.now()}`,
          company_id: toText(item.company_id),
          person_id: toText(item.person_id),
          role_title: toText(item.role_title),
          is_primary: item.is_primary === true,
          status: toText(item.status) || "ACTIVE",
          created_at: toText(item.created_at) || new Date().toISOString(),
          updated_at: toText(item.updated_at) || new Date().toISOString(),
        })),
    };
  } catch {
    return seedCompanyContactsStore;
  }
}

function writeCompanyContactsStore(store: DemoCompanyContactsStore) {
  try {
    window.localStorage.setItem(COMPANY_CONTACTS_STORE_KEY, JSON.stringify(store));
  } catch {
    // Ignore local write failures.
  }
}

function cloneSeed<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function normalizeCompany(raw: unknown): NormalizedCompany | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;

  const id = toText(item.id || item.company_id || item.companyId);
  const name = toText(item.name || item.legal_name || item.company_name);
  if (!id || !name) return null;

  const contactRaw = item.primary_contact;
  const primaryContact =
    contactRaw && typeof contactRaw === "object"
      ? {
          name: toText((contactRaw as Record<string, unknown>).name),
          email: toText((contactRaw as Record<string, unknown>).email),
          phone: toText((contactRaw as Record<string, unknown>).phone),
        }
      : undefined;

  return {
    id,
    name,
    trading_name: toText(item.trading_name || item.tradingName),
    registration_no: toText(item.registration_no || item.registrationNo),
    vat_no: toText(item.vat_no || item.vatNo),
    industry: toText(item.industry),
    status: normalizeStatus(item.status),
    primary_contact: primaryContact,
    notes: toText(item.notes || item.note),
    created_at: toText(item.created_at || item.createdAt || item.updated_at || item.updatedAt) || new Date().toISOString(),
    updated_at: toText(item.updated_at || item.updatedAt || item.created_at || item.createdAt) || new Date().toISOString(),
  };
}

function toCompanyModel(raw: unknown): Company | null {
  const normalized = normalizeCompany(raw);
  if (!normalized) return null;

  const record = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

  return {
    id: normalized.id,
    name: normalized.name,
    tradingName: normalized.trading_name,
    status: normalized.status,
    primaryContact:
      normalized.primary_contact?.name ||
      toText(record.primary_contact_name || record.primaryContact || record.contact_name),
    openDealsCount: toNumber(record.open_deals_count ?? record.openDealsCount),
    openCasesCount: toNumber(record.open_cases_count ?? record.openCasesCount),
    updatedAt: normalized.updated_at,
    registrationNo: normalized.registration_no,
    vatNo: normalized.vat_no,
    industry: normalized.industry,
    notes: normalized.notes || "",
  };
}

function listCompaniesFromDemo(params: ListCompaniesParams): CompaniesPage {
  const limit = params.limit ?? 20;
  const query = params.q?.trim().toLowerCase() ?? "";
  const status = params.status ?? "ALL";
  const cursor = params.cursor ?? "0";

  const store = readCompaniesStore();
  const filtered = store.items.filter((item) => {
    const queryMatch = !query || item.name.toLowerCase().includes(query) || item.trading_name.toLowerCase().includes(query);
    const statusMatch = status === "ALL" || item.status === status;
    return queryMatch && statusMatch;
  });

  const offset = Number.parseInt(cursor, 10) || 0;
  const page = filtered.slice(offset, offset + limit).map(toCompanyModel).filter((item): item is Company => item !== null);
  const nextCursor = offset + limit < filtered.length ? String(offset + limit) : null;

  return {
    items: page,
    nextCursor,
    source: "demo",
  };
}

export async function listCompanies(params: ListCompaniesParams = {}): Promise<CompaniesPage> {
  if (isCompaniesOfflineMode()) {
    return listCompaniesFromDemo(params);
  }

  try {
    const qs = new URLSearchParams();
    if (params.q?.trim()) qs.set("q", params.q.trim());
    if (params.status && params.status !== "ALL") qs.set("status", params.status);
    qs.set("limit", String(params.limit ?? 20));
    if (params.cursor) qs.set("cursor", params.cursor);

    const payload = await apiGetRaw(`/companies?${qs.toString()}`);
    const items = extractItems(payload).map(toCompanyModel).filter((item): item is Company => item !== null);
    const record = payload && typeof payload === "object" ? (payload as Record<string, unknown>) : {};
    const nextCursor = toText(record.next_cursor ?? record.nextCursor) || null;

    return { items, nextCursor, source: "api" };
  } catch {
    markCompaniesOffline();
    return listCompaniesFromDemo(params);
  }
}

export async function searchCompanies(query: string, limit = 8): Promise<{ items: Company[]; source: "api" | "demo" }> {
  const page = await listCompanies({ q: query, limit });
  return { items: page.items, source: page.source };
}

export async function createCompany(input: { name: string; tradingName?: string; status?: CompanyStatus }): Promise<Company> {
  if (!isCompaniesOfflineMode()) {
    try {
      const raw = await apiPostRaw("/companies", {
        name: input.name,
        trading_name: input.tradingName || "",
        status: input.status || "PROSPECT",
      });
      const company = toCompanyModel(raw);
      if (!company) throw new Error("Invalid company payload");
      return company;
    } catch {
      markCompaniesOffline();
    }
  }

  const store = readCompaniesStore();
  const now = new Date().toISOString();
  const next: NormalizedCompany = {
    id: `cmp_demo_${Date.now()}`,
    name: input.name.trim(),
    trading_name: (input.tradingName || "").trim(),
    registration_no: "",
    vat_no: "",
    industry: "",
    status: input.status || "PROSPECT",
    notes: "",
    created_at: now,
    updated_at: now,
  };

  writeCompaniesStore({
    version: 1,
    updated_at: now,
    items: [next, ...store.items],
  });

  const mapped = toCompanyModel(next);
  if (!mapped) throw new Error("Failed to create company");
  return mapped;
}

export async function getCompanyById(companyId: string): Promise<Company | null> {
  if (!isCompaniesOfflineMode()) {
    try {
      const payload = await apiGetRaw(`/companies/${encodeURIComponent(companyId)}`);
      return toCompanyModel(payload);
    } catch {
      markCompaniesOffline();
    }
  }

  return readCompaniesStore().items.map(toCompanyModel).find((item) => item?.id === companyId) ?? null;
}

export async function updateCompany(companyId: string, patch: Partial<Pick<Company, "status" | "notes">>): Promise<void> {
  if (!isCompaniesOfflineMode()) {
    try {
      await apiPostRaw(`/companies/${encodeURIComponent(companyId)}`, patch);
      return;
    } catch {
      markCompaniesOffline();
    }
  }

  const store = readCompaniesStore();
  const now = new Date().toISOString();
  const nextItems = store.items.map((item) =>
    item.id === companyId
      ? {
          ...item,
          ...(patch.status ? { status: patch.status } : {}),
          ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
          updated_at: now,
        }
      : item,
  );

  writeCompaniesStore({
    version: 1,
    updated_at: now,
    items: nextItems,
  });
}

function normalizeTimelineItem(raw: unknown): CompanyTimelineItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const label = toText(item.summary || item.text || item.description || item.message || item.event);
  if (!label) return null;
  return {
    id: toText(item.id || item.event_id) || crypto.randomUUID(),
    label,
    actor: toText(item.actor || item.actor_name || item.created_by_name) || "System",
    createdAt: toText(item.created_at || item.createdAt || item.timestamp) || new Date().toISOString(),
  };
}

function normalizeLinkedItem(raw: unknown): CompanyLinkedItem | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = toText(item.id || item.entity_id || item.document_id);
  if (!id) return null;
  return {
    id,
    type: toText(item.entity_type || item.type) || "Entity",
    label: toText(item.title || item.name || item.label) || `Record ${id}`,
  };
}

export async function getCompanyTimeline(companyId: string): Promise<CompanyTimelineItem[]> {
  if (isCompaniesOfflineMode()) return [];
  try {
    const payload = await apiGetRaw(`/entities/Company/${encodeURIComponent(companyId)}/timeline?limit=50`);
    return extractItems(payload).map(normalizeTimelineItem).filter((item): item is CompanyTimelineItem => item !== null);
  } catch {
    markCompaniesOffline();
    return [];
  }
}

export async function getCompanyLinks(companyId: string): Promise<CompanyLinkedItem[]> {
  if (isCompaniesOfflineMode()) return [];
  try {
    const payload = await apiGetRaw(`/entities/Company/${encodeURIComponent(companyId)}/links`);
    return extractItems(payload).map(normalizeLinkedItem).filter((item): item is CompanyLinkedItem => item !== null);
  } catch {
    markCompaniesOffline();
    return [];
  }
}

function normalizeContact(raw: unknown): CompanyContact | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = toText(item.id || item.contact_id || item.person_id || item.personId);
  const name = toText(item.name || item.full_name || item.person_name);
  if (!id || !name) return null;
  return {
    id,
    name,
    roleTitle: toText(item.role_title || item.roleTitle || item.role),
    email: toText(item.email),
    phone: toText(item.phone || item.mobile),
    isPrimary: item.is_primary === true || item.primary === true,
  };
}

function getOfflineCompanyContacts(companyId: string): CompanyContact[] {
  const people = readPeopleStore().items;
  const joins = readCompanyContactsStore().items.filter((item) => item.company_id === companyId && item.status !== "ARCHIVED");

  return joins
    .map((join) => {
      const person = people.find((p) => p.id === join.person_id);
      if (!person) return null;
      return {
        id: join.id,
        name: `${person.first_name} ${person.last_name}`.trim(),
        roleTitle: join.role_title,
        email: person.email,
        phone: person.phone,
        isPrimary: join.is_primary,
      };
    })
    .filter((item): item is CompanyContact => item !== null);
}

export async function getCompanyContacts(companyId: string): Promise<{ contacts: CompanyContact[]; wired: boolean }> {
  if (isCompaniesOfflineMode()) {
    return { contacts: getOfflineCompanyContacts(companyId), wired: true };
  }

  try {
    const payload = await apiGetRaw(`/companies/${encodeURIComponent(companyId)}/contacts`);
    const contacts = extractItems(payload).map(normalizeContact).filter((item): item is CompanyContact => item !== null);
    return { contacts, wired: true };
  } catch {
    markCompaniesOffline();
    return { contacts: getOfflineCompanyContacts(companyId), wired: true };
  }
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  if (!trimmed) return { firstName: "", lastName: "" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  return { firstName: parts[0], lastName: parts.slice(1).join(" ") };
}

export async function addCompanyContact(companyId: string, personId: string): Promise<boolean> {
  if (!isCompaniesOfflineMode()) {
    try {
      await apiPostRaw(`/companies/${encodeURIComponent(companyId)}/contacts`, { person_id: personId });
      return true;
    } catch {
      markCompaniesOffline();
    }
  }

  const store = readCompanyContactsStore();
  const now = new Date().toISOString();
  const exists = store.items.some((item) => item.company_id === companyId && item.person_id === personId && item.status !== "ARCHIVED");
  if (exists) return true;

  const next: DemoCompanyContactRow = {
    id: `cc_demo_${Date.now()}`,
    company_id: companyId,
    person_id: personId,
    role_title: "Contact",
    is_primary: false,
    status: "ACTIVE",
    created_at: now,
    updated_at: now,
  };

  writeCompanyContactsStore({
    version: 1,
    items: [next, ...store.items],
  });

  return true;
}

function normalizePerson(raw: unknown): Person | null {
  if (!raw || typeof raw !== "object") return null;
  const item = raw as Record<string, unknown>;
  const id = toText(item.id || item.person_id || item.personId);
  const firstName = toText(item.first_name || item.firstName);
  const lastName = toText(item.last_name || item.lastName);
  const name = toText(item.name || item.full_name) || `${firstName} ${lastName}`.trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    email: toText(item.email),
    phone: toText(item.phone || item.mobile),
  };
}

export async function searchPeople(q: string): Promise<Person[]> {
  if (!isCompaniesOfflineMode()) {
    try {
      const payload = await apiGetRaw(`/people?q=${encodeURIComponent(q)}&limit=20`);
      return extractItems(payload).map(normalizePerson).filter((item): item is Person => item !== null);
    } catch {
      markCompaniesOffline();
    }
  }

  const local = readPeopleStore().items;
  const needle = q.toLowerCase();
  return local
    .map((item): Person => ({
      id: item.id,
      name: `${item.first_name} ${item.last_name}`.trim(),
      email: item.email,
      phone: item.phone,
    }))
    .filter((item) => item.name.toLowerCase().includes(needle) || item.email.toLowerCase().includes(needle));
}

export async function createPerson(input: { name: string; email?: string; phone?: string }): Promise<Person> {
  if (!isCompaniesOfflineMode()) {
    try {
      const payload = await apiPostRaw("/people", {
        name: input.name,
        email: input.email || "",
        phone: input.phone || "",
      });
      const person = normalizePerson(payload);
      if (!person) throw new Error("Invalid person payload");
      return person;
    } catch {
      markCompaniesOffline();
    }
  }

  const store = readPeopleStore();
  const now = new Date().toISOString();
  const split = splitName(input.name);
  const next: DemoPersonRow = {
    id: `per_demo_${Date.now()}`,
    first_name: split.firstName,
    last_name: split.lastName,
    email: (input.email || "").trim(),
    phone: (input.phone || "").trim(),
    created_at: now,
    updated_at: now,
  };

  writePeopleStore({
    version: 1,
    items: [next, ...store.items],
  });

  return {
    id: next.id,
    name: `${next.first_name} ${next.last_name}`.trim(),
    email: next.email,
    phone: next.phone,
  };
}

export async function linkCompanyPerson(companyId: string, personId: string): Promise<boolean> {
  if (!isCompaniesOfflineMode()) {
    try {
      await apiPostRaw("/entity-links", {
        source_entity_type: "Company",
        source_entity_id: companyId,
        target_entity_type: "Person",
        target_entity_id: personId,
        link_type: "company.contact",
      });
      return true;
    } catch {
      markCompaniesOffline();
    }
  }

  return addCompanyContact(companyId, personId);
}

export function shouldShowCompaniesOfflineToast(): boolean {
  const runtime = getNovatraiRuntime();
  if (!runtime.offlineCompanies) return false;
  if (runtime.offlineCompaniesToastShown) return false;
  runtime.offlineCompaniesToastShown = true;
  return true;
}

export function seedDemoCompanyStores() {
  writeCompaniesStore(cloneSeed(seedCompaniesStore));
  writePeopleStore(cloneSeed(seedPeopleStore));
  writeCompanyContactsStore(cloneSeed(seedCompanyContactsStore));
}

export function resetDemoCompanyStores() {
  try {
    window.localStorage.removeItem(COMPANIES_STORE_KEY);
    window.localStorage.removeItem(PEOPLE_STORE_KEY);
    window.localStorage.removeItem(COMPANY_CONTACTS_STORE_KEY);
  } catch {
    // Ignore storage failures.
  }
  seedDemoCompanyStores();
}

export function forceCompaniesOfflineMode() {
  markCompaniesOffline();
}

export function forceCompaniesOnlineMode() {
  markCompaniesOnline();
}
