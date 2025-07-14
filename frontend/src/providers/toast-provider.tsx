"use client"

import { Toaster } from "react-hot-toast"

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 5000,
        style: {
          background: '#fff',
          color: '#363636',
        },
      }}
    />
  )
}
