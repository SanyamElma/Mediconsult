import Badge from './Badge';
import { STATUS_META, APPROVAL_META } from '../../constants';

export function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, class: '' };
  return <Badge className={meta.class} dot>{meta.label}</Badge>;
}

export function ApprovalBadge({ status }) {
  const meta = APPROVAL_META[status] || { label: status, class: '' };
  return <Badge className={meta.class} dot>{meta.label}</Badge>;
}
