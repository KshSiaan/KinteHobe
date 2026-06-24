"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LoaderCircleIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

type Props = {
  docId: string | null;
  fileName: string;
  onClose: () => void;
};

export function LegalPdfViewer({ docId, fileName, onClose }: Props) {
  const [url, setUrl] = useState<string | null>(null);
  const [urlLoading, setUrlLoading] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(700);
  const [zoom, setZoom] = useState(1.0);

  const ZOOM_STEP = 0.25;
  const ZOOM_MIN = 0.5;
  const ZOOM_MAX = 3.0;

  const fetchUrl = useCallback(async (id: string) => {
    setUrlLoading(true);
    setUrlError(null);
    setUrl(null);
    setCurrentPage(1);
    setNumPages(0);
    try {
      const res = await fetch(`/api/admin/legal/${id}/view`);
      const data = await res.json();
      if (!res.ok) {
        setUrlError(data.message ?? "Failed to load document");
        return;
      }
      setUrl(data.url);
    } catch {
      setUrlError("Network error");
    } finally {
      setUrlLoading(false);
    }
  }, []);

  useEffect(() => {
    if (docId) {
      fetchUrl(docId);
    } else {
      setUrl(null);
      setUrlError(null);
    }
  }, [docId, fetchUrl]);

  return (
    <Dialog open={!!docId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="min-w-[95vw] h-[90vh] flex flex-col gap-0 p-0">
        <DialogHeader className="px-6 py-4 border-b shrink-0">
          <DialogTitle className="truncate text-base">{fileName}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto flex flex-col items-center bg-muted/40">
          {urlLoading && (
            <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
              <LoaderCircleIcon className="size-5 animate-spin" />
              <span className="text-sm">Loading document...</span>
            </div>
          )}

          {urlError && (
            <div className="flex flex-1 items-center justify-center">
              <p className="text-sm text-destructive">{urlError}</p>
            </div>
          )}

          {url && !urlLoading && (
            <div
              className="w-full"
              ref={(el) => {
                if (el) setContainerWidth(el.clientWidth - 32);
              }}
            >
              <Document
                file={url}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
                onLoadError={() => setUrlError("Failed to render PDF")}
                loading={
                  <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                    <LoaderCircleIcon className="size-5 animate-spin" />
                    <span className="text-sm">Rendering...</span>
                  </div>
                }
                className="flex flex-col items-center py-4 gap-4"
              >
                <Page
                  pageNumber={currentPage}
                  width={Math.min(containerWidth, 900) * zoom}
                  renderTextLayer
                  renderAnnotationLayer
                  className="shadow-md"
                  loading={
                    <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
                      <LoaderCircleIcon className="size-5 animate-spin" />
                      <span className="text-sm">Loading page...</span>
                    </div>
                  }
                />
              </Document>
            </div>
          )}
        </div>

        {numPages > 0 && (
          <div className="shrink-0 border-t px-6 py-3 flex items-center justify-between gap-4 bg-background">
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeftIcon className="size-4" />
                Prev
              </Button>

              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {numPages}
              </span>

              <Button
                size="sm"
                variant="outline"
                disabled={currentPage >= numPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
                <ChevronRightIcon className="size-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                disabled={zoom <= ZOOM_MIN}
                onClick={() =>
                  setZoom((z) =>
                    Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)),
                  )
                }
                title="Zoom out"
              >
                <ZoomOutIcon className="size-4" />
              </Button>

              <button
                type="button"
                className="text-sm text-muted-foreground w-12 text-center hover:text-foreground transition-colors"
                onClick={() => setZoom(1.0)}
                title="Reset zoom"
              >
                {Math.round(zoom * 100)}%
              </button>

              <Button
                size="icon"
                variant="outline"
                disabled={zoom >= ZOOM_MAX}
                onClick={() =>
                  setZoom((z) =>
                    Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)),
                  )
                }
                title="Zoom in"
              >
                <ZoomInIcon className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
