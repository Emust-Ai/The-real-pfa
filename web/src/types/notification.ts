export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}
