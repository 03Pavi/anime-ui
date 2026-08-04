"use client"

import { useEffect } from "react"

const PwaRegister = () => {
  useEffect(() => {
    if (typeof window === "undefined") return
    if ("serviceWorker" in navigator) {
      const registerServiceWorker = async () => {
        try {
          await navigator.serviceWorker.register("/sw.js")
        } catch (error) {
          console.error("Service worker registration failed:", error)
        }
      }

      window.addEventListener("load", registerServiceWorker)
      return () => window.removeEventListener("load", registerServiceWorker)
    }
  }, [])

  return null
}

export default PwaRegister
