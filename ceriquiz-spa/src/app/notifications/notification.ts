export default interface Notification {
  id?: string;
  dismissible: boolean;
  type: 'info' | 'warning' | 'success' | 'danger';
  message: string;
}
