export default interface INotification {
  id?: number;
  type: 'info' | 'success' | 'danger';
  message: string;
}
