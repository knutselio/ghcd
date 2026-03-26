import { getDatePresets } from "../lib/datePresets";
import PillButton from "./PillButton";

interface DatePresetsProps {
  fromDate: string;
  toDate: string;
  setFromDate: (v: string) => void;
  setToDate: (v: string) => void;
  onSelect?: (from: string, to: string) => void;
}

export default function DatePresets({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  onSelect,
}: DatePresetsProps) {
  const presets = getDatePresets();

  return (
    <div className="flex gap-1.5 flex-wrap">
      {presets.map((p) => (
        <PillButton
          key={p.id}
          active={fromDate === p.from && toDate === p.to}
          onClick={() => {
            setFromDate(p.from);
            setToDate(p.to);
            onSelect?.(p.from, p.to);
          }}
        >
          {p.label}
        </PillButton>
      ))}
    </div>
  );
}
