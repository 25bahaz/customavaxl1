"use client"

import { useState, useCallback } from "react"
import Notification, { NotificationType } from "./Notification"

export interface NotificationItem {
  id: string
  type: NotificationType
  title: string
  message: string
  duration?: number
}

export default function NotificationManager() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const showNotification = useCallback((type: NotificationType, title: string, message: string, duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: NotificationItem = {
      id,
      type,
      title,
      message,
      duration
    }
    
    setNotifications(prev => [...prev, newNotification])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }, [])

  // Expose the showNotification function globally
  if (typeof window !== 'undefined') {
    (window as any).showNotification = showNotification
  }

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          {...notification}
          onClose={removeNotification}
        />
      ))}
    </>
  )
}

// Utility functions for easy notification calls
export const notify = {
  success: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('success', title, message, duration)
    }
  },
  error: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('error', title, message, duration)
    }
  },
  warning: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('warning', title, message, duration)
    }
  },
  info: (title: string, message: string, duration?: number) => {
    if (typeof window !== 'undefined' && (window as any).showNotification) {
      (window as any).showNotification('info', title, message, duration)
    }
  }
}
