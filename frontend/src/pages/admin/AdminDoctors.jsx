import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiCheck, FiX, FiTrash2, FiSlash, FiMoreVertical } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/tables/DataTable';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/modals/Modal';
import { ApprovalBadge } from '../../components/ui/StatusBadge';
import { adminService } from '../../services/api';
import { DOCTOR_APPROVAL } from '../../constants';
import { formatCurrency } from '../../utils';

export default function AdminDoctors() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null); // { doctor, action }

  const { data, isLoading } = useQuery({
    queryKey: ['admin-doctors'],
    queryFn: () => adminService.doctors({ page: 1, size: 1000 }),
  });

  const approvalMut = useMutation({
    mutationFn: ({ id, status }) => adminService.setDoctorApproval(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-doctors'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('Doctor status updated');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminService.deleteDoctor(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-doctors'] });
      toast.success('Doctor deleted');
      setConfirm(null);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'Doctor',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar src={row.original.profilePicture} name={row.original.name} size={40} />
            <div>
              <p className="font-semibold text-slate-800 dark:text-white">{row.original.name}</p>
              <p className="text-xs text-slate-400">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      { accessorKey: 'qualification', header: 'Qualification' },
      { accessorKey: 'experience', header: 'Exp', cell: ({ getValue }) => `${getValue()} yrs` },
      { accessorKey: 'consultationCharges', header: 'Fee', cell: ({ getValue }) => formatCurrency(getValue()) },
      { accessorKey: 'rating', header: 'Rating', cell: ({ getValue }) => `★ ${getValue()}` },
      { accessorKey: 'approvalStatus', header: 'Status', cell: ({ getValue }) => <ApprovalBadge status={getValue()} /> },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const d = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {d.approvalStatus !== DOCTOR_APPROVAL.APPROVED && (
                <button title="Approve" onClick={() => approvalMut.mutate({ id: d.id, status: DOCTOR_APPROVAL.APPROVED })} className="rounded-lg p-2 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"><FiCheck size={16} /></button>
              )}
              {d.approvalStatus === DOCTOR_APPROVAL.PENDING && (
                <button title="Reject" onClick={() => approvalMut.mutate({ id: d.id, status: DOCTOR_APPROVAL.REJECTED })} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><FiX size={16} /></button>
              )}
              {d.approvalStatus === DOCTOR_APPROVAL.APPROVED && (
                <button title="Suspend" onClick={() => approvalMut.mutate({ id: d.id, status: DOCTOR_APPROVAL.SUSPENDED })} className="rounded-lg p-2 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"><FiSlash size={16} /></button>
              )}
              <button title="Delete" onClick={() => setConfirm({ doctor: d })} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><FiTrash2 size={16} /></button>
            </div>
          );
        },
      },
    ],
    [approvalMut],
  );

  return (
    <div>
      <PageHeader title="Doctor Management" subtitle="Approve, suspend, or remove doctors from the platform." />
      <DataTable columns={columns} data={data?.content || []} loading={isLoading} searchPlaceholder="Search doctors…" exportName="doctors" />

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Delete doctor?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(confirm.doctor.id)}>Delete</Button>
          </div>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
          This will permanently remove <span className="font-semibold">{confirm?.doctor?.name}</span> and cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
