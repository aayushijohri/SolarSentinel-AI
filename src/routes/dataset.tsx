import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Search, UploadCloud, FileText, Trash2 } from "lucide-react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { uploadTelemetry, fetchIngestionHistory, deleteDataset } from "@/lib/api";
import { toast } from "sonner";

export const Route = createFileRoute("/dataset")({
  head: () => ({
    meta: [
      { title: "Dataset · SolarSentinel AI" },
      { name: "description", content: "Catalog of solar events and telemetry windows." },
    ],
  }),
  component: Dataset,
});

function Dataset() {
  const [q, setQ] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const { data: history, refetch, isLoading } = useQuery({
    queryKey: ['ingestion-history', q],
    queryFn: () => fetchIngestionHistory(q),
  });

  const [isSyncing, setIsSyncing] = useState(false);

  // All query keys used across the platform — kept explicit so we can refetch
  // them in a predictable order rather than relying on wildcard matching.
  const ALL_QUERY_KEYS = [
    ['ingestion-history'],
    ['mission-status-home'],
    ['mission-status-full'],
    ['mission-status-obs'],
    ['waveform', 'SoLEXS'],
    ['nowcast'],
    ['analytics-full'],
  ] as const;

  const syncAllCaches = async () => {
    setIsSyncing(true);
    try {
      // 1. Mark every query stale immediately so no component renders
      //    cached values while the refetch is in flight.
      queryClient.invalidateQueries();

      // 2. Await active refetches for every key we care about so fresh
      //    data is in the cache BEFORE the success toast fires.
      await Promise.allSettled(
        ALL_QUERY_KEYS.map((key) =>
          queryClient.refetchQueries({ queryKey: key, type: 'active' })
        )
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpload = async () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
    if (!fileInput.files?.[0]) return;

    const file = fileInput.files[0];
    const instrument = instrumentSelect.value;

    // Phase 1 — show uploading indicator
    const uploadingId = toast.loading("Uploading telemetry…", {
      description: (
        <div className="font-mono text-xs mt-1 text-white/60">
          Processing {file.name} through the AI pipeline…
        </div>
      ),
    });

    try {
      const res = await uploadTelemetry(file, instrument);
      fileInput.value = "";

      // Phase 2 — dismiss uploading toast, start sync notification
      toast.dismiss(uploadingId);
      const syncId = toast.loading("Telemetry uploaded successfully. Updating mission intelligence…", {
        description: (
          <div className="font-mono text-xs mt-1.5 space-y-1 text-white/70">
            <div>Filename: {file.name}</div>
            <div>Rows Processed: {res.rows_processed}</div>
            <div>Instrument: {instrument}</div>
          </div>
        ),
      });

      // Phase 3 — await full cache synchronisation
      await syncAllCaches();

      // Phase 4 — confirm synchronisation complete
      toast.dismiss(syncId);
      toast.success("Mission intelligence synchronized successfully.", {
        description: (
          <div className="font-mono text-xs mt-1.5 space-y-1 text-white/70">
            <div>All dashboards updated with new telemetry.</div>
            <div>{res.rows_processed} rows integrated across the platform.</div>
          </div>
        ),
        duration: 5000,
      });

    } catch (err: any) {
      toast.dismiss(uploadingId);
      const errMsg = err?.response?.data?.detail || "Upload failed. Check backend connectivity.";
      toast.error("Upload Failed", { description: errMsg, duration: 5000 });
    }
  };


  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const deletingId = toast.loading("Removing dataset…", {
      description: `Deleting ${deleteTarget.filename} and its telemetry records…`,
    });
    try {
      await deleteDataset(deleteTarget.id);
      toast.dismiss(deletingId);
      setDeleteTarget(null);

      const syncId = toast.loading("Dataset removed. Synchronizing mission intelligence…");
      await syncAllCaches();
      toast.dismiss(syncId);

      toast.success("Mission intelligence synchronized successfully.", {
        description: `${deleteTarget.filename} and all associated telemetry have been removed.`,
        duration: 4000,
      });
    } catch (err: any) {
      toast.dismiss(deletingId);
      const errMsg = err?.response?.data?.detail || "Failed to delete dataset.";
      toast.error("Deletion Failed", { description: errMsg, duration: 5000 });
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = history?.filter((x: any) => 
    !q || 
    x.filename.toLowerCase().includes(q.toLowerCase()) || 
    x.id.toLowerCase().includes(q.toLowerCase()) ||
    x.instrument.toLowerCase().includes(q.toLowerCase()) ||
    x.ts.toLowerCase().includes(q.toLowerCase())
  ) || [];

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Mission Control"
        title={<>Telemetry <span className="text-gradient-solar">Ingestion</span></>}
        description="Upload Aditya-L1 Level-1 telemetry datasets (CSV/FITS) to trigger the AI processing pipeline."
      />

      <div className="glass rounded-2xl p-6 mb-6">
        <div className="text-[11px] font-mono tracking-[0.3em] text-[#FF8C1A] uppercase mb-4">Pipeline Upload</div>
        <div className="flex flex-wrap items-center gap-4">
          <select id="instrument-select" className="bg-[#0A0D14] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none">
            <option value="SoLEXS">SoLEXS (SXR)</option>
            <option value="HEL1OS">HEL1OS (HXR)</option>
            <option value="VELC">VELC (Visible)</option>
            <option value="SUIT">SUIT (UV)</option>
          </select>
          <input type="file" id="file-upload" className="text-xs text-white/40 file:bg-white/10 file:text-white file:border-0 file:py-2 file:px-4 file:rounded-lg file:mr-4" />
          <button
            onClick={handleUpload}
            disabled={isSyncing}
            className="bg-[#3BA4FF] text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:brightness-110 transition disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
          >
            <UploadCloud className="size-3.5" />
            {isSyncing ? "Synchronizing…" : "Start Pipeline"}
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl p-5 overflow-hidden">
         <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3 glass-strong px-4 py-2 rounded-xl flex-1 max-w-md">
              <Search className="size-4 text-white/40" />
              <input 
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search ingestion history..." 
                className="bg-transparent text-sm w-full focus:outline-none" 
              />
            </div>
            <div className="text-[11px] font-mono text-white/45 uppercase tracking-widest px-3">
              Total Ingested: {history?.length || 0}
            </div>
         </div>

         {isLoading ? (
            <div className="py-12 text-center text-white/40 font-mono text-sm animate-pulse">Scanning repository...</div>
         ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                 <thead>
                   <tr className="text-[10px] uppercase tracking-widest text-white/30 border-b border-white/5">
                     <th className="py-3 px-4">ID</th>
                     <th className="py-3 px-4">Timestamp</th>
                     <th className="py-3 px-4">Instrument</th>
                     <th className="py-3 px-4">Filename</th>
                     <th className="py-3 px-4">Status</th>
                     <th className="py-3 px-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-white/5">
                   {filtered.map((r: any) => (
                     <tr key={r.id} className="group hover:bg-white/[0.02] transition">
                       <td className="py-4 px-4 font-mono text-[#3BA4FF]">{r.id}</td>
                       <td className="py-4 px-4 text-white/50">{r.ts}</td>
                       <td className="py-4 px-4">
                         <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-white/80">
                           {r.instrument}
                         </span>
                       </td>
                       <td className="py-4 px-4 text-white/85 flex items-center gap-2">
                         <FileText className="size-3 text-white/40" />
                         {r.filename}
                       </td>
                       <td className="py-4 px-4">
                         <div className="flex items-center gap-2">
                           <span className={`size-1.5 rounded-full ${r.status?.toUpperCase() === 'FAILED' ? 'bg-[#FF4D4D] shadow-[0_0_8px_#FF4D4D]' : 'bg-[#3BFF9A] shadow-[0_0_8px_#3BFF9A]'}`} />
                           <span className={`text-[11px] font-mono ${r.status?.toUpperCase() === 'FAILED' ? 'text-[#FF4D4D]' : 'text-[#3BFF9A]'}`}>{r.status}</span>
                         </div>
                       </td>
                       <td className="py-4 px-4 text-right">
                         <button 
                           onClick={() => setDeleteTarget(r)}
                           className="p-1.5 text-white/45 hover:text-red-400 rounded transition"
                           title="Delete Dataset"
                         >
                           <Trash2 className="size-3.5" />
                         </button>
                       </td>
                     </tr>
                   ))}
                   {!isLoading && (!history || history.length === 0) && (
                     <tr>
                       <td colSpan={6} className="py-12 text-center text-white/20 text-xs italic font-mono">No telemetry datasets uploaded yet.</td>
                     </tr>
                   )}
                   {!isLoading && history && history.length > 0 && filtered.length === 0 && (
                     <tr>
                       <td colSpan={6} className="py-12 text-center text-white/20 text-xs italic font-mono">No matching records found.</td>
                     </tr>
                   )}
                 </tbody>
              </table>
            </div>
         )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass rounded-2xl p-6 max-w-sm w-full border border-white/10 shadow-2xl relative">
            <h3 className="text-white font-mono text-base font-semibold mb-2">Delete Dataset?</h3>
            <p className="text-white/60 text-xs mb-6">
              This will permanently remove the uploaded telemetry from the database.
            </p>
            <div className="flex justify-end gap-3 font-mono text-xs">
              <button 
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500/25 border border-red-500/50 text-red-200 hover:bg-red-500/40 hover:text-white transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
}
