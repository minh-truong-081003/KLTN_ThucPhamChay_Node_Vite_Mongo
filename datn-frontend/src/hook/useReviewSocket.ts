import { useEffect, useRef, useCallback } from 'react'
import { io } from 'socket.io-client'

const socket = io('ws://localhost:8000', {
  transports: ['websocket', 'pulling', 'flashsocket'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
})

type ReviewEventData = { reviewId: string; productId: string; is_deleted?: boolean; is_active?: boolean }

interface ReviewSocketCallbacks {
  onReviewCreated?: (data: ReviewEventData) => void
  onReviewUpdated?: (data: ReviewEventData) => void
  onReviewDeleted?: (data: ReviewEventData) => void
  onReviewToggled?: (data: ReviewEventData) => void
  onReviewRestored?: (data: ReviewEventData) => void
  onReviewForceDeleted?: (data: ReviewEventData) => void
}

export const useReviewSocket = (productId?: string, callbacks?: ReviewSocketCallbacks) => {
  const debounceTimerRef = useRef<{ [key: string]: NodeJS.Timeout }>({})

  // Debounce refetch để tránh gọi nhiều lần trong thời gian ngắn
  const debounceCallback = useCallback(
    (key: string, callback?: (data: ReviewEventData) => void, data?: ReviewEventData) => {
      if (!callback) return

      // Clear timeout cũ nếu có
      if (debounceTimerRef.current[key]) {
        clearTimeout(debounceTimerRef.current[key])
      }

      // Set timeout mới - refetch sau 300ms
      debounceTimerRef.current[key] = setTimeout(() => {
        if (data) callback(data)
        delete debounceTimerRef.current[key]
      }, 300)
    },
    []
  )

  useEffect(() => {
    // Join product room nếu có productId
    if (productId) {
      socket.emit('review:joinProduct', productId)
    }

    // Listen to events với debounce
    const handleCreated = (data: ReviewEventData) => debounceCallback('created', callbacks?.onReviewCreated, data)
    const handleUpdated = (data: ReviewEventData) => debounceCallback('updated', callbacks?.onReviewUpdated, data)
    const handleDeleted = (data: ReviewEventData) => debounceCallback('deleted', callbacks?.onReviewDeleted, data)
    const handleToggled = (data: ReviewEventData) => debounceCallback('toggled', callbacks?.onReviewToggled, data)
    const handleRestored = (data: ReviewEventData) => debounceCallback('restored', callbacks?.onReviewRestored, data)
    const handleForceDeleted = (data: ReviewEventData) =>
      debounceCallback('forceDeleted', callbacks?.onReviewForceDeleted, data)

    socket.on('review:created', handleCreated)
    socket.on('review:updated', handleUpdated)
    socket.on('review:deleted', handleDeleted)
    socket.on('review:toggled', handleToggled)
    socket.on('review:restored', handleRestored)
    socket.on('review:forceDeleted', handleForceDeleted)

    // Cleanup
    return () => {
      // Clear tất cả debounce timers
      Object.values(debounceTimerRef.current).forEach((timer) => clearTimeout(timer))
      debounceTimerRef.current = {}

      if (productId) {
        socket.emit('review:leaveProduct', productId)
      }

      socket.off('review:created', handleCreated)
      socket.off('review:updated', handleUpdated)
      socket.off('review:deleted', handleDeleted)
      socket.off('review:toggled', handleToggled)
      socket.off('review:restored', handleRestored)
      socket.off('review:forceDeleted', handleForceDeleted)
    }
  }, [productId, callbacks, debounceCallback])

  return socket
}
