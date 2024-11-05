export enum NotificationPriority {
  HIGH = "HIGH",
  LOW = "LOW",
}
export interface INotification {
  notification_id: string;
  title: string;
  description: string;
  priority: NotificationPriority;
  create_time: Date;

  merchant_id?: string;
  customer_id?: string;
  admin_id?: string;
  //transaction_id?: string;
  //issue_id?: string;
}
