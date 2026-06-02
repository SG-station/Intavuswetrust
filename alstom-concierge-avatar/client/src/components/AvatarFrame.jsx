import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from "react";
import DailyIframe from "@daily-co/daily-js";
import { QRCodeSVG } from "qrcode.react";

const AvatarFrame = forwardRef(function AvatarFrame({ conversationUrl, status, isShowroomMode }, ref) {
  const callRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localVideoRef = useRef(null);
  const [micConnected, setMicConnected] = useState(false);

  useImperativeHandle(ref, () => ({
    toggleMute() {
      if (!callRef.current) return;
      callRef.current.setLocalAudio(!callRef.current.localAudio());
    },
    endCall() {
      if (!callRef.current) return;
      callRef.current.leave().catch(() => {});
      callRef.current.destroy();
      callRef.current = null;
    },
  }));

  useEffect(() => {
    if (status !== "active" || !conversationUrl) return;

    // Daily.js keeps a process-level singleton. destroy() does NOT clear it
    // synchronously, so React StrictMode's double-invoke causes a "Duplicate
    // DailyIframe instances" crash if we destroy then immediately recreate.
    // Fix: reuse the existing instance (which may be in "left-meeting" state
    // after the first cleanup's leave()). destroy() is only called in endCall().
    let call = DailyIframe.getCallInstance();
    if (!call) {
      call = DailyIframe.createCallObject();
    }
    callRef.current = call;

    const attachTracks = () => {
      if (callRef.current !== call) return;
      const participants = call.participants();

      // Local PiP — laptop mode only (showroom mode has no local camera)
      if (!isShowroomMode) {
        const local = participants.local;
        const localVT =
          local?.tracks?.video?.persistentTrack ?? local?.tracks?.video?.track;
        if (localVT && localVideoRef.current) {
          const cur = localVideoRef.current.srcObject;
          if (!cur || cur.getVideoTracks()[0] !== localVT) {
            localVideoRef.current.srcObject = new MediaStream([localVT]);
            localVideoRef.current.play().catch(() => {});
          }
        }
      }

      // Remote avatar — prefer the participant with a video track (the avatar bot).
      // In showroom mode the phone participant also appears as non-local but has no video.
      const remote =
        Object.values(participants).find(
          (p) => !p.local && (p.tracks?.video?.persistentTrack ?? p.tracks?.video?.track)
        ) ?? Object.values(participants).find((p) => !p.local);

      if (remote && remoteVideoRef.current) {
        const vt =
          remote.tracks?.video?.persistentTrack ?? remote.tracks?.video?.track;
        const at =
          remote.tracks?.audio?.persistentTrack ?? remote.tracks?.audio?.track;
        const tracks = [vt, at].filter(Boolean);
        if (tracks.length) {
          const cur = remoteVideoRef.current.srcObject;
          const same =
            cur &&
            tracks.length === cur.getTracks().length &&
            tracks.every((t) => cur.getTracks().includes(t));
          if (!same) {
            remoteVideoRef.current.srcObject = new MediaStream(tracks);
            remoteVideoRef.current.play().catch(() => {});
          }
        }
      }
    };

    // Phone detection: count non-local participants.
    // avatar alone = 1, avatar + phone = 2 → mic connected.
    const updateMicConnected = () => {
      if (callRef.current !== call) return;
      const count = Object.values(call.participants()).filter((p) => !p.local).length;
      setMicConnected(count >= 2);
    };

    // On join: attach tracks + request the highest available video quality layer.
    // Daily.js simulcast: layer 2 = full resolution, layer 0 = lowest thumbnail.
    const onJoinedMeeting = () => {
      attachTracks();
      call.updateReceiveSettings({ "*": { video: { layer: 2 } } }).catch(() => {});
    };

    call.on("joined-meeting", onJoinedMeeting);
    call.on("track-started", attachTracks);
    call.on("participant-joined", attachTracks);
    call.on("participant-joined", updateMicConnected);
    call.on("participant-updated", attachTracks);
    call.on("participant-left", updateMicConnected);

    const state = call.meetingState();
    if (state !== "joining-meeting" && state !== "joined-meeting") {
      call
        .join({
          url: conversationUrl,
          // Showroom: screen is viewer-only — no local mic or camera
          startVideoOff: isShowroomMode ? true : false,
          startAudioOff: isShowroomMode ? true : false,
        })
        .catch((err) => console.error("Daily join failed:", err));
    } else {
      attachTracks();
    }

    return () => {
      try { call.off("joined-meeting", onJoinedMeeting); } catch {}
      try { call.off("track-started", attachTracks); } catch {}
      try { call.off("participant-joined", attachTracks); } catch {}
      try { call.off("participant-joined", updateMicConnected); } catch {}
      try { call.off("participant-updated", attachTracks); } catch {}
      try { call.off("participant-left", updateMicConnected); } catch {}
      if (callRef.current === call) {
        call.leave().catch(() => {});
        callRef.current = null;
      }
    };
  }, [status, conversationUrl, isShowroomMode]);

  const isLoading = status === "loading";

  if (status === "active" && conversationUrl) {
    // Hash-router URL: https://host/Intavuswetrust/#/mic?room=...
    const qrUrl = `${window.location.origin}${import.meta.env.BASE_URL}#/mic?room=${encodeURIComponent(conversationUrl)}`;

    return (
      <>
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />

        {/* Laptop mode: local camera PiP */}
        {!isShowroomMode && (
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="absolute bottom-6 right-6 z-20 w-48 aspect-video rounded-xl ring-2 ring-white/20 object-cover"
          />
        )}

        {/* Showroom mode: QR code or mic-connected pill */}
        {isShowroomMode && (
          <div className="absolute bottom-6 right-6 z-20">
            {micConnected ? (
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full px-4 py-2.5 shadow-xl text-sm font-semibold text-gray-800">
                <span>🎤</span>
                <span>Mic connected</span>
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-3 shadow-2xl flex flex-col items-center gap-2">
                <QRCodeSVG value={qrUrl} size={180} />
                <span className="text-xs text-gray-400 tracking-wide">Scan to talk</span>
              </div>
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <div className="relative w-full aspect-video max-w-5xl rounded-3xl overflow-hidden shadow-2xl">
      <PlaceholderContent isLoading={isLoading} />
    </div>
  );
});

export default AvatarFrame;

function PlaceholderContent({ isLoading }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 overflow-hidden">
      {/* Light base — the white "cloud" center */}
      <div className="absolute inset-0 bg-[#F5F0FF]" />

      {/* Orange glow — top-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 620,
          height: 620,
          top: "-28%",
          left: "-22%",
          background: "radial-gradient(circle, rgba(255,130,60,0.60), transparent 58%)",
          filter: "blur(80px)",
          animation: "blob-float 14s ease-in-out infinite",
        }}
      />
      {/* Violet glow — bottom-right */}
      <div
        className="absolute rounded-full"
        style={{
          width: 560,
          height: 560,
          bottom: "-22%",
          right: "-18%",
          background: "radial-gradient(circle, rgba(120,70,255,0.55), transparent 58%)",
          filter: "blur(76px)",
          animation: "blob-float-2 17s ease-in-out infinite",
        }}
      />
      {/* White highlight — center */}
      <div
        className="absolute rounded-full"
        style={{
          width: 480,
          height: 480,
          top: "15%",
          left: "20%",
          background: "radial-gradient(circle, rgba(255,255,255,0.90), transparent 52%)",
          filter: "blur(60px)",
          animation: "blob-float-3 20s ease-in-out infinite",
        }}
      />
      {/* Soft pink accent — bottom-left */}
      <div
        className="absolute rounded-full"
        style={{
          width: 320,
          height: 320,
          bottom: "5%",
          left: "10%",
          background: "radial-gradient(circle, rgba(255,140,200,0.35), transparent 60%)",
          filter: "blur(55px)",
          animation: "blob-float 22s ease-in-out infinite reverse",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <img
            src={import.meta.env.BASE_URL + "profile.jpg"}
            alt="AI Avatar"
            className="h-28 w-28 rounded-full object-cover shadow-xl"
            style={{ boxShadow: "0 4px 32px rgba(120,70,255,0.20), 0 2px 12px rgba(0,0,0,0.12)" }}
          />
          {isLoading && (
            <div className="absolute -inset-2 rounded-full border-2 border-violet-500/50 border-t-transparent animate-spin" />
          )}
        </div>

        <div className="space-y-2.5 max-w-md">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: "#1a1035" }}>
            {isLoading ? "Connecting to your AI Avatar…" : "Meet your AI Avatar"}
          </h2>
          <p className="text-sm leading-relaxed font-normal" style={{ color: "rgba(50,30,90,0.55)" }}>
            {isLoading
              ? "We're establishing a secure session with the AI Avatar."
              : "An interactive AI guide to walk you through the Innovation Station. Press the button below to start the conversation."}
          </p>
        </div>
      </div>
    </div>
  );
}
