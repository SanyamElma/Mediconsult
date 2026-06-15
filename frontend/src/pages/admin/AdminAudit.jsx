import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  FiUserPlus, FiCheckCircle, FiXCircle, FiTrash2, FiSlash, FiUserX, FiCalendar, FiFileText,
} from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/tables/DataTable';
import Badge from '../../components/ui/Badge';
import { adminService } from '../../services/api';
import { formatDateTime } from '../../utils';
import { AUDIT_ACTIONS } from '../../constants';

const ICONS = {
  [AUDIT_ACTIONS.DOCTOR_CREATED]: { icon: FiUserPlus, class: 'text-brand-500' },
  [AUDIT_ACTIONS.DOCTOR_APPROVED]: { icon: FiCheckCircle, class: 'text-emerald-500' },
  [AUDIT_ACTIONS.DOCTOR_REJECTED]: { icon: FiXCircle, class: 'text-rose-500' },
  [AUDIT_ACTIONS.DOCTOR_DELETED]: { icon: FiTrash2, class: 'text-rose-500' },
  [AUDIT_ACTIONS.DOCTOR_SUSPENDED]: { icon: FiSlash, class: 'text-amber-500' },
  [AUDIT_ACTIONS.USER_DELETED]: { icon: FiUserX, class: 'text-rose-500' },
  [AUDIT_ACTIONS.USER_BLOCKED]: { icon: FiSlash, class: 'text-amber-500' },
  [AUDIT_ACTIONS.APPOINTMENT_CANCELLED]: { icon: FiCalendar, class: 'text-slate-400' },
  [AUDIT_ACTIONS.APPOINTMENT_BOOKED]: { icon: FiCalendar, class: 'text-brand-500' },
};

export default function AdminAudit() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-audit'], queryFn: () => adminService.auditLogs({ page: 1, size: 1000 }) });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ getValue }) => {
          const meta = ICONS[getValue()] || { icon: FiFileText, class: 'text-slate-400' };
          return (
            <div className="flex items-center gap-2">
              <meta.icon className={meta.class} size={18} />
              <span className="font-semibold">{getValue().replace(/_/g, ' ')}</span>
            </div>
          );
        },
      },
      { accessorKey: 'target', header: 'Target' },
      { accessorKey: 'actor', header: 'Performed By' },
      { accessorKey: 'timestamp', header: 'When', cell: ({ getValue }) => formatDateTime(getValue()) },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="A complete trail of administrative actions." />
      <DataTable columns={columns} data={data?.content || []} loading={isLoading} searchPlaceholder="Search audit logs…" exportName="audit-logs" pageSize={12} />
    </div>
  );
}
