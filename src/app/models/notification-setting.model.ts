export interface NotificationSetting {
  user_id: string;
  enabled: boolean;
  notification_times: string[]; // e.g. ["09:00", "13:00"]
}
