import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = session.user.email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: { wallet: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if user has paid entry fee
    const entry = await prisma.competitionEntry.findUnique({
      where: {
        competitionId_userId: {
          competitionId: params.id,
          userId: user.id
        }
      }
    });

    if (!entry || entry.status !== 'CONFIRMED') {
      return NextResponse.json({ error: "Entry fee not paid" }, { status: 402 });
    }

    // Fetch competition with questions
    const competition = await prisma.competition.findUnique({
      where: { id: params.id },
      include: {
        drops: {
          include: {
            questions: {
              include: {
                question: true
              }
            }
          }
        }
      }
    });

    if (!competition) {
      return NextResponse.json({ error: "Competition not found" }, { status: 404 });
    }

    if ((competition as any).status !== 'ACTIVE') {
      return NextResponse.json({ error: "Competition is not active" }, { status: 400 });
    }

    // Transform questions to match expected format
    const questions = competition.drops.flatMap(drop => 
      drop.questions.map(dq => {
        const q = dq.question;
        let choices: string[];
        
        try {
          if (typeof q.choices === 'string') {
            choices = JSON.parse(q.choices);
          } else if (Array.isArray(q.choices)) {
            choices = (q.choices as any[]).filter(choice => choice && typeof choice === 'string') as string[];
          } else if (typeof q.choices === 'object' && q.choices !== null) {
            choices = Object.values(q.choices as any).filter(choice => choice && typeof choice === 'string') as string[];
          } else {
            choices = [];
          }
        } catch (error) {
          console.error('Error parsing choices for question:', q.id, error);
          choices = [];
        }

        return {
          id: q.id,
          prompt: q.prompt,
          choices: choices,
          correct: q.correct,
          topic: q.topic,
          difficulty: q.difficulty || 'Medium',
          explanation: undefined
        };
      })
    );

    return NextResponse.json({
      competition: {
        ...competition,
        questions
      }
    });

  } catch (error) {
    console.error("Error fetching live competition:", error);
    return NextResponse.json(
      { error: "Failed to fetch competition" },
      { status: 500 }
    );
  }
} 