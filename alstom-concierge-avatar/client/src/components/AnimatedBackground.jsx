import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const BLOBS = [
  { id: 0, left: "8%",   top: "10%",  size: 720, color: "rgba(40, 80, 240, 0.22)",  dur: 9  },
  { id: 1, left: "72%",  top: "60%",  size: 640, color: "rgba(20, 40, 100, 0.28)",  dur: 11 },
  { id: 2, left: "35%",  top: "80%",  size: 580, color: "rgba(40, 80, 240, 0.16)",  dur: 13 },
  { id: 3, left: "82%",  top: "5%",   size: 500, color: "rgba(150, 70, 220, 0.14)", dur: 10 },
  { id: 4, left: "50%",  top: "40%",  size: 420, color: "rgba(0, 100, 255, 0.10)",  dur: 15 },
];

const LINES = [
  { id: 0, y: "22%",  w: "45%", left: "5%"  },
  { id: 1, y: "48%",  w: "30%", left: "60%" },
  { id: 2, y: "70%",  w: "38%", left: "25%" },
  { id: 3, y: "85%",  w: "22%", left: "72%" },
];

const DOTS = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  left: `${4 + (i * 41 + 13) % 92}%`,
  top:  `${3 + (i * 57 + 9)  % 92}%`,
  size: i % 4 === 0 ? 2.5 : 1.5,
  opacity: 0.08 + (i % 6) * 0.03,
}));

export default function AnimatedBackground() {
  const containerRef = useRef(null);

  useGSAP(() => {
    containerRef.current.querySelectorAll(".ab-blob").forEach((el, i) => {
      const b = BLOBS[i];
      gsap.to(el, {
        x: () => (Math.random() - 0.5) * 200,
        y: () => (Math.random() - 0.5) * 160,
        scale: () => 0.75 + Math.random() * 0.5,
        duration: b.dur,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 1.2,
      });
    });

    containerRef.current.querySelectorAll(".ab-line").forEach((el, i) => {
      gsap.to(el, {
        scaleX: () => 0.3 + Math.random() * 0.8,
        opacity: () => 0.03 + Math.random() * 0.08,
        duration: 6 + i * 2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 1.8,
        transformOrigin: "left center",
      });
    });

    containerRef.current.querySelectorAll(".ab-dot").forEach((el, i) => {
      gsap.to(el, {
        opacity: () => 0.05 + Math.random() * 0.18,
        scale: () => 0.6 + Math.random() * 0.8,
        x: () => (Math.random() - 0.5) * 18,
        y: () => (Math.random() - 0.5) * 18,
        duration: 3 + (i % 5) * 1.2,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: i * 0.25,
      });
    });
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {BLOBS.map((b) => (
        <div
          key={b.id}
          className="ab-blob absolute rounded-full"
          style={{
            left: b.left,
            top: b.top,
            width: b.size,
            height: b.size,
            background: `radial-gradient(circle, ${b.color} 0%, transparent 65%)`,
            transform: "translate(-50%, -50%)",
            filter: "blur(70px)",
          }}
        />
      ))}

      {LINES.map((l) => (
        <div
          key={l.id}
          className="ab-line absolute h-px"
          style={{
            top: l.y,
            left: l.left,
            width: l.w,
            background: "linear-gradient(90deg, transparent, rgba(40,80,240,0.25), transparent)",
            opacity: 0.06,
          }}
        />
      ))}

      {DOTS.map((d) => (
        <div
          key={d.id}
          className="ab-dot absolute rounded-full bg-white"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            opacity: d.opacity,
          }}
        />
      ))}
    </div>
  );
}
