import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/tables/DataTable';
import Avatar from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { adminService } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils';

export default function AdminAppointments() {
  const { data, isLoading } = useQuery({ queryKey: ['admin-appointments'], queryFn: () => adminService.appointments({ page: 1, size: 1000 }) });

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', cell: ({ getValue }) => <span className="text-slate-400">#{getValue()}</span> },
      {
        accessorKey: 'userName',
        header: 'Patient',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar src={row.original.userAvatar} name={row.original.userName} size={32} />
            <span className="font-medium">{row.original.userName}</span>
          </div>
        ),
      },
      {
        accessorKey: 'doctorName',
        header: 'Doctor',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Avatar src={row.original.doctorAvatar} name={row.original.doctorName} size={32} />
            <span className="font-medium">{row.original.doctorName}</span>
          </div>
        ),
      },
      { accessorKey: 'specialization', header: 'Speciality' },
      { accessorKey: 'date', header: 'Date', cell: ({ getValue }) => formatDate(getValue()) },
      { accessorKey: 'slot', header: 'Slot' },
      { accessorKey: 'charges', header: 'Fee', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'status', header: 'Status', cell: ({ getValue }) => <StatusBadge status={getValue()} /> },
    ],
    [],
  );

  return (
    <div>
      <PageHeader title="All Appointments" subtitle={`${data?.total ?? 0} appointments across the platform.`} />
      <DataTable columns={columns} data={data?.content || []} loading={isLoading} searchPlaceholder="Search by patient, doctor, status…" exportName="appointments" pageSize={12} />
    </div>
  );
}
