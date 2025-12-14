import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { confirmation } = await req.json();

    // Validate confirmation
    if (confirmation !== "DELETE") {
      return NextResponse.json({ 
        error: "Invalid confirmation. Please type 'DELETE' to confirm account deletion." 
      }, { status: 400 });
    }

    const userId = session.user.id;

    // Delete all user-related data in the correct order (respecting foreign key constraints)
    // Using individual operations instead of transaction to avoid timeout issues
    
    try {
      // 1. Delete test attempts
      await prisma.testAttempt.deleteMany({
        where: { userId }
      });

      // 2. Delete ad watches
      await prisma.adWatch.deleteMany({
        where: { userId }
      });

      // 3. Delete push subscriptions
      await prisma.pushSubscription.deleteMany({
        where: { userId }
      });

      // 4. Delete notifications
      await prisma.notification.deleteMany({
        where: { userId }
      });

      // 5. Delete notification settings
      await prisma.notificationSettings.deleteMany({
        where: { userId }
      });

      // 6. Delete wallet ledger entries
      await prisma.walletLedger.deleteMany({
        where: { wallet: { userId } }
      });

      // 7. Delete wallet
      await prisma.wallet.deleteMany({
        where: { userId }
      });

      // 8. Delete practice attempts
      await prisma.practiceAttempt.deleteMany({
        where: { userId }
      });

      // 9. Delete competition entries
      await prisma.competitionEntry.deleteMany({
        where: { userId }
      });

      // 10. Delete grade competition entries
      await prisma.gradeCompetitionEntry.deleteMany({
        where: { userId }
      });

      // 11. Delete group chat messages
      await prisma.groupChatMessage.deleteMany({
        where: { user_id: userId }
      });

      // 12. Delete group chat memberships
      await prisma.groupChatMember.deleteMany({
        where: { user_id: userId }
      });

      // 13. Delete direct messages sent
      await prisma.directMessage.deleteMany({
        where: { senderId: userId }
      });

      // 14. Delete direct messages received
      await prisma.directMessage.deleteMany({
        where: { receiverId: userId }
      });

      // 15. Delete direct conversations
      await prisma.directConversation.deleteMany({
        where: {
          OR: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      // 16. Finally, delete the user
      await prisma.user.delete({
        where: { id: userId }
      });
    } catch (deleteError) {
      console.error("Error during deletion:", deleteError);
      throw deleteError;
    }

    // Log the account deletion for audit purposes
    console.log(`Account deleted for user: ${session.user.email} (ID: ${userId})`);

    return NextResponse.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json(
      { error: "Failed to delete account. Please try again." },
      { status: 500 }
    );
  }
} 