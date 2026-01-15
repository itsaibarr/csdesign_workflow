"use server";

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { headers } from "next/headers";
import { TeamStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import QRCode from 'qrcode';

async function getSession() {
    return await auth.api.getSession({
        headers: await headers()
    });
}

// Generate random 6-character team code
function generateTeamCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing chars like 0/O, 1/I
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export type TeamInput = {
    name: string;
    projectCase?: string;
    goal?: string;
};

export async function createTeam(data: TeamInput) {
    const session = await getSession();

    if (!session || session.user.role !== 'STUDENT') {
        return { error: "Only students can create teams." };
    }

    // Check if user is already in a team
    const existingMembership = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { teamId: true }
    });

    if (existingMembership?.teamId) {
        return { error: "You are already in a team. Leave your current team first." };
    }

    try {
        // Generate unique team code
        let teamCode = generateTeamCode();
        let isUnique = false;

        while (!isUnique) {
            const existing = await prisma.team.findUnique({ where: { teamCode } });
            if (!existing) {
                isUnique = true;
            } else {
                teamCode = generateTeamCode();
            }
        }

        // Generate QR code (contains team code for joining)
        const qrCodeData = await QRCode.toDataURL(teamCode, {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            }
        });

        // Create team
        const team = await prisma.team.create({
            data: {
                name: data.name,
                teamCode,
                qrCodeData,
                projectCase: data.projectCase,
                goal: data.goal,
                createdBy: session.user.id,
                status: TeamStatus.FORMING,
                members: {
                    connect: { id: session.user.id }
                }
            },
            include: {
                members: true,
                creator: true
            }
        });

        revalidatePath('/dashboard/team');
        return { success: true, team };
    } catch (e) {
        console.error("Create team error:", e);
        return { error: "Failed to create team." };
    }
}

export async function joinTeamByCode(teamCode: string) {
    const session = await getSession();

    if (!session || session.user.role !== 'STUDENT') {
        return { error: "Only students can join teams." };
    }

    // Check if user is already in a team
    const existingMembership = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { teamId: true }
    });

    if (existingMembership?.teamId) {
        return { error: "You are already in a team." };
    }

    try {
        const team = await prisma.team.findUnique({
            where: { teamCode: teamCode.toUpperCase() },
            include: { members: true }
        });

        if (!team) {
            return { error: "Team not found. Check the code and try again." };
        }

        if (team.status === TeamStatus.ARCHIVED) {
            return { error: "This team has been archived and is no longer accepting members." };
        }

        if (team.members.length >= team.maxMembers) {
            return { error: "Team is full. Maximum members: " + team.maxMembers };
        }

        // Add user to team
        await prisma.team.update({
            where: { id: team.id },
            data: {
                members: {
                    connect: { id: session.user.id }
                }
            }
        });

        revalidatePath('/dashboard/team');
        return { success: true, teamId: team.id };
    } catch (e) {
        console.error("Join team error:", e);
        return { error: "Failed to join team." };
    }
}

export async function leaveTeam(teamId: string) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true }
        });

        if (!team) {
            return { error: "Team not found." };
        }

        const isMember = team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You are not a member of this team." };
        }

        // If only one member and it's the user, delete the team
        if (team.members.length === 1) {
            await prisma.team.delete({ where: { id: teamId } });
            revalidatePath('/dashboard/team');
            return { success: true, deleted: true };
        }

        // Otherwise just disconnect the user
        await prisma.team.update({
            where: { id: teamId },
            data: {
                members: {
                    disconnect: { id: session.user.id }
                }
            }
        });

        revalidatePath('/dashboard/team');
        return { success: true };
    } catch (e) {
        console.error("Leave team error:", e);
        return { error: "Failed to leave team." };
    }
}

export async function updateTeam(teamId: string, data: Partial<TeamInput>) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true }
        });

        if (!team) {
            return { error: "Team not found." };
        }

        const isMember = team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You must be a team member to update team details." };
        }

        await prisma.team.update({
            where: { id: teamId },
            data: {
                name: data.name,
                projectCase: data.projectCase,
                goal: data.goal
            }
        });

        revalidatePath('/dashboard/team');
        revalidatePath(`/dashboard/team/${teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Update team error:", e);
        return { error: "Failed to update team." };
    }
}

export async function getTeamData(teamId: string) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                members: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                        role: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true
                    }
                },
                mentor: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                artifacts: {
                    take: 10,
                    orderBy: { createdAt: 'desc' }
                },
                tasks: {
                    orderBy: [{ status: 'asc' }, { order: 'asc' }],
                    include: {
                        assignee: {
                            select: {
                                id: true,
                                name: true,
                                image: true
                            }
                        }
                    }
                },
                reviews: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        mentor: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        if (!team) {
            return { error: "Team not found." };
        }

        // Check access: must be member or mentor
        const isMember = team.members.some(m => m.id === session.user.id);
        const isMentor = team.mentorId === session.user.id;
        const isAdmin = session.user.role === 'ADMIN';

        if (!isMember && !isMentor && !isAdmin) {
            return { error: "Access denied." };
        }

        return { success: true, team };
    } catch (e) {
        console.error("Get team data error:", e);
        return { error: "Failed to load team data." };
    }
}

export async function getMyTeams() {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        if (session.user.role === 'STUDENT') {
            // Get teams where user is a member
            const teams = await prisma.team.findMany({
                where: {
                    members: {
                        some: { id: session.user.id }
                    }
                },
                include: {
                    members: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: {
                            tasks: true,
                            artifacts: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return { success: true, teams };
        } else if (session.user.role === 'MENTOR') {
            // Get teams where user is the mentor
            const teams = await prisma.team.findMany({
                where: {
                    mentorId: session.user.id
                },
                include: {
                    members: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: {
                            tasks: true,
                            artifacts: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return { success: true, teams };
        } else {
            // Admin: get all teams
            const teams = await prisma.team.findMany({
                include: {
                    members: {
                        select: {
                            id: true,
                            name: true,
                            image: true
                        }
                    },
                    _count: {
                        select: {
                            tasks: true,
                            artifacts: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            });
            return { success: true, teams };
        }
    } catch (e) {
        console.error("Get my teams error:", e);
        return { error: "Failed to load teams." };
    }
}

export async function assignMentor(teamId: string, mentorId: string) {
    const session = await getSession();

    if (!session || session.user.role !== 'ADMIN') {
        return { error: "Only admins can assign mentors." };
    }

    try {
        await prisma.team.update({
            where: { id: teamId },
            data: { mentorId }
        });

        revalidatePath('/dashboard/team');
        revalidatePath(`/dashboard/team/${teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Assign mentor error:", e);
        return { error: "Failed to assign mentor." };
    }
}

export async function submitProject(teamId: string) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized" };
    }

    try {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: { members: true }
        });

        if (!team) {
            return { error: "Team not found." };
        }

        const isMember = team.members.some(m => m.id === session.user.id);
        if (!isMember) {
            return { error: "You must be a team member to submit the project." };
        }

        if (team.status === TeamStatus.SUBMITTED || team.status === TeamStatus.APPROVED) {
            return { error: "Project has already been submitted." };
        }

        await prisma.team.update({
            where: { id: teamId },
            data: { status: TeamStatus.SUBMITTED }
        });

        revalidatePath('/dashboard/team');
        revalidatePath(`/dashboard/team/${teamId}`);
        return { success: true };
    } catch (e) {
        console.error("Submit project error:", e);
        return { error: "Failed to submit project." };
    }
}
