import { redirect } from 'next/navigation';

export default function OldToolAdminRedirect() {
    redirect('/dashboard/admin/tools');
}
