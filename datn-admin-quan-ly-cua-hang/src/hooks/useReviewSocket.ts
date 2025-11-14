import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const socket = io('ws://localhost:8000', {
  transports: ['websocket', 'pulling', 'flashsocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
})

interface ReviewSocketCallbacks {
  onReviewCreated?: () => void
  onReviewUpdated?: () => void
  onReviewDeleted?: () => void
  onReviewToggled?: () => void
  onReviewRestored?: () => void
  onReviewForceDeleted?: () => void
}

export const useReviewSocket = (callbacks?: ReviewSocketCallbacks) => {
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Debounce refetch để tránh gọi nhiều lần khi có nhiều events liên tiếp
  const debounceRefetch = useCallback((callback?: () => void) => {
    if (!callback) return

    // Clear timeout cũ nếu có
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set timeout mới - refetch sau 300ms
    debounceTimerRef.current = setTimeout(() => {
      callback()
      debounceTimerRef.current = null
    }, 300)
  }, [])

  useEffect(() => {
    // Listen to global review events với debounce
    const handleCreated = () => debounceRefetch(callbacks?.onReviewCreated)
    const handleUpdated = () => debounceRefetch(callbacks?.onReviewUpdated)
    const handleDeleted = () => debounceRefetch(callbacks?.onReviewDeleted)
    const handleToggled = () => debounceRefetch(callbacks?.onReviewToggled)
    const handleRestored = () => debounceRefetch(callbacks?.onReviewRestored)
    const handleForceDeleted = () => debounceRefetch(callbacks?.onReviewForceDeleted)

    socket.on('review:created', handleCreated)
    socket.on('review:updated', handleUpdated)
    socket.on('review:deleted', handleDeleted)
    socket.on('review:toggled', handleToggled)
    socket.on('review:restored', handleRestored)
    socket.on('review:forceDeleted', handleForceDeleted)

    // Cleanup
    return () => {
      // Clear debounce timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }

      socket.off('review:created', handleCreated)
      socket.off('review:updated', handleUpdated)
      socket.off('review:deleted', handleDeleted)
      socket.off('review:toggled', handleToggled)
      socket.off('review:restored', handleRestored)
      socket.off('review:forceDeleted', handleForceDeleted)
    }
  }, [callbacks, debounceRefetch])

  return socket
}
