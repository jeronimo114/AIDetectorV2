"use client";

import { useState } from "react";

type ConfirmDialogProps = {
  label: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
};

export default function ConfirmDialog({ label, confirmLabel, onConfirm, disabled }: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm();
    setLoading(false);
    setOpen(false);
  };

  return (
    <div>
      <button
        type="button"
        className="rounded-full border border-[#d1a9a1] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#712d21] disabled:opacity-50"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        {label}
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-6">
          <div className="w-full max-w-sm rounded-3xl border border-[#d6d2c6] bg-white p-6 shadow-[0_18px_60px_rgba(27,24,19,0.2)]">
            <p className="text-sm text-[#1f1d18]">Are you sure?</p>
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                className="rounded-full border border-[#b9b4a6] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#4f4a40]"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-full bg-[#1f2a1f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#f6f5ef]"
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? "Working..." : confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
