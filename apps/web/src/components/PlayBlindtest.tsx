import { ApiBlindtest } from "@/lib/api-client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "@/components/ImageWithFallback";

type Props = {
    closeBlindtest: () => void;
    blindtest: ApiBlindtest;
};

type Phase = "countdown" | "playing" | "reveal" | "finished";

export const PlayBlindtest: React.FC<Props> = ({ blindtest, closeBlindtest }) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [phase, setPhase] = useState<Phase>("countdown");
    const [countdown, setCountdown] = useState(3);
    const [timeLeft, setTimeLeft] = useState(blindtest.difficulty);
    const [currentIndex, setCurrentIndex] = useState(0);
    const originalVolumeRef = useRef<number>(1);

    const tracks = useMemo(() => {
        const t = blindtest.tracks
            .filter((t) => t.audioSrc)
            .map((t) => ({
                id: t.trackId,
                title: t.title ?? "Unknown title",
                artist: [
                    ...t.mainArtists.map((a) => a.name),
                    ...t.featArtists.map((a) => a.name),
                ],
                album: t.album?.title ?? "",
                image: t.imageUrl ?? undefined,
                duration: `${t.durationSeconds ?? 0}`,
                isLiked: t.isLiked,
                audioSrc: t.audioSrc ?? undefined,
            }));
        const ct = blindtest.compulsoryTracks
            .filter((t) => t.audioSrc)
            .map((t) => ({
                id: t.trackId,
                title: t.title ?? "Unknown title",
                artist: [
                    ...t.mainArtists.map((a) => a.name),
                    ...t.featArtists.map((a) => a.name),
                ],
                album: t.album?.title ?? "",
                image: t.imageUrl ?? undefined,
                duration: `${t.durationSeconds ?? 0}`,
                isLiked: t.isLiked,
                audioSrc: t.audioSrc ?? undefined,
            }));

        const mixed = ct.concat(t);

        // Shuffle tracks
        for (let i = mixed.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
        }

        return mixed;
    }, [blindtest.tracks]);

    const currentTrack = tracks[currentIndex];

    // Init audio
    useEffect(() => {
        audioRef.current = new Audio();

        // Cleanup
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Countdown phase
    useEffect(() => {
        if (phase !== "countdown") return;

        if (countdown <= 0) {
            setPhase("playing");
            setTimeLeft(blindtest.difficulty);
            return;
        }

        const interval = setInterval(() => {
            setCountdown((c) => c - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, countdown, blindtest.difficulty]);

    // Playing phase
    useEffect(() => {
        if (phase !== "playing" || !currentTrack) return;

        if (audioRef.current && currentTrack.audioSrc) {
            // Putting src
            let src = currentTrack.audioSrc;
            if (!src.startsWith("http")) {
                src = `https://files.freemusicarchive.org/storage-freemusicarchive-org/${src}`;
            }
            audioRef.current.src = src;

            // Starting from the middle of the track
            const trackDuration = Number(currentTrack.duration);
            if (!isNaN(trackDuration) && trackDuration > 0) {
                audioRef.current.currentTime = trackDuration / 2;
            } else {
                audioRef.current.currentTime = 0;
            }

            // Playing the song
            audioRef.current.play().catch(console.error);
        }

        const interval = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [phase, currentTrack]);

    // Transition from playing → reveal
    useEffect(() => {
        if (phase !== "playing") return;

        if (timeLeft <= 0) {
            // audioRef.current?.pause();
            setPhase("reveal");
            setTimeLeft(5);
        }
    }, [timeLeft, phase]);

    // Reveal phase
    useEffect(() => {
        if (phase !== "reveal") return;

        const interval = setInterval(() => {
            setTimeLeft((t) => t - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [phase]);

    // Transition reveal → next track
    useEffect(() => {
        if (phase !== "reveal") return;

        let fadeInterval: NodeJS.Timeout | null = null;
        if (timeLeft <= 3 && audioRef.current) {
            const audio = audioRef.current;
    
            // Start fade-out only once
            if (!audio.dataset.fading) {
                audio.dataset.fading = "true";

                // Save audio volume
                originalVolumeRef.current = audio.volume;
    
                const fadeDuration = 2500;
                const steps = 20;
                const stepTime = fadeDuration / steps;
                const volumeStep = audio.volume / steps;
    
                fadeInterval = setInterval(() => {
                    if (!audio) return;

                    const newVolume = Math.max(0, audio.volume - volumeStep);
                    audio.volume = newVolume;
    
                    if (newVolume <= 0) {
                        audio.pause();
                        clearInterval(fadeInterval!);
                    }
                }, stepTime);
            }
        }

        if (timeLeft <= 0) {
            const nextIndex = currentIndex + 1;

            if (audioRef.current) {
                audioRef.current.volume = originalVolumeRef.current;
                audioRef.current.dataset.fading = "";
            }

            if (nextIndex >= tracks.length) {
                setPhase("finished");
                setTimeout(() => {
                    closeBlindtest();
                }, 2000);
            } else {
                setCurrentIndex(nextIndex);
                setPhase("playing");
                setTimeLeft(blindtest.difficulty);
            }
        }
    }, [timeLeft, phase, currentIndex, tracks.length, blindtest.difficulty]);

    // UI
    return (
        <div
            style={styles.container}
        >
            {/* Close button */}
            <button style={styles.close} onClick={closeBlindtest}>✕</button>

            {phase === "countdown" && (
                <div style={styles.center}>
                    <h1>{countdown}</h1>
                </div>
            )}

            {phase === "playing" && currentTrack && (
                <div style={styles.center}>
                    <p>{timeLeft}</p>
                </div>
            )}

            {phase === "reveal" && currentTrack && (
                <div style={styles.center} className="flex flex-col items-center gap-2">
                    {currentTrack.image && (
                        <div className="relative w-52 h-52 rounded-md overflow-hidden flex-shrink-0 bg-secondary/20 cursor-pointer group/image">
                            <Image
                                src={currentTrack.image || "/placeholder-music.jpg"}
                                alt={currentTrack.title}
                                fill
                                className="object-cover transition-opacity"
                            />
                        </div>
                    )}
                    <h2>{currentTrack.title}</h2>
                    <p>{currentTrack.artist.join(", ")}</p>
                    {/* <p>{timeLeft}</p> */}
                </div>
            )}

            {phase === "finished" && (
                <div style={styles.center}>
                    <h1>Bien joué !</h1>
                </div>
            )}
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.3)",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        zIndex: 9999,
        backdropFilter: "blur(30px)",
        WebkitBackdropFilter: "blur(30px)",
    },
    center: {
        textAlign: "center",
        fontSize: "40px",
    },
    close: {
        position: "absolute",
        top: 20,
        right: 20,
        fontSize: 24,
        background: "transparent",
        border: "none",
        color: "white",
        cursor: "pointer",
    },
    image: {
        width: 200,
        height: 200,
        objectFit: "cover",
        marginBottom: 20,
    },
};