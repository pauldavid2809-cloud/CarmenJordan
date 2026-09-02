'use client'

import { useState } from 'react'

interface Props {
  roomName: string
  displayName: string
  className?: string
}

export default function JitsiVideoCall({ roomName, displayName, className = '' }: Props) {
  const [loading, setLoading] = useState(true)

  // Nombre de sala sanitizado y seguro
  const cleanRoom = roomName.replace(/[^a-zA-Z0-9-_]/g, '')
  const encodedName = encodeURIComponent(displayName || 'Participante')
  
  // URL de Jitsi con parámetros para sala limpia y directa
  const jitsiUrl = `https://meet.jit.si/${cleanRoom}#config.prejoinPageEnabled=false&config.disableDeepLinking=true&userInfo.displayName="${encodedName}"`

  return (
    <div className={`relative w-full h-full bg-[#1A1A1A] rounded-2xl overflow-hidden shadow-inner flex flex-col ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#242424] text-white z-10">
          <div className="w-12 h-12 rounded-full border-4 border-[#B39DDB]/30 border-t-[#B39DDB] animate-spin mb-4" />
          <p className="font-medium text-sm">Conectando a la sala virtual segura...</p>
          <p className="text-xs text-gray-400 mt-1">Habilita los permisos de cámara y micrófono si tu navegador lo solicita</p>
        </div>
      )}

      <iframe
        src={jitsiUrl}
        allow="camera; microphone; display-capture; autoplay; clipboard-write"
        className="w-full h-full border-0 flex-1"
        onLoad={() => setLoading(false)}
        title="Videollamada de Consulta Online"
      />
    </div>
  )
}
