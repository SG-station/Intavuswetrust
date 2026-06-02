import React, { useCallback, useEffect, useRef, useState } from "react";
import BrandHeader from "./components/BrandHeader.jsx";
import AvatarFrame from "./components/AvatarFrame.jsx";
import ControlBar from "./components/ControlBar.jsx";
import CallControls from "./components/CallControls.jsx";
import FullscreenButton from "./components/FullscreenButton.jsx";
import AnimatedBackground from "./components/AnimatedBackground.jsx";

// In dev: empty string → Vite proxy forwards /api/* to localhost:3001
// In production: set VITE_API_BASE to your deployed backend URL (e.g. https://xxx.onrender.com)
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export default function App() {
  const [status, setStatus] = useState("idle"); // idle | loading | active | error
  const [conversation, setConversation] = useState(null);
  const [error, setError] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isShowroomMode, setIsShowroomMode] = useState(false);
  const avatarRef = useRef(null);

  const toggleShowroomMode = useCallback(() => setIsShowroomMode((prev) => !prev), []);

  const startConversation = useCallback(async () => {
    setStatus("loading");
    setError(null);
    setIsMuted(false);
    try {
      const res = await fetch(`${API_BASE}/api/conversation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      // Guard against HTML responses (e.g. Render cold-start wake-up page)
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Backend is waking up — please wait 30 seconds and try again");
      }
      if (!res.ok) {
        throw new Error(
          data?.details?.message ||
            data?.error ||
            `Server responded with ${res.status}`
        );
      }
      setConversation(data);
      setStatus("active");
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to start conversation");
      setStatus("error");
    }
  }, []);

  const endConversation = useCallback(async () => {
    avatarRef.current?.endCall();
    if (!conversation?.conversation_id) {
      setStatus("idle");
      setConversation(null);
      setIsMuted(false);
      return;
    }
    try {
      await fetch(`${API_BASE}/api/conversation/${conversation.conversation_id}`, {
        method: "DELETE",
      });
    } catch (err) {
      console.warn("End-call API failed (continuing anyway):", err);
    } finally {
      setConversation(null);
      setStatus("idle");
      setIsMuted(false);
    }
  }, [conversation]);

  const handleMuteToggle = useCallback(() => {
    avatarRef.current?.toggleMute();
    setIsMuted((prev) => !prev);
  }, []);

  // Auto-fullscreen when active; exit when returning to idle
  useEffect(() => {
    if (status === "active") {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (status !== "active" && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [status]);

  useEffect(() => {
    if (status === "loading" || status === "active") setError(null);
  }, [status]);

  // Fullscreen active view — no header, no footer
  if (status === "active") {
    return (
      <div className="relative h-screen w-screen overflow-hidden bg-black">
        <AvatarFrame
          ref={avatarRef}
          conversationUrl={conversation?.conversation_url}
          status={status}
          isShowroomMode={isShowroomMode}
        />
        <CallControls
          status={status}
          isMuted={isMuted}
          onMuteToggle={handleMuteToggle}
          onEnd={endConversation}
        />
        <FullscreenButton status={status} />
      </div>
    );
  }

  // Idle / loading / error view
  return (
    <div className="relative min-h-screen flex flex-col bg-[#08080F]">
      <AnimatedBackground />
      <BrandHeader />

      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-28 pb-12">
        <AvatarFrame
          ref={avatarRef}
          conversationUrl={conversation?.conversation_url}
          status={status}
          isShowroomMode={isShowroomMode}
        />

        <ControlBar
          status={status === "error" ? "idle" : status}
          onStart={startConversation}
          onEnd={endConversation}
          error={error}
          isShowroomMode={isShowroomMode}
          onToggleShowroom={toggleShowroomMode}
        />
      </main>

      <footer className="px-8 pb-6 flex items-center justify-between text-[11px] text-white/20 uppercase tracking-widest">
        <span>Alstom · Internal use only</span>
        <span>Powered by Tavus CVI</span>
      </footer>
    </div>
  );
}
