import { toPng } from "html-to-image";
import { useCallback } from "react";
import { useToast } from "./ToastContext";

export function useExport(elementSelector: string) {
  const { addToast } = useToast();

  const handleExport = useCallback(async () => {
    const element = document.querySelector(elementSelector);
    if (!element) return;

    try {
      const isLight = document.documentElement.classList.contains("light");
      const styles = getComputedStyle(document.documentElement);
      const bg = styles.getPropertyValue("--gh-bg").trim();
      const borderColor = styles.getPropertyValue("--gh-border").trim();

      // 1. Capture the visible dashboard
      const contentDataUrl = await toPng(element, {
        pixelRatio: 2,
        backgroundColor: bg,
      });

      // 2. Load it as an image
      const img = await new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = contentDataUrl;
      });

      // 3. Draw the fancy window frame on a canvas
      const scale = 2;
      const padding = 48 * scale;
      const titleBarH = 44 * scale;
      const contentPadX = 24 * scale;
      const contentPadY = 20 * scale;
      const radius = 12 * scale;
      const dotR = 6 * scale;
      const dotGap = 20 * scale;
      const dotOffsetX = 18 * scale;

      const frameW = img.width + contentPadX * 2;
      const frameH = img.height + titleBarH + contentPadY * 2;
      const canvasW = frameW + padding * 2;
      const canvasH = frameH + padding * 2;

      const canvas = document.createElement("canvas");
      canvas.width = canvasW;
      canvas.height = canvasH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Gradient background
      const grad = ctx.createLinearGradient(0, 0, canvasW, canvasH);
      if (isLight) {
        grad.addColorStop(0, "#e0e7ef");
        grad.addColorStop(0.5, "#f5f0ff");
        grad.addColorStop(1, "#dbeafe");
      } else {
        grad.addColorStop(0, "#1a1333");
        grad.addColorStop(0.5, "#1e293b");
        grad.addColorStop(1, "#0f172a");
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvasW, canvasH);

      // Shadow
      ctx.save();
      ctx.shadowColor = isLight ? "rgba(0,0,0,0.25)" : "rgba(0,0,0,0.6)";
      ctx.shadowBlur = 60 * scale;
      ctx.shadowOffsetY = 20 * scale;
      ctx.beginPath();
      ctx.roundRect(padding, padding, frameW, frameH, radius);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.restore();

      // Frame border
      ctx.beginPath();
      ctx.roundRect(padding, padding, frameW, frameH, radius);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      // Title bar background
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(padding, padding, frameW, titleBarH, [radius, radius, 0, 0]);
      ctx.fillStyle = bg;
      ctx.fill();
      ctx.restore();

      // Title bar bottom border
      ctx.beginPath();
      ctx.moveTo(padding, padding + titleBarH);
      ctx.lineTo(padding + frameW, padding + titleBarH);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1 * scale;
      ctx.stroke();

      // Traffic light dots
      const dotY = padding + titleBarH / 2;
      for (const [i, color] of (["#ff5f57", "#febc2e", "#28c840"] as const).entries()) {
        ctx.beginPath();
        ctx.arc(padding + dotOffsetX + i * dotGap, dotY, dotR, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
      }

      // Content area background
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.roundRect(padding, padding + titleBarH, frameW, frameH - titleBarH, [
        0,
        0,
        radius,
        radius,
      ]);
      ctx.fill();

      // Paste the captured dashboard image
      ctx.drawImage(img, padding + contentPadX, padding + titleBarH + contentPadY);

      // 4. Download
      const link = document.createElement("a");
      link.download = `ghcd-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
      addToast("success", "Dashboard exported as PNG.");
    } catch {
      addToast("error", "Failed to export dashboard. Try again.");
    }
  }, [elementSelector, addToast]);

  return handleExport;
}
