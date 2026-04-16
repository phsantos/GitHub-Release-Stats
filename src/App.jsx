import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Download,
  Tag,
  Github,
  ExternalLink,
  AlertCircle,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Zap,
  Info,
  RefreshCw,
  Clock,
  ChevronLeft,
  XCircle,
} from "lucide-react";
import { StatCard, ReleaseTable, Navbar, Badge } from "./components";
import { cachedFetch, loadFromCache } from "./githubCache";

const GITHUB_BASE_URL = "https://api.github.com/repos";
const AUTO_REFRESH_INTERVAL = 600 * 60 * 1000; // 60 minutos
const ITEMS_PER_PAGE = 25;

export default function App() {
  const [repoInput, setRepoInput] = useState(
    "3Tecnos-Development/erp-contabilis-release",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [repoInfo, setRepoInfo] = useState(null);
  const [latestRelease, setLatestRelease] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [fromCache, setFromCache] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);

  // Estados de Paginação e Busca
  const [tableSearch, setTableSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Carregar cache local no arranque (exibição imediata)
  useEffect(() => {
    const cleanPath = repoInput
      .replace("https://github.com/", "")
      .replace(/\/$/, "");
    if (!cleanPath.includes("/")) return;

    const cached = loadFromCache(cleanPath, GITHUB_BASE_URL);
    if (cached) {
      setData(cached.releases);
      setRepoInfo(cached.repo);
      setLatestRelease(cached.latest);
      setLastUpdated(cached.timestamp);
      setFromCache(true);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const formatNumber = (num) => new Intl.NumberFormat("pt-PT").format(num);
  const formatDate = (date) =>
    date
      ? new Intl.DateTimeFormat("pt-PT", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date(date))
      : "-";
  const formatTime = (date) =>
    date
      ? new Intl.DateTimeFormat("pt-PT", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }).format(date)
      : "--:--:--";

  const fetchStats = useCallback(
    async (isAuto = false) => {
      const cleanPath = repoInput
        .replace("https://github.com/", "")
        .replace(/\/$/, "");
      if (!cleanPath.includes("/")) {
        setError('Formato inválido. Utilize "utilizador/repositorio"');
        return;
      }

      if (!isAuto) setLoading(true);
      setError(null);
      setRateLimited(false);

      try {
        const [releasesResult, repoResult, latestResult] = await Promise.all([
          cachedFetch(`${GITHUB_BASE_URL}/${cleanPath}/releases?per_page=100`),
          cachedFetch(`${GITHUB_BASE_URL}/${cleanPath}`),
          cachedFetch(`${GITHUB_BASE_URL}/${cleanPath}/releases/latest`).catch(
            () => ({ data: null, fromCache: false, rateLimited: false }),
          ),
        ]);

        const wasRateLimited =
          releasesResult.rateLimited ||
          repoResult.rateLimited ||
          latestResult.rateLimited;
        const wasFromCache = releasesResult.fromCache && repoResult.fromCache;

        setData(releasesResult.data);
        setRepoInfo(repoResult.data);
        setLatestRelease(latestResult.data);
        setLastUpdated(new Date());
        setFromCache(wasFromCache);
        setRateLimited(wasRateLimited);
      } catch (err) {
        if (!isAuto) setError(err.message);
        console.error("Erro na atualização:", err);
      } finally {
        setLoading(false);
      }
    },
    [repoInput],
  );

  useEffect(() => {
    fetchStats();
    const intervalId = setInterval(
      () => fetchStats(true),
      AUTO_REFRESH_INTERVAL,
    );
    return () => clearInterval(intervalId);
  }, [fetchStats]);

  // Resetar página quando a busca mudar
  useEffect(() => {
    setCurrentPage(1);
  }, [tableSearch]);

  // Processamento dos dados (Busca + Ordenação)
  const filteredAndSortedReleases = useMemo(() => {
    if (!data) return [];

    let filtered = data;
    if (tableSearch.trim()) {
      filtered = data.filter((release) =>
        release.tag_name.toLowerCase().includes(tableSearch.toLowerCase()),
      );
    }

    return [...filtered].sort((a, b) =>
      b.tag_name.localeCompare(a.tag_name, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }, [data, tableSearch]);

  // Lógica de Paginação
  const totalPages = Math.ceil(
    filteredAndSortedReleases.length / ITEMS_PER_PAGE,
  );
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAndSortedReleases.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredAndSortedReleases, currentPage]);

  const stats = useMemo(() => {
    if (!data) return null;
    const total = data.reduce(
      (acc, r) => acc + r.assets.reduce((sum, a) => sum + a.download_count, 0),
      0,
    );
    return {
      total,
      count: data.length,
      latestVersion:
        latestRelease?.tag_name || (data[0] ? data[0].tag_name : "N/A"),
      latestDate:
        latestRelease?.published_at || (data[0] ? data[0].published_at : null),
    };
  }, [data, latestRelease]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 font-sans antialiased">
      <Navbar
        repoInput={repoInput}
        setRepoInput={setRepoInput}
        onSearch={() => fetchStats()}
        loading={loading}
      />

      <main className="max-w-6xl mx-auto px-4 mt-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {rateLimited && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-100 text-amber-700 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} />
            <p className="text-sm font-medium">
              Limite da API do GitHub atingido. A mostrar dados em cache.
            </p>
          </div>
        )}

        {!data && loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="animate-spin text-indigo-600" size={40} />
            <p className="text-slate-400 text-sm font-medium">
              Obtendo dados...
            </p>
          </div>
        ) : data && repoInfo ? (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header com info e botão de atualização */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <img
                  src={repoInfo.owner.avatar_url}
                  className="w-16 h-16 rounded-2xl shadow-lg border-2 border-white"
                  alt="Owner"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
                      {repoInfo.name}
                    </h2>
                    <a
                      href={repoInfo.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-slate-400 hover:text-indigo-600 transition-colors"
                    >
                      <ExternalLink size={18} />
                    </a>
                  </div>
                  <p className="text-slate-500 text-sm line-clamp-1 max-w-xl">
                    {repoInfo.description}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <Clock size={14} className="text-slate-400" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                    Última Atualização: {formatTime(lastUpdated)}
                    {fromCache && " (cache)"}
                  </span>
                </div>
                <button
                  onClick={() => fetchStats()}
                  disabled={loading}
                  className="flex items-center gap-2 bg-white hover:bg-slate-50 text-indigo-600 px-4 py-2 rounded-xl border border-indigo-100 shadow-sm font-bold text-xs transition-all active:scale-95 disabled:opacity-50"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                  Atualizar Agora
                </button>
              </div>
            </div>

            {/* Grid de Estatísticas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Downloads"
                value={formatNumber(stats.total)}
                sub="Acumulado"
                icon={Download}
                color="indigo"
              />
              <StatCard
                title="Última Versão"
                value={stats.latestVersion}
                sub={
                  stats.latestDate
                    ? `Lançada a ${formatDate(stats.latestDate)}`
                    : "Sem data"
                }
                icon={CheckCircle2}
                color="emerald"
                highlight
              />
              {/* <StatCard
                title="Versões"
                value={stats.count}
                sub="Histórico detetado"
                icon={Tag}
                color="slate"
              /> */}
              {/* <StatCard
                title="Estrelas"
                value={formatNumber(repoInfo.stargazers_count)}
                sub="Engagement GitHub"
                icon={Zap}
                color="amber"
              /> */}
            </div>

            {/* Barra de Pesquisa da Tabela */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm group">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Filtrar por versão ou tag..."
                  value={tableSearch}
                  onChange={(e) => setTableSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all text-slate-700 shadow-sm"
                />
                {tableSearch && (
                  <button
                    onClick={() => setTableSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
                  >
                    <XCircle size={14} />
                  </button>
                )}
              </div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Últimas {filteredAndSortedReleases.length} versões encontradas
              </p>
            </div>

            {/* Tabela de Versões */}
            <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="font-bold text-slate-800 text-lg">
                  Histórico de Versões
                </h3>
                <div className="flex items-center gap-1">
                  <Badge variant="primary">
                    Página {currentPage} de {totalPages || 1}
                  </Badge>
                </div>
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
                    {paginatedItems.length > 0 ? (
                      paginatedItems.map((release) => {
                        const isLatest =
                          release.tag_name === latestRelease?.tag_name;
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
                                    <Badge variant="success">
                                      ÚLTIMA VERSÃO
                                    </Badge>
                                  )}
                                  {release.prerelease && (
                                    <Badge variant="warning">
                                      Pré-lançamento
                                    </Badge>
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
                      })
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <XCircle size={32} className="text-slate-200" />
                            <p className="text-slate-400 font-medium italic">
                              Nenhuma versão corresponde à sua pesquisa.
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Controles de Paginação */}
              {totalPages > 1 && (
                <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-30 disabled:hover:text-slate-600"
                  >
                    <ChevronLeft size={14} /> Anterior
                  </button>

                  <div className="hidden sm:flex gap-1">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (
                        totalPages > 5 &&
                        Math.abs(page - currentPage) > 2 &&
                        page !== 1 &&
                        page !== totalPages
                      ) {
                        if (page === 2 || page === totalPages - 1)
                          return (
                            <span key={page} className="px-2 text-slate-300">
                              ...
                            </span>
                          );
                        return null;
                      }
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${currentPage === page ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-white text-slate-500 border border-slate-200 hover:border-indigo-500 hover:text-indigo-600"}`}
                        >
                          {page}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-white hover:text-indigo-600 transition-all disabled:opacity-30 disabled:hover:text-slate-600"
                  >
                    Seguinte <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3 text-slate-600 shadow-sm">
              <Info size={18} className="shrink-0 mt-0.5 text-indigo-600" />
              <div className="text-xs space-y-1.5">
                <p className="font-bold text-indigo-900 flex items-center gap-2">
                  Dicas de Navegação
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </p>
                <p className="leading-relaxed text-slate-500">
                  Os resultados estão paginados de 25 em 25 para melhor
                  performance. Utilize o campo de pesquisa acima da tabela para
                  encontrar rapidamente uma versão específica sem precisar
                  navegar entre as páginas.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-32 animate-in fade-in zoom-in">
            <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Github size={48} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2 text-center">
              Nenhum repositório carregado
            </h2>
          </div>
        )}
      </main>
    </div>
  );
}
