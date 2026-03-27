interface UserChipProps {
  username: string;
  onRemove: () => void;
}

export default function UserChip({ username, onRemove }: UserChipProps) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gh-badge text-[13px]">
      {username}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${username}`}
        className="bg-transparent border-none text-gh-text-secondary cursor-pointer leading-none p-0 hover:text-gh-danger rounded-full focus-visible:ring-2 focus-visible:ring-gh-accent"
      >
        <svg
          role="img"
          aria-label="Remove"
          width="14"
          height="14"
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
        </svg>
      </button>
    </span>
  );
}
