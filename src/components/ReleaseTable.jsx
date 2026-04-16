import { ChevronRight } from "lucide-react";
import { Badge } from "./";

const ReleaseTable = ({
  releases,
  latestRelease,
  formatDate,
  formatNumber,
}) => (
  <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
    <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
      <h3 className="font-bold text-slate-800 text-lg">Histórico de Versões</h3>
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {releases.length} itens
      </span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">Versão / Tag</th>
            <th className="px-6 py-4">Lançamento</th>
            <th className="px-6 py-4">Downloads</th>
            <th className="px-6 py-4 text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-sm">
          {releases.map((release) => {
            const isLatest = release.tag_name === latestRelease?.tag_name;
            const downloadCount = release.assets.reduce(
              (sum, a) => sum + a.download_count,
              0,
            );
            return (
              <tr
                key={release.id}
                className={`hover:bg-slate-50 transition-colors ${isLatest ? "bg-indigo-50/30" : ""}`}
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="font-bold text-slate-800">
                      {release.tag_name}
                    </span>
                    <div className="flex gap-1">
                      {isLatest && (
                        <Badge variant="success">Latest Stable</Badge>
                      )}
                      {release.prerelease && (
                        <Badge variant="warning">Pre-release</Badge>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-500 font-medium">
                  {formatDate(release.published_at)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-bold text-slate-700">
                      {formatNumber(downloadCount)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {release.assets.length} ficheiros
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <a
                    href={release.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
                  >
                    Ver <ChevronRight size={16} />
                  </a>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);

export default ReleaseTable;
