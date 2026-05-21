import React from "react";

function MonitorIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

export default function ControlBar({ status, onStart, onEnd, error, isShowroomMode, onToggleShowroom }) {
  const isIdle = status === "idle";
  const isLoading = status === "loading";

  return (
    <div className="flex flex-col items-center gap-3 mt-10">
      {error && (
        <div className="rounded-xl bg-alstom-red/15 border border-alstom-red/30 px-4 py-3 text-sm text-alstom-red">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        {/* Showroom mode toggle — visible in idle state only */}
        {isIdle && (
          <button
            onClick={onToggleShowroom}
            className={[
              "flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-semibold tracking-wide border transition-all duration-200",
              isShowroomMode
                ? "border-alstom-ultramarine bg-alstom-ultramarine/15 text-alstom-ultramarine"
                : "border-white/15 bg-white/[0.04] text-white/40 hover:border-white/25 hover:text-white/60",
            ].join(" ")}
          >
            <MonitorIcon className="h-3.5 w-3.5" />
            Showroom mode
          </button>
        )}

        {/* Start / loading button */}
        <button
          onClick={isLoading ? undefined : isIdle ? onStart : onEnd}
          disabled={isLoading}
          className="
            flex items-center justify-center gap-3 rounded-full
            bg-alstom-ultramarine hover:bg-alstom-ultramarine/90
            disabled:opacity-50 disabled:cursor-not-allowed
            text-white px-10 py-4 text-base font-semibold tracking-wide
            transition-all duration-200 active:scale-[0.97]
            shadow-[0_0_40px_rgba(40,80,240,0.35)] hover:shadow-[0_0_55px_rgba(40,80,240,0.5)]
          "
        >
          {isLoading ? (
            <>
              <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              Connecting…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start conversation
            </>
          )}
        </button>
      </div>
    </div>
  );
}
