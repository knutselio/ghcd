import { useState } from "react";
import { clearToken, setToken } from "../lib/github";
import UserChip from "./UserChip";

const inputClass =
  "px-3 py-2 rounded-lg border border-gh-border bg-gh-card text-gh-text-primary text-sm outline-none focus:border-gh-accent";

const sectionLabel = "text-xs text-gh-text-secondary font-medium uppercase tracking-wider";

interface SettingsDrawerProps {
  open: boolean;
  onClose: () => void;
  hasToken: boolean;
  onTokenChange: (has: boolean) => void;
  org: string;
  setOrg: (v: string) => void;
  fromDate: string;
  setFromDate: (v: string) => void;
  toDate: string;
  setToDate: (v: string) => void;
  users: string[];
  setUsers: (v: string[]) => void;
}

export default function SettingsDrawer({
  open,
  onClose,
  hasToken: hasTokenProp,
  onTokenChange,
  org,
  setOrg,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  users,
  setUsers,
}: SettingsDrawerProps) {
  const [userInput, setUserInput] = useState("");
  const [patInput, setPatInput] = useState("");
  const [patVisible, setPatVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  function addUser() {
    const u = userInput.trim().toLowerCase();
    if (u && !users.includes(u)) {
      setUsers([...users, u]);
    }
    setUserInput("");
  }

  function removeUser(username: string) {
    setUsers(users.filter((x) => x !== username));
  }

  async function savePat() {
    const token = patInput.trim();
    if (!token) return;
    setSaving(true);
    try {
      await setToken(token);
      onTokenChange(true);
      setPatInput("");
    } finally {
      setSaving(false);
    }
  }

  async function removePat() {
    await clearToken();
    onTokenChange(false);
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 bg-black/50 z-20 transition-opacity w-full h-full cursor-default border-none"
          tabIndex={-1}
          onClick={onClose}
          aria-label="Close settings"
        />
      )}

      {/* Drawer — full screen on mobile, 340px sidebar on sm+ */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[340px] bg-gh-bg border-l border-gh-border z-30 transform transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gh-border">
          <h2 className="text-base font-semibold">Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className="bg-transparent border-none text-gh-text-secondary hover:text-gh-text-primary cursor-pointer text-xl leading-none p-1"
          >
            &times;
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5 overflow-y-auto h-[calc(100%-57px)]">
          {/* PAT section */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabel}>Personal Access Token</span>
            {hasTokenProp ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gh-text-primary">Token saved</span>
                <button
                  type="button"
                  onClick={removePat}
                  className="px-2 py-1 rounded border border-gh-border bg-transparent text-gh-text-secondary hover:text-red-400 hover:border-red-400 cursor-pointer text-xs transition-colors"
                >
                  Remove
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative flex-1 min-w-0">
                  <input
                    type={patVisible ? "text" : "password"}
                    value={patInput}
                    onChange={(e) => setPatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") savePat();
                    }}
                    placeholder="ghp_..."
                    className={`${inputClass} w-full pr-[50px]`}
                  />
                  <button
                    type="button"
                    onClick={() => setPatVisible(!patVisible)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none text-gh-text-secondary cursor-pointer text-xs"
                  >
                    {patVisible ? "Hide" : "Show"}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={savePat}
                  disabled={saving || !patInput.trim()}
                  className="px-3 py-2 rounded-lg border-none cursor-pointer font-semibold text-sm transition-opacity hover:opacity-85 bg-gh-accent text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? "..." : "Save"}
                </button>
              </div>
            )}
            <p className="text-[11px] text-gh-text-secondary">
              Requires{" "}
              <code className="bg-gh-badge px-1 py-0.5 rounded text-[11px]">read:user</code> and{" "}
              <code className="bg-gh-badge px-1 py-0.5 rounded text-[11px]">read:org</code> scopes.
              Stored as a secure HttpOnly cookie.
            </p>
          </div>

          {/* Org section */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabel}>Organization</span>
            <input
              value={org}
              onChange={(e) => setOrg(e.target.value)}
              placeholder="Optional — filter by org"
              className={`${inputClass} w-full`}
            />
          </div>

          {/* Date range section */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabel}>Date Range</span>
            <div className="flex gap-2 items-center">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className={`${inputClass} flex-1`}
              />
              <span className="text-gh-text-secondary text-xs">to</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className={`${inputClass} flex-1`}
              />
            </div>
          </div>

          {/* Users section */}
          <div className="flex flex-col gap-2">
            <span className={sectionLabel}>Users</span>
            <div className="flex gap-2">
              <input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") addUser();
                }}
                placeholder="Add username..."
                className={`${inputClass} flex-1`}
              />
              <button
                type="button"
                onClick={addUser}
                className="px-3 py-2 rounded-lg border-none cursor-pointer font-semibold text-sm transition-opacity hover:opacity-85 bg-gh-badge text-gh-text-primary"
              >
                Add
              </button>
            </div>
            {users.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {users.map((u) => (
                  <UserChip key={u} username={u} onRemove={() => removeUser(u)} />
                ))}
              </div>
            )}
            {users.length === 0 && (
              <p className="text-[12px] text-gh-text-secondary">
                No users added yet. Add GitHub usernames above.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
