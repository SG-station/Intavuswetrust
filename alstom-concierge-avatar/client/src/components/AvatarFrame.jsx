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
    <div className="relative w-full aspect-video max-w-5xl overflow-hidden shadow-2xl">
      <PlaceholderContent isLoading={isLoading} />
    </div>
  );
});

export default AvatarFrame;

function PlaceholderContent({ isLoading }) {
  return (
    <div className="absolute inset-0 bg-gradient-to-br from-[#eef2ff] via-white to-[#f0f6ff] flex flex-col items-center justify-center gap-7">

      <img
        src={import.meta.env.BASE_URL + "profile.jpg"}
        alt="Kai"
        className={`rounded-full object-cover shadow-2xl ring-4 ring-white transition-all duration-500 ${isLoading ? "h-24 w-24 opacity-60" : "h-36 w-36 opacity-100"}`}
      />

      {isLoading ? (
        <>
          <div className="h-6 w-6 rounded-full border-2 border-slate-300 border-t-slate-600 animate-spin" />
          <p className="text-slate-400 text-sm tracking-widest uppercase">Connecting…</p>
        </>
      ) : (
        <h2 className="text-slate-800 text-5xl font-black tracking-tight uppercase text-center px-8">
          Meet your AI avatar
        </h2>
      )}
    </div>
  );
}
