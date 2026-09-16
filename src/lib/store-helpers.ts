export { uid, computeFees, txnId, orderNumber, money, fmtDate, fmtTime, fmtDateTime, relTime } from '@/lib/helpers';

export const avatarFallback = (name: string) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'User')}&backgroundColor=4f46e5,7c3aed,ea580c,0f766e`;
