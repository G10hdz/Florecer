import * as React from "react"

const columns = 6
const frames = 30
const frameWidth = 140
const frameHeight = 654 / 5

interface CelebrationBurstProps {
  onComplete: () => void
}

function CelebrationBurst({ onComplete }: CelebrationBurstProps) {
  const [frame, setFrame] = React.useState(0)
  const onCompleteRef = React.useRef(onComplete)

  React.useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  React.useEffect(() => {
    const duration = 1000
    const startedAt = performance.now()
    let animationFrame = 0

    const animate = (now: number) => {
      const elapsed = now - startedAt
      setFrame(Math.min(Math.floor(elapsed / (duration / frames)), frames - 1))

      if (elapsed < duration) {
        animationFrame = requestAnimationFrame(animate)
      } else {
        onCompleteRef.current()
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [])

  const column = frame % columns
  const row = Math.floor(frame / columns)

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center" aria-hidden="true">
      <div
        className="pixelart origin-center scale-200"
        style={{
          width: `${frameWidth}px`,
          height: `${frameHeight}px`,
          backgroundImage: "url('/assets/pixelart/celebrations/star_explosion_6x5.png')",
          backgroundPosition: `-${column * frameWidth}px -${row * frameHeight}px`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "840px 654px",
        }}
      />
    </div>
  )
}

export { CelebrationBurst }
