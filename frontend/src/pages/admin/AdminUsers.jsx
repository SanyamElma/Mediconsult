import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { FiSlash, FiCheck, FiTrash2 } from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/tables/DataTable';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Modal from '../../components/modals/Modal';
import Badge from '../../components/ui/Badge';
import { adminService } from '../../services/api';
import { formatDate } from '../../utils';

export default function AdminUsers() {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState(null);

  const { data, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminService.users({ page: 1, size: 1000 }) });

  const blockMut = useMutation({
    mutationFn: ({ id, blocked }) => adminService.setUserBlocked(id, blocked),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('User updated');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => adminService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User deleted');
      setConfirm(null);
    },
  });

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        header: 'User',
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
      { accessorKey: 'phone', header: 'Phone' },
      { accessorKey: 'city', header: 'City' },
      { accessorKey: 'createdAt', header: 'Joined', cell: ({ getValue }) => formatDate(getValue()) },
      {
        accessorKey: 'blocked',
        header: 'Status',
        cell: ({ getValue }) =>
          getValue() ? <Badge className="bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300" dot>Blocked</Badge> : <Badge className="bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300" dot>Active</Badge>,
      },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => {
          const u = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <button
                title={u.blocked ? 'Unblock' : 'Block'}
                onClick={() => blockMut.mutate({ id: u.id, blocked: !u.blocked })}
                className={`rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10 ${u.blocked ? 'text-emerald-500' : 'text-amber-500'}`}
              >
                {u.blocked ? <FiCheck size={16} /> : <FiSlash size={16} />}
              </button>
              <button title="Delete" onClick={() => setConfirm(u)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"><FiTrash2 size={16} /></button>
            </div>
          );
        },
      },
    ],
    [blockMut],
  );

  return (
    <div>
      <PageHeader title="User Management" subtitle="View, block or remove patient accounts." />
      <DataTable columns={columns} data={data?.content || []} loading={isLoading} searchPlaceholder="Search users…" exportName="users" />

      <Modal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        title="Delete user?"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setConfirm(null)}>Cancel</Button>
            <Button variant="danger" loading={deleteMut.isPending} onClick={() => deleteMut.mutate(confirm.id)}>Delete</Button>
          </div>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
          Permanently delete <span className="font-semibold">{confirm?.name}</span>? This cannot be undone.
        </p>
      </Modal>
    </div>
  );
}
