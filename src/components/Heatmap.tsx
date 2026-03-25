import { useCallback, useMemo, useRef, useState } from "react";
import type { ContributionLevel, ContributionWeek } from "../lib/types";

const CELL_SIZE = 13;
const GAP = 3;
const LABEL_WIDTH = 28;

function formatTooltipDate(dateStr: string): { dayName: string; formatted: string } {
  const date = new Date(`${dateStr}T00:00:00`);
  const dayName = date.toLocaleDateString(undefined, { weekday: "short" });
  const formatted = date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  return { dayName, formatted };
}

const LEVEL_COLORS: Record<ContributionLevel, string> = {
  NONE: "var(--contrib-none)",
  FIRST_QUARTILE: "var(--contrib-q1)",
  SECOND_QUARTILE: "var(--contrib-q2)",
  THIRD_QUARTILE: "var(--contrib-q3)",
  FOURTH_QUARTILE: "var(--contrib-q4)",
};

const DAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

interface TooltipData {
  count: number;
  dayName: string;
  formatted: string;
  x: number;
  y: number;
}

interface HeatmapProps {
  weeks: ContributionWeek[];
}

export default function Heatmap({ weeks }: HeatmapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const width = LABEL_WIDTH + weeks.length * (CELL_SIZE + GAP);
  const height = 7 * (CELL_SIZE + GAP) + 20;

  const monthLabels = useMemo(() => {
    const labels: { month: string; x: number; key: string }[] = [];
    let prev = "";
    for (let wi = 0; wi < weeks.length; wi++) {
      const date = weeks[wi].contributionDays[0].date;
      const month = new Date(date).toLocaleString(undefined, { month: "short" });
      if (month !== prev) {
        prev = month;
        labels.push({ month, x: LABEL_WIDTH + wi * (CELL_SIZE + GAP), key: `month-${date}` });
      }
    }
    return labels;
  }, [weeks]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const target = e.target as SVGRectElement;
    const container = containerRef.current;
    if (!container) return;

    const dateVal = target.getAttribute("data-date");
    const countVal = target.getAttribute("data-count");
    if (!dateVal || countVal == null) {
      setTooltip(null);
      return;
    }

    const cellRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const { dayName, formatted } = formatTooltipDate(dateVal);

    setTooltip({
      count: Number(countVal),
      dayName,
      formatted,
      x: cellRect.left - containerRect.left + cellRect.width / 2,
      y: cellRect.top - containerRect.top - 6,
    });
  }, []);

  const handleMouseLeave = useCallback(() => setTooltip(null), []);

  return (
    <div ref={containerRef} className="relative mb-3.5 bg-gh-badge rounded-lg p-3">
      <div className="overflow-x-auto">
        <svg
          width={width}
          className="max-w-full"
          viewBox={`0 0 ${width} ${height}`}
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Contribution heatmap"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Month labels */}
          {monthLabels.map((m) => (
            <text key={m.key} x={m.x} y={10} fontSize={9} fill="var(--text-secondary)">
              {m.month}
            </text>
          ))}

          {/* Day labels */}
          {DAY_LABELS.map(
            (label, i) =>
              label && (
                <text
                  key={label}
                  x={0}
                  y={26 + i * (CELL_SIZE + GAP) + CELL_SIZE - 2}
                  fontSize={9}
                  fill="var(--text-secondary)"
                >
                  {label}
                </text>
              ),
          )}

          {/* Contribution cells */}
          {weeks.map((week, wi) =>
            week.contributionDays.map((day) => (
              <rect
                key={day.date}
                data-date={day.date}
                data-count={day.contributionCount}
                x={LABEL_WIDTH + wi * (CELL_SIZE + GAP)}
                y={24 + day.weekday * (CELL_SIZE + GAP)}
                width={CELL_SIZE}
                height={CELL_SIZE}
                rx={2}
                fill={LEVEL_COLORS[day.contributionLevel] ?? LEVEL_COLORS.NONE}
              />
            )),
          )}
        </svg>
      </div>

      {tooltip && (
        <div
          className="absolute z-50 pointer-events-none px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-nowrap bg-gh-badge text-gh-text-primary border border-gh-border shadow-lg -translate-x-1/2 -translate-y-full"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <span className="font-semibold">
            {tooltip.count} {tooltip.count === 1 ? "contribution" : "contributions"}
          </span>
          <br />
          <span className="opacity-70">
            {tooltip.dayName}, {tooltip.formatted}
          </span>
        </div>
      )}
    </div>
  );
}
