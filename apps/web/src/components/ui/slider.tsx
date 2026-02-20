"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SliderProps {
  className?: string
  min?: number
  max?: number
  step?: number
  value?: number[]
  onValueChange?: (value: number[]) => void
}

export function Slider({ className, min = 0, max = 100, step = 1, value = [0], onValueChange, ...props }: SliderProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = parseFloat(e.target.value)
        if (onValueChange) {
            onValueChange([newValue])
        }
    }

  const percentage = ((value[0] - min) / (max - min)) * 100

  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value[0]}
      onChange={handleChange}
      className={cn(
        "w-full h-2 rounded-lg appearance-none cursor-pointer",
        className
      )}
      style={{
        background: `linear-gradient(to right, var(--color-muse-pink) 0%, var(--color-muse-sky-blue) ${percentage}%, var(--color-muse-dark-blue) ${percentage}%, var(--color-muse-dark-blue) 100%)`
      }}
      {...props}
    />
  )
}
