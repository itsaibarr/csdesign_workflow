import { auth } from '@/lib/auth';
import { headers } from "next/headers";
import { redirect } from 'next/navigation';
import { getTeamData } from '@/app/actions/teams';
import TeamSpaceClient from './TeamSpaceClient';

export default async function TeamSpacePage({ params }: { params: Promise<{ teamId: string }> }) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect('/login');
    }

    const { teamId } = await params;
    const result = await getTeamData(teamId);

    if (result.error || !result.team) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <h2 className="text-2xl font-bold">Team Not Found</h2>
                <p className="text-muted-foreground">
                    {result.error || 'The team you are looking for does not exist.'}
                </p>
            </div>
        );
    }

    return (
        <TeamSpaceClient
            team={result.team}
            currentUserId={session.user.id}
            currentUserRole={session.user.role}
        />
    );
}
