
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const groupId = context.params.id;

    // 1. Check for admin privileges
    if (!session?.user?.email || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('avatar') as File;

    if (!file) {
      return NextResponse.json({ error: "No image file provided" }, { status: 400 });
    }

    // 2. Validate file type and size
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 });
    }
    if (file.size > 2 * 1024 * 1024) { // 2MB limit for avatars
      return NextResponse.json({ error: "File size must be less than 2MB" }, { status: 400 });
    }

    // 3. Convert image to base64 data URL
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // 4. Update the GroupChat record in the database
    const updatedGroup = await prisma.groupChat.update({
      where: { id: groupId },
      data: {
        avatar: dataUrl,
      },
    });

    return NextResponse.json({ success: true, group: updatedGroup });

  } catch (error) {
    console.error("Error uploading group avatar:", error);
    return NextResponse.json(
      { error: "Failed to upload avatar" },
      { status: 500 }
    );
  }
}
