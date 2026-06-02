import React, { useState, useRef, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DailyIframe from "@daily-co/daily-js";

// Phone-side mic page. Joins the Daily room with mic ON, no video, no audio output.
// Audio is intentionally not rendered (no <audio>/<video> elements for remote tracks)
// so Kai's voice only plays through the screen, not the visitor's phone.
export default function MicPage() {
  const [searchParams] = useSearchParams();
  const conversationUrl = searchParams.get("room");
  const [status, setStatus] = useState("idle"); // idle | connecting | live | disconnected
  const callRef = useRef(null);

  const join = useCallback(async () => {
    if (!conversationUrl || status !== "idle") return;
    setStatus("connecting");

    let call = DailyIframe.getCallInstance();
    if (!call) call = DailyIframe.createCallObject();
    callRef.current = call;

    call.on("left-meeting", () => setStatus("disconnected"));
    call.on("error", () => setStatus("disconnected"));

    try {
      const state = call.meetingState();
      if (state !== "joining-meeting" && state !== "joined-meeting") {
        await call.join({ url: conversationUrl, startVideoOff: true, startAudioOff: false });
      }
      setStatus("live");
    } catch (err) {
      console.error("MicPage join failed:", err);
      setStatus("disconnected");
    }
  }, [conversationUrl, status]);

  const leave = useCallback(() => {
    if (callRef.current) {
      try { callRef.current.leave(); } catch {}
      try { callRef.current.destroy(); } catch {}
      callRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  useEffect(() => {
    return () => {
      if (callRef.current) {
        try { callRef.current.leave(); } catch {}
        try { callRef.current.destroy(); } catch {}
        callRef.current = null;
      }
    };
  }, []);

  const isLive = status === "live";
  const isConnecting = status === "connecting";

  const statusText = {
    idle: " ",
    connecting: "Connecting…",
    live: "You’re live — speak to Kai",
    disconnected: "Disconnected",
  }[status];

  if (!conversationUrl) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-8">
        <p className="text-white/30 text-sm text-center">
          No room URL found. Please scan the QR code on the screen.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 gap-6 select-none">

      {/* Logo */}
      <img
        src={import.meta.env.BASE_URL + "alstom.png"}
        alt="Alstom"
        className="absolute top-8 left-1/2 -translate-x-1/2 h-7 w-auto object-contain opacity-50"
        draggable={false}
      />

      {/* Status text */}
      <p
        className={`text-sm tracking-wide transition-all duration-300 ${
          isLive ? "text-white/80" : "text-white/35"
        }`}
      >
        {statusText}
      </p>

      {/* Main mic button */}
      <button
        onClick={status === "idle" ? join : undefined}
        disabled={isConnecting}
        className={[
          "w-36 h-36 rounded-full flex items-center justify-center transition-all duration-300",
          isLive
            ? "bg-red-600 shadow-[0_0_55px_rgba(220,50,50,0.55)] animate-pulse cursor-default"
            : "bg-alstom-ultramarine shadow-[0_0_45px_rgba(40,80,240,0.45)]",
          isConnecting ? "opacity-60 cursor-default" : "",
          status === "idle" ? "hover:scale-105 active:scale-95 cursor-pointer" : "",
        ].join(" ")}
      >
        {isConnecting ? (
          <span className="h-10 w-10 rounded-full border-4 border-white border-t-transparent animate-spin" />
        ) : (
          <MicIcon className="h-14 w-14 text-white" />
        )}
      </button>

      {/* Tap-to-talk label */}
      {status === "idle" && (
        <p className="text-white/35 text-base tracking-wide">Tap to talk</p>
      )}

      {/* End button */}
      {(isLive || isConnecting) && (
        <button
          onClick={leave}
          className="mt-2 px-7 py-2.5 rounded-full bg-alstom-red hover:bg-alstom-red/90 text-white text-sm font-semibold tracking-wide transition-all active:scale-95"
        >
          End
        </button>
      )}

      {/* Try again */}
      {status === "disconnected" && (
        <button
          onClick={() => setStatus("idle")}
          className="mt-2 px-7 py-2.5 rounded-full border border-white/20 hover:border-white/35 text-white/50 hover:text-white/70 text-sm font-semibold tracking-wide transition-all"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function MicIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
      <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
    </svg>
  );
}
