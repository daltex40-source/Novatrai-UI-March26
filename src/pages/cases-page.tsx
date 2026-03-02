import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { addCaseNote, getCaseById, getCaseNotes, getMyCases, updateCaseStatus } from "@/api/services";
import type { Case, CaseNote } from "@/api/types";
import { LifecycleBanner } from "@/components/shared/lifecycle-banner";
import { ObjectDrawer } from "@/components/shared/object-drawer";
import { StatusPill } from "@/components/shared/status-pill";
import { Button } from "@/components/ui/button";

const caseLifecycle = ["OPEN", "IN_PROGRESS", "WAITING", "CLOSED", "CANCELLED"];

export function CasesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [notes, setNotes] = useState<CaseNote[]>([]);
  const [noteText, setNoteText] = useState("");
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        setCases(await getMyCases());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load cases");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    const openCaseId = searchParams.get("caseId");
    if (!openCaseId || cases.length === 0) return;

    const exists = cases.some((item) => item.id === openCaseId);
    if (!exists) return;

    setSelectedCaseId(openCaseId);
    searchParams.delete("caseId");
    setSearchParams(searchParams, { replace: true });
  }, [cases, searchParams, setSearchParams]);

  const selectedCase = useMemo(
    () => cases.find((item) => item.id === selectedCaseId) ?? null,
    [cases, selectedCaseId],
  );

  useEffect(() => {
    if (!selectedCaseId) {
      setNotes([]);
      return;
    }
    const loadNotes = async () => {
      try {
        setNotes(await getCaseNotes(selectedCaseId));
      } catch {
        setNotes([]);
      }
    };
    void loadNotes();
  }, [selectedCaseId]);

  const promoteCaseStatus = async () => {
    if (!selectedCase) return;

    const nextStatus: Case["status"] =
      selectedCase.status === "OPEN" || selectedCase.status === "WAITING" ? "IN_PROGRESS" : "CLOSED";

    setUpdatingStatus(true);
    setError(null);
    try {
      await updateCaseStatus(selectedCase.id, nextStatus);
      const refreshed = await getCaseById(selectedCase.id);
      setCases((current) =>
        current.map((item) =>
          item.id === selectedCase.id
            ? {
                ...item,
                status: refreshed?.status ?? nextStatus,
                updatedAt: refreshed?.updatedAt ?? new Date().toISOString(),
              }
            : item,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update case status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const submitNote = async () => {
    if (!selectedCaseId || !noteText.trim()) return;
    setSavingNote(true);
    setError(null);
    try {
      await addCaseNote(selectedCaseId, noteText.trim());
      setNoteText("");
      setNotes(await getCaseNotes(selectedCaseId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-2xl font-semibold">Cases</h2>
        <p className="text-sm text-muted-foreground">Lifecycle visibility across active service work.</p>
      </header>

      {error ? <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-900">{error}</p> : null}

      <div className="rounded-lg border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Case</th>
              <th className="px-4 py-3">Account</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-5 text-muted-foreground" colSpan={4}>
                  Loading cases...
                </td>
              </tr>
            ) : null}
            {!loading && cases.length === 0 ? (
              <tr>
                <td className="px-4 py-5 text-muted-foreground" colSpan={4}>
                  No cases found.
                </td>
              </tr>
            ) : null}
            {cases.map((item) => (
              <tr key={item.id} className="cursor-pointer border-b last:border-b-0 hover:bg-slate-50" onClick={() => setSelectedCaseId(item.id)}>
                <td className="px-4 py-3 font-medium">{item.title}</td>
                <td className="px-4 py-3">{item.accountName}</td>
                <td className="px-4 py-3"><StatusPill status={item.status} /></td>
                <td className="px-4 py-3 text-muted-foreground">{new Date(item.updatedAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ObjectDrawer
        open={Boolean(selectedCase)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCaseId(null);
            setNoteText("");
          }
        }}
        title={selectedCase?.title ?? "Case"}
        status={selectedCase?.status ?? "OPEN"}
        lifecycleSteps={caseLifecycle}
        currentStatus={selectedCase?.status ?? "OPEN"}
        primaryAction={
          <Button size="sm" onClick={() => void promoteCaseStatus()} disabled={updatingStatus}>
            {updatingStatus ? "Updating..." : "Advance Status"}
          </Button>
        }
        overview={
          <div className="space-y-3 text-sm">
            <p><span className="font-medium">Case ID:</span> {selectedCase?.id}</p>
            <p><span className="font-medium">Account:</span> {selectedCase?.accountName}</p>
            <LifecycleBanner steps={caseLifecycle} currentStatus={selectedCase?.status ?? "OPEN"} />
          </div>
        }
        timeline={
          <div className="space-y-3 text-sm">
            <div className="space-y-2">
              <textarea
                className="min-h-24 w-full rounded-md border p-2"
                placeholder="Add a case note..."
                value={noteText}
                onChange={(event) => setNoteText(event.target.value)}
              />
              <Button size="sm" variant="secondary" onClick={() => void submitNote()} disabled={savingNote || !noteText.trim()}>
                {savingNote ? "Saving..." : "Add Note"}
              </Button>
            </div>

            {notes.length === 0 ? <p className="text-muted-foreground">No timeline notes yet.</p> : null}
            {notes.map((note) => (
              <div key={note.id} className="rounded-md border p-3">
                <p>{note.text}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {note.authorName} - {new Date(note.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        }
        linked={
          <div className="space-y-2 text-sm">
            <p className="rounded-md border p-3">Document: MSA Amendment v4</p>
            <p className="rounded-md border p-3">Task: Legal review follow-up</p>
          </div>
        }
      />
    </section>
  );
}
