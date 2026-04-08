import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'message' | 'system' | 'admin_response' | 'user_message';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  fromUser?: {
    name: string;
    email: string;
    type?: string;
    role?: string;
  };
  toUser?: {
    name: string;
    email: string;
    role?: string;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Add new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Auto-remove system notifications after 5 seconds
    if (notification.type === 'system') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }

    // Show browser notification if permission granted
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/favicon.ico',
        tag: newNotification.id,
      });
    }
  };

  // Mark notification as read
  const markAsRead = async (id: string) => {
    try {
      // Sync with backend
      await api.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark as read on backend:', error);
    }
    
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      // Sync with backend
      await api.put('/notifications/mark-all-read');
    } catch (error) {
      console.error('Failed to mark all as read on backend:', error);
    }
    
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  // Remove notification
  const removeNotification = async (id: string) => {
    try {
      // Sync with backend
      await api.delete(`/notifications/${id}`);
    } catch (error) {
      console.error('Failed to delete notification on backend:', error);
    }
    
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  // Clear all notifications
  const clearAll = async () => {
    try {
      // Sync with backend
      await api.delete('/notifications/clear-all');
    } catch (error) {
      console.error('Failed to clear notifications on backend:', error);
    }
    
    setNotifications([]);
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Listen for real-time notifications (WebSocket or polling would go here)
  useEffect(() => {
    // Only fetch notifications if user is authenticated
    if (!user) {
      setNotifications([]); // Clear notifications when user logs out
      return;
    }

    const fetchNotifications = async () => {
      try {
        console.log('Fetching notifications for user:', user?._id);
        const response = await api.get('/notifications');
        console.log('Notifications response:', response.data);
        
        const backendNotifications = response.data.map((notif: any) => ({
          id: notif._id,
          type: notif.type,
          title: notif.title,
          message: notif.message,
          timestamp: new Date(notif.createdAt),
          read: notif.read,
          actionUrl: notif.actionUrl,
          fromUser: notif.fromUser,
        }));
        
        console.log('Processed notifications:', backendNotifications);
        
        // Replace notifications with backend data (sync state)
        setNotifications(backendNotifications);
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
      }
    };

    // Initial fetch
    fetchNotifications();
    
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [user]); // Dependency on user to handle login/logout

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
        isNotificationsOpen,
        setIsNotificationsOpen,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
