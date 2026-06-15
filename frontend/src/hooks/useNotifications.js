import { useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services/api';
import { useAuth } from '../context/AuthContext';

/** Polls notifications for the current user/role and exposes an unread count. */
export function useNotifications() {
  const { user, role } = useAuth();
  const qc = useQueryClient();

  const { data = [] } = useQuery({
    queryKey: ['notifications', role, user?.id],
    queryFn: () => notificationService.list(role, user?.id),
    enabled: !!user,
    refetchInterval: 15000,
  });

  const unread = data.filter((n) => !n.read).length;

  const markRead = async () => {
    await notificationService.markRead(role, user?.id);
    qc.invalidateQueries({ queryKey: ['notifications'] });
  };

  return { notifications: data, unread, markRead };
}
