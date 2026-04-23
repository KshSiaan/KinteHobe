"use client";

import { useEffect, useRef, useState } from "react";
import {
  ReactSketchCanvas,
  type CanvasPath,
  type ReactSketchCanvasRef,
} from "react-sketch-canvas";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  DownloadIcon,
  EraserIcon,
  PenLineIcon,
  RotateCcwIcon,
  RotateCwIcon,
  Trash2Icon,
} from "lucide-react";

const STROKE_WIDTH_OPTIONS = [2, 4, 6, 8, 12];
const ERASER_WIDTH_OPTIONS = [8, 12, 16, 24, 32];

function downloadDataUrl(dataUrl: string, fileName: string) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}

function downloadTextFile(content: string, fileName: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

export default function Page() {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const [strokeColor, setStrokeColor] = useState("#111827");
  const [strokeWidth, setStrokeWidth] = useState("4");
  const [eraserWidth, setEraserWidth] = useState("16");
  const [pointerType, setPointerType] = useState("all");
  const [isEraserMode, setIsEraserMode] = useState(false);
  const [strokeCount, setStrokeCount] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [lastExport, setLastExport] = useState("Nothing exported yet");

  useEffect(() => {
    canvasRef.current?.eraseMode(isEraserMode);
  }, [isEraserMode]);

  const handleExportImage = async (type: "png" | "jpeg") => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    try {
      const dataUrl = await canvasRef.current.exportImage(type);
      const fileName = `admin-drawing-${new Date().toISOString()}.${type}`;
      downloadDataUrl(dataUrl, fileName);
      setLastExport(`${type.toUpperCase()} exported`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSvg = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    try {
      const svg = await canvasRef.current.exportSvg();
      const fileName = `admin-drawing-${new Date().toISOString()}.svg`;
      downloadTextFile(svg, fileName, "image/svg+xml;charset=utf-8");
      setLastExport("SVG exported");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPaths = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    try {
      const paths = await canvasRef.current.exportPaths();
      const fileName = `admin-drawing-${new Date().toISOString()}.json`;
      downloadTextFile(
        JSON.stringify(paths, null, 2),
        fileName,
        "application/json;charset=utf-8",
      );
      setLastExport("JSON paths exported");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-1 flex-col gap-6 p-6">
      <Card className="flex-1">
        <CardContent className="h-full min-h-140 p-4">
          <ReactSketchCanvas
            ref={canvasRef}
            width="100%"
            height="100%"
            strokeColor={strokeColor}
            strokeWidth={Number(strokeWidth)}
            eraserWidth={Number(eraserWidth)}
            allowOnlyPointerType={pointerType}
            withTimestamp
            onChange={(paths: CanvasPath[]) => setStrokeCount(paths.length)}
            style={{
              border: "1px solid var(--border)",
              borderRadius: "0.75rem",
              backgroundColor: "var(--card)",
            }}
          />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-col gap-1">
              <CardTitle>Canvas Controls</CardTitle>
              <CardDescription>
                Choose pen settings, switch tools, and export in multiple
                formats.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isEraserMode ? "warning" : "info"}>
                {isEraserMode ? "Eraser Mode" : "Pen Mode"}
              </Badge>
              <Badge variant="secondary">{strokeCount} strokes</Badge>
            </div>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="flex flex-col gap-4 pt-6">
          <FieldGroup className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Field>
              <FieldLabel htmlFor="stroke-color">Stroke Color</FieldLabel>
              <Input
                id="stroke-color"
                type="color"
                value={strokeColor}
                onChange={(event) => setStrokeColor(event.target.value)}
                className="h-10"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="stroke-width">Stroke Width</FieldLabel>
              <Select value={strokeWidth} onValueChange={setStrokeWidth}>
                <SelectTrigger id="stroke-width">
                  <SelectValue placeholder="Select width" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {STROKE_WIDTH_OPTIONS.map((width) => (
                      <SelectItem key={width} value={String(width)}>
                        {width}px
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="eraser-width">Eraser Width</FieldLabel>
              <Select value={eraserWidth} onValueChange={setEraserWidth}>
                <SelectTrigger id="eraser-width">
                  <SelectValue placeholder="Select eraser size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {ERASER_WIDTH_OPTIONS.map((width) => (
                      <SelectItem key={width} value={String(width)}>
                        {width}px
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="pointer-type">Pointer Type</FieldLabel>
              <Select value={pointerType} onValueChange={setPointerType}>
                <SelectTrigger id="pointer-type">
                  <SelectValue placeholder="Pointer type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="all">All Inputs</SelectItem>
                    <SelectItem value="mouse">Mouse</SelectItem>
                    <SelectItem value="touch">Touch</SelectItem>
                    <SelectItem value="pen">Pen</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={isEraserMode ? "outline" : "default"}
              onClick={() => setIsEraserMode(false)}
            >
              <PenLineIcon data-icon="inline-start" />
              Pen
            </Button>
            <Button
              variant={isEraserMode ? "default" : "outline"}
              onClick={() => setIsEraserMode(true)}
            >
              <EraserIcon data-icon="inline-start" />
              Eraser
            </Button>
            <Button variant="outline" onClick={() => canvasRef.current?.undo()}>
              <RotateCcwIcon data-icon="inline-start" />
              Undo
            </Button>
            <Button variant="outline" onClick={() => canvasRef.current?.redo()}>
              <RotateCwIcon data-icon="inline-start" />
              Redo
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                canvasRef.current?.resetCanvas();
                setStrokeCount(0);
              }}
            >
              <Trash2Icon data-icon="inline-start" />
              Reset Canvas
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              disabled={isExporting}
              onClick={() => void handleExportImage("png")}
            >
              <DownloadIcon data-icon="inline-start" />
              Export PNG
            </Button>
            <Button
              variant="outline"
              disabled={isExporting}
              onClick={() => void handleExportImage("jpeg")}
            >
              <DownloadIcon data-icon="inline-start" />
              Export JPEG
            </Button>
            <Button
              variant="outline"
              disabled={isExporting}
              onClick={() => void handleExportSvg()}
            >
              <DownloadIcon data-icon="inline-start" />
              Export SVG
            </Button>
            <Button
              variant="outline"
              disabled={isExporting}
              onClick={() => void handleExportPaths()}
            >
              <DownloadIcon data-icon="inline-start" />
              Export JSON
            </Button>
            <Badge variant="ghost" className="h-9 px-3">
              {lastExport}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
