interface PillButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export default function PillButton({ active, onClick, children }: PillButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`px-3 py-1 rounded-full text-xs font-medium border cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-gh-accent focus-visible:ring-offset-1 focus-visible:ring-offset-gh-bg ${
        active
          ? "bg-gh-accent/20 border-gh-accent text-gh-accent"
          : "bg-transparent border-gh-border text-gh-text-secondary hover:border-gh-text-secondary"
      }`}
    >
      {children}
    </button>
  );
}
