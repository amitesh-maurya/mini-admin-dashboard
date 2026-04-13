import { Badge } from '@/components/ui/badge';
import { Role } from '@/types';

export function RoleBadge({ role }: { role: Role }) {
  return (
    <Badge variant={role === 'admin' ? 'blue' : 'secondary'} className="capitalize text-xs">
      {role}
    </Badge>
  );
}
