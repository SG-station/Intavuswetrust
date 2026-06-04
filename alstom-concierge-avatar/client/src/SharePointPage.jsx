import React, { useCallback, useEffect, useRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { QRCodeSVG } from "qrcode.react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export default function SharePointPage() {
  const [status, setStatus] = useState("loading"); // loading | active | ended | error
  const [needsUnmute, setNeedsUnmute] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [conversationUrl, setConversationUrl] = useState(null);
  const [phoneConnected, setPhoneConnected] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const callRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const conversationIdRef = useRef(null);
  const inputRef = useRef(null);

  const leave = useCallback(() => {
    if (callRef.current) {
      try { callRef.current.leave(); } catch {}
      callRef.current = null;
    }
  }, []);

  const joinRoom = useCallback((url) => {
    let call = DailyIframe.getCallInstance();
    if (!call) call = DailyIframe.createCallObject();
    callRef.current = call;

    const attachTracks = () => {
      if (callRef.current !== call) return;
      const participants = call.participants();
      const remote =
        Object.values(participants).find(
          (p) => !p.local && (p.tracks?.video?.persistentTrack ?? p.tracks?.video?.track)
        ) ?? Object.values(participants).find((p) => !p.local);

      if (!remote || !remoteVideoRef.current) return;
      const vt = remote.tracks?.video?.persistentTrack ?? remote.tracks?.video?.track;
      const at = remote.tracks?.audio?.persistentTrack ?? remote.tracks?.audio?.track;
      const tracks = [vt, at].filter(Boolean);
      if (!tracks.length) return;

      const cur = remoteVideoRef.current.srcObject;
      const same =
        cur &&
        tracks.length === cur.getTracks().length &&
        tracks.every((t) => cur.getTracks().includes(t));
      if (same) return;

      remoteVideoRef.current.srcObject = new MediaStream(tracks);
      remoteVideoRef.current.muted = false;
      remoteVideoRef.current.play().catch(() => {
        remoteVideoRef.current.muted = true;
        remoteVideoRef.current.play().catch(() => {});
        setNeedsUnmute(true);
      });
    };

    const updatePhoneConnected = () => {
      if (callRef.current !== call) return;
      const count = Object.values(call.participants()).filter((p) => !p.local).length;
      setPhoneConnected(count >= 2);
    };

    call.on("joined-meeting", () => {
      attachTracks();
      call.updateReceiveSettings({ "*": { video: { layer: 2 } } }).catch(() => {});
    });
    call.on("track-started", attachTracks);
    call.on("participant-joined", () => { attachTracks(); updatePhoneConnected(); });
    call.on("participant-updated", attachTracks);
    call.on("participant-left", updatePhoneConnected);

    const state = call.meetingState();
    if (state !== "joining-meeting" && state !== "joined-meeting") {
      // Join audio-off — user interacts via text prompt bar
      call
        .join({ url, startVideoOff: true, startAudioOff: true })
        .catch((err) => console.error("Daily join failed:", err));
    } else {
      attachTracks();
    }
  }, []);

  const start = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setNeedsUnmute(false);
    setShowQR(false);
    setConversationUrl(null);
    setPhoneConnected(false);
    setMessage("");
    conversationIdRef.current = null;
    leave();
    try {
      const res = await fetch(`${API_BASE}/api/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); }
      catch { throw new Error("Backend is waking up — please try again in 30 s"); }
      if (!res.ok) {
        throw new Error(data?.details?.message || data?.error || `Server error ${res.status}`);
      }
      conversationIdRef.current = data.conversation_id;
      setConversationUrl(data.conversation_url);
      joinRoom(data.conversation_url);
      setStatus("active");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }, [leave, joinRoom]);

  const hangUp = useCallback(() => {
    leave();
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    setStatus("ended");
    setShowQR(false);
    setPhoneConnected(false);
    setMessage("");
  }, [leave]);

  useEffect(() => {
    start();
    return leave;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // First click anywhere unlocks audio if autoplay was blocked
  useEffect(() => {
    if (!needsUnmute || status !== "active") return;
    const unlock = () => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.muted = false;
        remoteVideoRef.current.play().catch(() => {});
      }
      setNeedsUnmute(false);
    };
    document.addEventListener("click", unlock, { once: true });
    return () => document.removeEventListener("click", unlock);
  }, [needsUnmute, status]);

  const sendMessage = useCallback(() => {
    const text = message.trim();
    if (!text || !callRef.current || !conversationIdRef.current) return;
    // Tavus CVI protocol: conversation.respond makes the avatar respond to typed text
    callRef.current.sendAppMessage(
      {
        message_type: "conversation",
        event_type: "conversation.respond",
        conversation_id: conversationIdRef.current,
        properties: { text },
      },
      "*"
    );
    setMessage("");
    inputRef.current?.focus();
  }, [message]);

  const qrUrl = conversationUrl
    ? `${window.location.origin}${import.meta.env.BASE_URL}#/mic?room=${encodeURIComponent(conversationUrl)}`
    : null;

  return (
    <div className="relative w-full h-screen bg-[#06060C] overflow-hidden select-none">

      {/* Avatar video */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
          status === "active" ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* ── Loading ── */}
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#06060C]">
          <img src={import.meta.env.BASE_URL + "profile.jpg"} alt="Kai"
            className="h-14 w-14 rounded-full object-cover opacity-60" />
          <div className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          <p className="text-white/35 text-xs tracking-wide">Connecting to Kai…</p>
        </div>
      )}

      {/* ── Error ── */}
      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#06060C] px-6 text-center">
          <img src={import.meta.env.BASE_URL + "profile.jpg"} alt="Kai"
            className="h-12 w-12 rounded-full object-cover opacity-40" />
          <p className="text-white/45 text-xs leading-relaxed max-w-xs">{error}</p>
          <button onClick={start}
            className="px-5 py-2 rounded-full bg-alstom-ultramarine text-white text-xs font-semibold tracking-wide hover:opacity-90 active:scale-95 transition-all">
            Retry
          </button>
        </div>
      )}

      {/* ── Ended ── */}
      {status === "ended" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#06060C]">
          <img src={import.meta.env.BASE_URL + "profile.jpg"} alt="Kai"
            className="h-14 w-14 rounded-full object-cover opacity-50" />
          <p className="text-white/40 text-xs tracking-wide">Conversation ended</p>
          <button onClick={start}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-alstom-ultramarine text-white text-xs font-semibold tracking-wide shadow-[0_0_24px_rgba(40,80,240,0.4)] hover:opacity-90 active:scale-95 transition-all">
            <PhoneIcon className="h-3.5 w-3.5" />
            Join conversation
          </button>
        </div>
      )}

      {/* ── Active controls ── */}
      {status === "active" && (
        <>
          {/* Bottom bar */}
          <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center gap-2 px-3 pb-3 pt-10 bg-gradient-to-t from-black/80 to-transparent">

            {/* Text prompt input */}
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") sendMessage(); }}
              placeholder={needsUnmute ? "Tap anywhere to hear Kai, then type…" : "Type a message to Kai…"}
              className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-xs placeholder-white/30 focus:outline-none focus:border-white/40 transition-colors"
            />

            {/* Send button */}
            <button
              onClick={sendMessage}
              disabled={!message.trim()}
              className="h-8 w-8 flex-shrink-0 rounded-full bg-alstom-ultramarine disabled:opacity-30 hover:opacity-90 active:scale-95 flex items-center justify-center transition-all"
            >
              <SendIcon className="h-3.5 w-3.5 text-white" />
            </button>

            {/* Phone mic QR toggle */}
            {qrUrl && (
              <button
                onClick={() => setShowQR((v) => !v)}
                className={[
                  "h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center text-sm border transition-all",
                  phoneConnected
                    ? "border-green-400/50 bg-green-400/15 text-green-300"
                    : showQR
                      ? "border-white/30 bg-white/10 text-white/70"
                      : "border-white/15 bg-white/5 text-white/40 hover:text-white/60",
                ].join(" ")}
                title="Use phone as microphone"
              >
                📱
              </button>
            )}

            {/* Hang up */}
            <button
              onClick={hangUp}
              title="End conversation"
              className="h-8 w-8 flex-shrink-0 rounded-full bg-red-600 hover:bg-red-500 active:scale-95 flex items-center justify-center shadow-lg transition-all"
            >
              <HangUpIcon className="h-3.5 w-3.5 text-white" />
            </button>
          </div>

          {/* QR code — appears above the bar */}
          {showQR && qrUrl && !phoneConnected && (
            <div className="absolute bottom-14 right-3 z-30 bg-white rounded-2xl p-3 shadow-2xl flex flex-col items-center gap-1.5">
              <QRCodeSVG value={qrUrl} size={130} />
              <p className="text-[10px] text-gray-400 tracking-wide">Scan to talk</p>
            </div>
          )}
        </>
      )}

      {/* Alstom logo */}
      <div className="absolute top-2 left-3 z-20 pointer-events-none">
        <img src={import.meta.env.BASE_URL + "alstom.png"} alt="Alstom"
          className="h-4 w-auto object-contain opacity-30" draggable={false} />
      </div>
    </div>
  );
}

function PhoneIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" />
    </svg>
  );
}

function HangUpIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.67 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08C.11 12.9 0 12.65 0 12.38c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .27-.11.52-.29.7l-2.47 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.1-.7-.28-.8-.73-1.69-1.36-2.67-1.85-.33-.16-.56-.51-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
    </svg>
  );
}

function SendIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  );
}
