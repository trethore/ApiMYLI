"use client"

import { usePlayer } from "@/context/PlayerContext"

export default function PlayerPadding() {
  const { currentTrack } = usePlayer()

  if (!currentTrack) return null

  return (
      // Height matches the player height + some buffer
      // Player is h-24 on desktop, and variable on mobile but sits above nav
      // Mobile Nav is ~60px
      // Player mobile is ~80px?
      <div className="h-32 lg:h-24 w-full shrink-0" />
  )
}
