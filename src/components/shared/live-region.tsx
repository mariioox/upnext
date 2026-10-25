import { useEffect, useState } from "react"

let announceHandler: ((message: string) => void) | null = null

export function announce(message: string) {
  if (announceHandler) {
    announceHandler(message)
  }
}

export function LiveRegion() {
  const [message, setMessage] = useState("")

  useEffect(() => {
    announceHandler = (msg) => {
      setMessage("")
      setTimeout(() => setMessage(msg), 50)
    }
    return () => {
      announceHandler = null
    }
  }, [])

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  )
}
