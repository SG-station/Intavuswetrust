import React from "react";

export default function CallControls({ status, isMuted, onMuteToggle, onEnd }) {
  if (status !== "active") return null;

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
      <div className="flex items-center gap-4 rounded-full bg-black/30 backdrop-blur-md px-6 py-3">
        {/* Mute toggle */}
        <button
          onClick={onMuteToggle}
          aria-label={isMuted ? "Unmute microphone" : "Mute microphone"}
          className={`
            relative flex items-center justify-center w-14 h-14 rounded-full
            transition-all duration-200 active:scale-95 hover:scale-105
            ${isMuted ? "bg-alstom-red" : "bg-white/10 backdrop-blur"}
          `}
        >
          <MicIcon muted={isMuted} />
        </button>

        {/* End call */}
        <button
          onClick={onEnd}
          aria-label="End call"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-alstom-red transition-all duration-200 active:scale-95 hover:scale-105"
        >
          <PhoneDownIcon />
        </button>
      </div>
    </div>
  );
}

function MicIcon({ muted }) {
  return (
    <svg
      className="w-6 h-6 text-white"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="11" rx="3" />
      <path d="M5 10a7 7 0 0014 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
      {muted && (
        <line x1="3" y1="3" x2="21" y2="21" strokeWidth="2.5" stroke="white" />
      )}
    </svg>
  );
}

function PhoneDownIcon() {
  return (
    <svg
      className="w-6 h-6 text-white"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      {/* Rotated handset — universal "hang up" shape */}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
      />
    </svg>
  );
}
