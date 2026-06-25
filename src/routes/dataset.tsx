import { createFileRoute } from "@tanstack/react-router";
import { PageShell, SectionHeader } from "@/components/PageShell";
import { Search, UploadCloud, FileText } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { uploadTelemetry, fetchIngestionHistory } from "@/lib/api";

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

  const { data: history, refetch, isLoading } = useQuery({
    queryKey: ['ingestion-history'],
    queryFn: fetchIngestionHistory,
  });

  const handleUpload = async () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    const instrumentSelect = document.getElementById('instrument-select') as HTMLSelectElement;
    if (fileInput.files?.[0]) {
      try {
        const res = await uploadTelemetry(fileInput.files[0], instrumentSelect.value);
        alert(`Ingestion Successful! Tracking ID: ${res.report_id}`);
        refetch();
      } catch (err) {
        alert("Upload failed. Check backend connectivity.");
      }
    }
  };

  const filtered = history?.filter((x: any) => 
    !q || x.filename.toLowerCase().includes(q.toLowerCase()) || x.id.toLowerCase().includes(q.toLowerCase())
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
          <button onClick={handleUpload} className="bg-[#3BA4FF] text-white text-xs font-semibold px-6 py-2.5 rounded-lg flex items-center gap-2 hover:brightness-110 transition">
            <UploadCloud className="size-3.5" /> Start Pipeline
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
                          <span className="size-1.5 rounded-full bg-[#3BFF9A] shadow-[0_0_8px_#3BFF9A]" />
                          <span className="text-[11px] font-mono text-[#3BFF9A]">{r.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-white/20 text-xs italic">No matching records found.</td>
                    </tr>
                  )}
                </tbody>
             </table>
           </div>
         )}
      </div>
    </PageShell>
  );
}
