"use client";

import { usePlayer } from "@/context/PlayerContext";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Activity, Power, PowerOff } from "lucide-react";

export default function MusicVisualizer() {
  const { isPlaying, volume } = usePlayer();
  const [isEnabled, setIsEnabled] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    if (isPlaying) {
      setHasStarted(true);
    }
  }, [isPlaying]);

  const barCount = 40;

  // Animation Loop
  const animate = () => {
    if (containerRef.current && isEnabled && isPlaying) {
      const bars = containerRef.current.children as HTMLCollectionOf<HTMLElement>;
      const time = Date.now() / 1000;

      for (let i = 0; i < bars.length; i++) {
        // Create a pseudo-random wave pattern
        // Base wave based on time and index
        const wave = Math.sin(time * 1 + i * 0.2) * 0.5 + 0.5;
        // Fast "beat" noise
        const noise = Math.random();

        // Combine them: beat hits harder on some bars
        const height = (wave * 0.3 + noise * 0.7) * (volume * 100);

        // Clamp and smooth
        const finalHeight = Math.max(5, Math.min(100, height));

        bars[i].style.height = `${finalHeight}%`;
      }
    } else if (containerRef.current && (!isPlaying || !isEnabled)) {
      // Reset to flat line if paused
      const bars = containerRef.current.children as HTMLCollectionOf<HTMLElement>;
      for (let i = 0; i < bars.length; i++) {
        bars[i].style.height = "5%";
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  });

  if (!hasStarted && !isPlaying) return null;

  return (
    <div className="w-full h-48 bg-background/50 backdrop-blur-sm rounded-xl border border-white/10 relative overflow-hidden flex flex-col items-center justify-center mb-8 bg-gradient-to-b from-muse-dark-blue/20 to-transparent">
      {/* Toggle Button */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEnabled(!isEnabled)}
          className="hover:bg-white/10 rounded-full"
          title={isEnabled ? "Désactiver le visualiseur" : "Activer le visualiseur"}
        >
          {isEnabled ? (
            <Power size={20} className="text-muse-sky-blue" />
          ) : (
            <PowerOff size={20} className="text-muted-foreground" />
          )}
        </Button>
      </div>

      {/* Visualizer Masked by Logo */}
      <div className="relative w-full max-w-lg h-32">
        <svg viewBox="0 0 339 142" className="w-full h-full">
          <defs>
            <mask id="muse-logo-mask" maskUnits="userSpaceOnUse">
              {/* Muse Logo Paths - White Stroke for Masking */}
              <g
                stroke="white"
                strokeWidth="12"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              >
                <path
                  d="M302.5 64L292 63.5L282 64H278.008C268.973 64 261.726 71.4693 262 80.5L261.5 97M261.5 97H299.463M261.5 97L261.051 112.713C261.017 113.901 261.101 115.09 261.302 116.262C262.841 125.238 270.851 131.644 279.946 131.172L283.25 131H293L302.5 130"
                  strokeWidth="17"
                />
                <path
                  d="M241.5 77.2992C240.457 72.4399 237.477 68.2161 233.249 65.6035L232.152 64.9255C229.701 63.4109 226.967 62.4099 224.118 61.9833L223.905 61.9513C219.753 61.3297 215.51 61.8912 211.663 63.5712L211.119 63.8087C209.608 64.4686 208.193 65.3296 206.912 66.3684L204.686 68.1739C201.806 70.5096 200.133 74.0198 200.133 77.7278C200.133 79.2401 200.412 80.7395 200.956 82.1507L201.015 82.3047C202.198 85.3759 204.487 87.8936 207.432 89.3634L213.741 92.5118L223.538 96.315L229.778 98.6508C231.412 99.2623 232.928 100.15 234.26 101.275C237.489 104.002 239.437 107.949 239.639 112.17L239.703 113.513C239.81 115.773 239.335 118.023 238.321 120.047C237.198 122.289 235.458 124.165 233.307 125.453L231.201 126.715C227.62 128.859 223.496 129.921 219.325 129.772L214.895 129.614C211.993 129.511 209.16 128.697 206.645 127.243L204.64 126.085C201.759 124.42 199.677 121.658 198.868 118.431C198.624 117.454 198.5 116.452 198.5 115.445V115.331"
                  strokeWidth="17"
                />
                <path
                  d="M8.5 130V115.5V100V68.5C8.5 57.2462 24.4302 54.9851 27.5619 65.7943L30.7236 76.7071C33.4395 86.0815 46.6003 86.4112 49.7822 77.1845L53.0464 67.7194C56.7254 57.0512 72.5 59.6948 72.5 70.9795V75.5L73.5 104V117.5V131.5"
                  strokeWidth="17"
                />
                <path
                  d="M115.548 118L169.491 129.5M169.491 90.5V79.8539C169.491 75.9832 168.23 73.2227 163.268 72.1594L158.13 71.1651C152.213 69.8972 152.65 72.516 152.65 77.1311C152.65 80.2325 153.099 83.7321 157.075 84.5842L164.953 87.07C169.915 88.1334 169.491 86.6293 169.491 90.5ZM169.491 90.5V134L115.548 122.441V82.7437M115.548 82.7437V68.2947C115.548 64.4241 113.751 61.2865 108.789 60.2231L102.975 59.2329C97.0578 57.965 97.5078 62.0755 97.5078 66.6905C97.5078 69.792 99.6695 73.2916 103.646 74.1437L110.838 75.6352C115.801 76.6985 115.548 78.873 115.548 82.7437Z"
                  strokeWidth="15"
                />
                <path
                  d="M290.803 33.1318C309.442 27.6592 328.265 38.5266 332.845 57.4047M294.259 47.3734C305.132 44.1811 316.112 50.5204 318.783 61.5326"
                  strokeWidth="8"
                />
              </g>
            </mask>
          </defs>
          <foreignObject width="100%" height="100%" mask="url(#muse-logo-mask)">
            {isPlaying && isEnabled ? (
              <div
                ref={containerRef}
                className="flex items-end justify-center gap-1 w-full h-[142px] px-0"
              >
                {Array.from({ length: 40 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[3%] rounded-t-sm transition-[height] duration-75 ease-linear"
                    style={{
                      height: "50%",
                      background: `linear-gradient(to top, var(--color-muse-dark-blue), var(--color-muse-pink))`,
                    }}
                  />
                ))}
              </div>
            ) : (
              <div
                className="w-full h-full"
                style={{
                  background: `linear-gradient(to bottom, var(--color-muse-pink), var(--color-muse-sky-blue))`,
                }}
              />
            )}
          </foreignObject>
        </svg>
      </div>
    </div>
  );
}
