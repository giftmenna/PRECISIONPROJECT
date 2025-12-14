import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const admin = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, role: true, name: true, email: true }
		});

		if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'admin')) {
			return NextResponse.json({ error: "Admin access required" }, { status: 403 });
		}

		const groups = await prisma.groupChat.findMany({
			where: { 
				OR: [
					{ isActive: true },
					{ isActive: true }
				]
			},
			include: {
				group_chat_members: {
					include: {
						users: {
							select: { id: true, name: true, email: true, avatar: true }
						}
					}
				},
				group_chat_messages: {
					include: {
						users: {
							select: { id: true, name: true, email: true }
						}
					},
					orderBy: { created_at: 'desc' },
					take: 1
				}
			},
			orderBy: { created_at: 'desc' }
		});

		const formattedGroups = groups.map(group => {
			const members = group.group_chat_members.map(member => ({
				id: (member as any).users?.id,
				name: (member as any).users?.name,
				email: (member as any).users?.email,
				avatar: (member as any).users?.avatar,
				is_banned: (member as any).is_banned,
				banned_at: (member as any).banned_at,
				ban_reason: (member as any).ban_reason
			}));

			return {
				id: group.id,
				name: group.name,
				description: group.description,
				members,
				memberCount: members.length,
				lastMessage: (group as any).group_chat_messages && (group as any).group_chat_messages[0] ? {
					content: (group as any).group_chat_messages[0].content,
					createdAt: ((group as any).group_chat_messages[0] as any).created_at?.toISOString() || new Date().toISOString(),
					user: {
						name: ((group as any).group_chat_messages[0] as any).users?.name || 'Unknown',
						email: ((group as any).group_chat_messages[0] as any).users?.email || 'unknown@example.com'
					}
				} : null,
				createdAt: (group as any).created_at?.toISOString() || new Date().toISOString()
			};
		});

		return NextResponse.json({ groups: formattedGroups });
	} catch (error) {
		console.error("Admin fetch groups error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const admin = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, role: true, name: true, email: true }
		});

		if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'admin')) {
			return NextResponse.json({ error: "Admin access required" }, { status: 403 });
		}

		const { name } = await req.json();
		if (!name || typeof name !== 'string' || name.trim().length === 0) {
			return NextResponse.json({ error: "Group name is required" }, { status: 400 });
		}

		const newGroup = await prisma.groupChat.create({
			data: {
				name: name.trim(),
				description: `Group created by admin ${admin.name || admin.email}`,
				isActive: true,
			},
			include: {
				group_chat_members: {
					include: {
						users: {
							select: { id: true, name: true, email: true, avatar: true }
						}
					}
				}
			}
		});

		return NextResponse.json(newGroup);
	} catch (error) {
		console.error("Admin create group error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

export async function DELETE(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user?.email) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const admin = await prisma.user.findUnique({
			where: { email: session.user.email },
			select: { id: true, role: true, name: true, email: true }
		});

		if (!admin || (admin.role !== 'ADMIN' && admin.role !== 'admin')) {
			return NextResponse.json({ error: "Admin access required" }, { status: 403 });
		}

		const { searchParams } = new URL(req.url);
		const groupId = searchParams.get('groupId');
		
		if (!groupId) {
			return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
		}

		// Check if group exists
		const group = await prisma.groupChat.findUnique({
			where: { id: groupId },
			include: {
				group_chat_members: true,
				group_chat_messages: true
			}
		});

		if (!group) {
			return NextResponse.json({ error: "Group not found" }, { status: 404 });
		}

		// Soft delete the group by setting isActive to false
		await prisma.groupChat.update({
			where: { id: groupId },
			data: { 
				isActive: false,
			}
		});

		return NextResponse.json({ 
			success: true, 
			message: `Group "${group.name}" has been deleted`,
			deletedGroup: {
				id: group.id,
				name: group.name,
				memberCount: group.group_chat_members.length,
				messageCount: group.group_chat_messages.length
			}
		});
	} catch (error) {
		console.error("Admin delete group error:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
} 