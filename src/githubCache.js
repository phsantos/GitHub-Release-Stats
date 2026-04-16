const CACHE_PREFIX = "gh_cache_";

function getCacheKey(url) {
  return CACHE_PREFIX + btoa(url);
}

function getCache(url) {
  try {
    const raw = localStorage.getItem(getCacheKey(url));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setCache(url, data, etag) {
  try {
    localStorage.setItem(
      getCacheKey(url),
      JSON.stringify({ data, etag, timestamp: Date.now() }),
    );
  } catch {
    // localStorage cheio — ignora silenciosamente
  }
}

/**
 * Fetch com suporte a ETag (304), cache local e fallback inteligente.
 *
 * - Envia If-None-Match quando existe ETag em cache
 * - 304 Not Modified → usa cache (NÃO consome rate limit)
 * - 403/429 (rate limit) → usa último dado válido em cache
 * - Qualquer erro de rede → fallback para cache
 */
export async function cachedFetch(url, { force = false } = {}) {
  const cache = getCache(url);
  const headers = {};

  // Só envia ETag se NÃO for forçado
  if (!force && cache?.etag) {
    headers["If-None-Match"] = cache.etag;
  }

  const cachedResult = (rateLimited = false) => ({
    data: cache.data,
    fromCache: true,
    rateLimited,
    timestamp: cache.timestamp ? new Date(cache.timestamp) : null,
  });

  let res;
  try {
    res = await fetch(url, { headers });
  } catch {
    if (cache?.data) return cachedResult();
    throw new Error("Erro de rede. Verifique a sua ligação.");
  }

  if (res.status === 304 && cache?.data) return cachedResult();

  if ((res.status === 403 || res.status === 429) && cache?.data) {
    return cachedResult(true);
  }

  if (!res.ok) {
    if (cache?.data) return cachedResult();
    throw new Error(
      res.status === 403 || res.status === 429
        ? "Limite da API do GitHub atingido. Tente novamente mais tarde."
        : "Repositório não encontrado ou erro na API.",
    );
  }

  const data = await res.json();
  const etag = res.headers.get("etag");
  setCache(url, data, etag);

  return { data, fromCache: false, rateLimited: false, timestamp: null };
}

/**
 * Carrega dados do cache local para exibição imediata no arranque.
 */
export function loadFromCache(repoPath, baseUrl) {
  const releases = getCache(`${baseUrl}/${repoPath}/releases?per_page=100`);
  const repo = getCache(`${baseUrl}/${repoPath}`);
  const latest = getCache(`${baseUrl}/${repoPath}/releases/latest`);

  if (!releases?.data || !repo?.data) return null;

  return {
    releases: releases.data,
    repo: repo.data,
    latest: latest?.data ?? null,
    timestamp: releases.timestamp ? new Date(releases.timestamp) : null,
  };
}
