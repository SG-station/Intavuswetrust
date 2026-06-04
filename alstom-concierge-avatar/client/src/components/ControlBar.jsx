import React from "react";

export default function ControlBar({ status, onStart, onEnd, error }) {
  const isIdle = status === "idle";
  const isLoading = status === "loading";

  return (
    <div className="flex flex-col items-center gap-3 mt-10">
      {error && (
        <div className="rounded-xl bg-alstom-red/15 border border-alstom-red/30 px-4 py-3 text-sm text-alstom-red">
          <strong className="font-semibold">Error:</strong> {error}
        </div>
      )}

      {/* Start / loading / end button */}
      <button
        onClick={isLoading ? undefined : isIdle ? onStart : onEnd}
        disabled={isLoading}
        className="
          flex items-center justify-center gap-3 rounded-full
          disabled:opacity-50 disabled:cursor-not-allowed
          text-white px-10 py-4 text-base font-semibold tracking-wide
          transition-all duration-200 active:scale-[0.97]
          bg-[#22c55e] hover:bg-[#34d058]
          shadow-[0_0_40px_rgba(34,197,94,0.5)] hover:shadow-[0_0_60px_rgba(34,197,94,0.7)]
        "
      >
        {isLoading ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
            Connecting…
          </>
        ) : isIdle ? (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Start the conversation
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 6h12v12H6z" />
            </svg>
            End conversation
          </>
        )}
      </button>
    </div>
  );
}
