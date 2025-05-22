"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef } from "react"

export function AuthBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const setCanvasDimensions = () => {
      const devicePixelRatio = window.devicePixelRatio || 1
      const width = window.innerWidth
      const height = window.innerHeight
      
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
      
      ctx.scale(devicePixelRatio, devicePixelRatio)
    }

    setCanvasDimensions()
    window.addEventListener("resize", setCanvasDimensions)

    const particleCount = 60
    const particles: Particle[] = []

    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      color: string

      constructor() {
        this.x = Math.random() * window.innerWidth
        this.y = Math.random() * window.innerHeight
        this.size = Math.random() * 4 + 1
        this.speedX = Math.random() * 2 - 1
        this.speedY = Math.random() * 2 - 1
        
        const r = 59 + Math.random() * 60
        const g = 130 + Math.random() * 60
        const b = 246 + Math.random() * 10
        
        this.color = isDark
          ? `rgba(${r}, ${g}, ${b}, ${0.2 + Math.random() * 0.3})`
          : `rgba(${r}, ${g}, ${b}, ${0.15 + Math.random() * 0.15})`
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY

        if (this.x > window.innerWidth) this.x = 0
        else if (this.x < 0) this.x = window.innerWidth
        if (this.y > window.innerHeight) this.y = 0
        else if (this.y < 0) this.y = window.innerHeight
      }

      draw() {
        ctx!.fillStyle = this.color
        ctx!.beginPath()
        ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx!.fill()
      }
    }

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    function connect() {
      const maxDistance = 180
      for (let a = 0; a < particles.length; a++) {
        for (let b = a; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x
          const dy = particles[a].y - particles[b].y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < maxDistance) {
            const opacity = 1 - distance / maxDistance
            ctx!.strokeStyle = isDark 
              ? `rgba(79, 140, 255, ${opacity * 0.25})` 
              : `rgba(79, 140, 255, ${opacity * 0.15})`
            ctx!.lineWidth = 1.5
            ctx!.beginPath()
            ctx!.moveTo(particles[a].x, particles[a].y)
            ctx!.lineTo(particles[b].x, particles[b].y)
            ctx!.stroke()
          }
        }
      }
    }

    function animate() {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight)

      for (let i = 0; i < particles.length; i++) {
        particles[i].update()
        particles[i].draw()
      }

      connect()
      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasDimensions)
    }
  }, [isDark])

  return (
    <>
      <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-full w-full" aria-hidden="true" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/40 to-background/70 backdrop-blur-[1px]" />
    </>
  )
}