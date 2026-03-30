"use client";

import { useState, useEffect } from "react";
import { Loader2, ExternalLink, AlertCircle, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import ReactPlayer from "react-player";

/**
 * R2 Catalog URLs
 * Update these after running: node scripts/upload-to-r2.mjs
 */
const R2_CATALOG_URLS = {
  filmCatalog: {
    html: process.env.NEXT_PUBLIC_R2_FILM_CATALOG_HTML || "",
    json: process.env.NEXT_PUBLIC_R2_FILM_CATALOG_JSON || "",
  },
  musicCatalog: {
    json: process.env.NEXT_PUBLIC_R2_MUSIC_CATALOG_JSON || "",
  },
};

const canEmbedTrailer = (url: string) =>
  /(?:youtube\.com|youtu\.be|vimeo\.com)/i.test(url);

interface CatalogFromR2Props {
  type: "film" | "music";
  mode?: "iframe" | "data";
  className?: string;
  onDataLoad?: (data: any) => void;
}

/**
 * Component to load and display catalog from Cloudflare R2
 *
 * @example
 * // Display HTML catalog in iframe
 * <CatalogFromR2 type="film" mode="iframe" />
 *
 * @example
 * // Fetch JSON data and handle it
 * <CatalogFromR2
 *   type="film"
 *   mode="data"
 *   onDataLoad={(data) => console.log(data)}
 * />
 */
export default function CatalogFromR2({
  type,
  mode = "iframe",
  className = "",
  onDataLoad,
}: CatalogFromR2Props) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [catalogData, setCatalogData] = useState<any>(null);
  const [trailerModal, setTrailerModal] = useState<{ url: string; title: string } | null>(null);

  const catalogUrl =
    mode === "iframe"
      ? type === "film"
        ? R2_CATALOG_URLS.filmCatalog.html
        : ""
      : type === "film"
      ? R2_CATALOG_URLS.filmCatalog.json
      : R2_CATALOG_URLS.musicCatalog.json;

  useEffect(() => {
    if (!catalogUrl) {
      setError(
        "R2 URL not configured. Run: node scripts/upload-to-r2.mjs"
      );
      setLoading(false);
      return;
    }

    if (mode === "data") {
      // Fetch JSON data
      fetch(catalogUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to fetch catalog: ${res.statusText}`);
          }
          return res.json();
        })
        .then((data) => {
          setCatalogData(data);
          onDataLoad?.(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } else {
      // iframe mode - just wait for load
      setLoading(false);
    }
  }, [catalogUrl, mode, onDataLoad]);

  // postMessage listener for trailer clicks from iframe
  useEffect(() => {
    if (mode !== "iframe") return;
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "PLAY_TRAILER" && e.data.url) {
        setTrailerModal({ url: e.data.url, title: e.data.title || "Trailer" });
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [mode]);

  // Loading state
  if (loading && mode === "data") {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-gray-900/50 rounded-lg border border-gray-800">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p className="text-sm text-gray-400">Loading catalog from R2...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-red-900/10 rounded-lg border border-red-800/50">
        <div className="flex flex-col items-center gap-3 max-w-md px-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
          <h3 className="text-lg font-semibold text-red-400">
            Failed to load catalog
          </h3>
          <p className="text-sm text-gray-400 text-center">{error}</p>
          <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-800 w-full">
            <p className="text-xs text-gray-500 font-mono">
              Setup instructions:
            </p>
            <ol className="text-xs text-gray-400 mt-2 space-y-1 list-decimal list-inside">
              <li>Configure R2 credentials in .env.local</li>
              <li>Run: node scripts/upload-to-r2.mjs</li>
              <li>Set environment variables in Cloudflare</li>
              <li>Rebuild and deploy</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  // iframe mode
  if (mode === "iframe") {
    return (
      <div className={`relative w-full ${className}`}>
        <div className="absolute top-4 right-4 z-10">
          <a
            href={catalogUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 bg-gray-900/80 hover:bg-gray-800 backdrop-blur-sm rounded-lg border border-gray-700 transition-colors text-sm text-gray-300 hover:text-white"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Otwórz w nowej karcie</span>
          </a>
        </div>
        <iframe
          src={catalogUrl}
          className="w-full h-full min-h-[800px] border border-gray-800 shadow-2xl"
          title={`${type === "film" ? "Film" : "Music"} Catalog`}
          sandbox="allow-scripts allow-same-origin"
          loading="lazy"
          onLoad={() => setLoading(false)}
        />
        {/* Trailer modal */}
        {trailerModal && (
          <Dialog open onOpenChange={() => setTrailerModal(null)}>
            <DialogContent className="max-w-4xl w-full bg-gray-950 border-gray-800 p-0 overflow-hidden">
              <DialogTitle className="sr-only">
                Trailer: {trailerModal.title}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Modal odtwarzania trailera dla pozycji {trailerModal.title}.
              </DialogDescription>
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <span className="text-sm font-medium text-gray-200 truncate pr-4">{trailerModal.title}</span>
                <button
                  onClick={() => setTrailerModal(null)}
                  className="shrink-0 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video w-full bg-black">
                {canEmbedTrailer(trailerModal.url) ? (
                  <ReactPlayer
                    src={trailerModal.url}
                    playing
                    controls
                    width="100%"
                    height="100%"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full gap-4 p-6">
                    <p className="text-gray-400 text-sm">Nie można osadzić tego wideo</p>
                    <a
                      href={trailerModal.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white transition-colors text-sm"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Otwórz na YouTube
                    </a>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }

  // Data mode - render catalog info
  if (mode === "data" && catalogData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-gray-900/50 rounded-lg border border-gray-800 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {type === "film" ? "Film" : "Music"} Catalog
              </h2>
              <p className="text-sm text-gray-400">
                Loaded from Cloudflare R2
              </p>
            </div>
            <a
              href={catalogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors text-sm text-gray-300 hover:text-white"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View JSON</span>
            </a>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {type === "film" && (
              <>
                <StatCard
                  label="Total Films"
                  value={catalogData.totalFilms || 0}
                />
                <StatCard
                  label="Categories"
                  value={catalogData.totalCategories || 0}
                />
                <StatCard
                  label="Version"
                  value={catalogData.version || "1.0"}
                />
                <StatCard
                  label="Generated"
                  value={
                    catalogData.generated
                      ? new Date(catalogData.generated).toLocaleDateString()
                      : "N/A"
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Categories preview */}
        {type === "film" && catalogData.categories && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {catalogData.categories.map((category: any, idx: number) => (
              <div
                key={idx}
                className="bg-gray-900/50 rounded-lg border border-gray-800 p-4 hover:border-gray-700 transition-colors"
              >
                <h3 className="font-semibold text-white mb-2">
                  {category.category}
                </h3>
                <p className="text-sm text-gray-400">
                  {category.films?.length || 0} films
                </p>
                <div className="flex flex-wrap gap-1 mt-3">
                  {category.mood?.slice(0, 3).map((mood: string, i: number) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs bg-blue-900/30 text-blue-400 rounded border border-blue-800/50"
                    >
                      {mood}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return null;
}

/**
 * Stat card component
 */
function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

/**
 * Hook to use R2 catalog URLs
 */
export function useR2CatalogUrls() {
  return R2_CATALOG_URLS;
}

/**
 * Utility to check if R2 is configured
 */
export function isR2Configured(type: "film" | "music" = "film"): boolean {
  if (type === "film") {
    return !!(
      R2_CATALOG_URLS.filmCatalog.html || R2_CATALOG_URLS.filmCatalog.json
    );
  }
  return !!R2_CATALOG_URLS.musicCatalog.json;
}
