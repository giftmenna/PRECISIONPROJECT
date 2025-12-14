import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { prisma } from "@/lib/prisma";
import { NotificationService } from "@/lib/notification-service";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("API GET - Session:", session);
    console.log("API GET - User role:", session?.user ? (session.user as any).role : "No user");
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      console.log("API GET - Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');
    
    const where: any = {};
    if (source) {
      where.source = source;
    }

    console.log('Fetching questions with filter:', where);
    
    // Test database connection first
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('Database connection successful');
    } catch (dbError) {
      console.error('Database connection failed:', dbError);
      return NextResponse.json(
        { error: "Database connection failed. Please check your database configuration." },
        { status: 503 }
      );
    }
    
    const questions = await prisma.mathQuestion.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Map the questions to include backward compatible field names
    const questionsWithBackwardCompatibility = questions.map(question => {
      // Derive the correct key (A/B/C/D) when choices are stored as an object
      let correctKey: string | null = null;
      try {
        // Prisma returns Json fields as objects/arrays already
        const choicesValue = question.choices as any;
        if (choicesValue && typeof choicesValue === 'object' && !Array.isArray(choicesValue)) {
          const entries = Object.entries(choicesValue as Record<string, any>);
          for (const [key, value] of entries) {
            if (String(value) === String(question.correctChoice)) {
              correctKey = key;
              break;
            }
          }
        }
      } catch {
        // ignore mapping errors; fallback below
      }

      return {
        ...question,
        // The 'correct' field is for backward compatibility with older components
        correct: correctKey || question.correctChoice,
        topicKey: question.topic,
      };
    });

    return NextResponse.json({ questions: questionsWithBackwardCompatibility });
  } catch (error) {
    console.error("Error fetching questions:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Failed to fetch questions",
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    console.log("API POST - Session:", session);
    console.log("API POST - User role:", session?.user ? (session.user as any).role : "No user");
    
    if (!session || (session.user as any).role?.toLowerCase() !== "admin") {
      console.log("API POST - Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let formData;
    const contentType = req.headers.get('content-type');
    
    if (contentType?.includes('multipart/form-data')) {
      const formDataRaw = await req.formData();
      formData = Object.fromEntries(formDataRaw.entries());
      
      // Parse stringified JSON fields
      if (formData.choices && typeof formData.choices === 'string') {
        try {
          formData.choices = JSON.parse(formData.choices);
        } catch (e) {
          console.error('Error parsing choices:', e);
          return NextResponse.json(
            { error: "Invalid choices format" },
            { status: 400 }
          );
        }
      }
      
     // Convert string booleans to actual booleans
if (formData.notifyUsers) {
  formData.notifyUsers = formData.notifyUsers === 'true' ? 'true' : 'false';
}
if (formData.isActive) {
  formData.isActive = formData.isActive === 'true' ? 'true' : 'false';
}
    } else {
      formData = await req.json();
    }

    const { 
      prompt, 
      choices, 
      correct, 
      topic, 
      difficulty, 
      explanation = '', 
      imageUrl, 
      imageData,
      questionType = 'multiple_choice',
      timeLimit = 60,
      gems = 0,
      requiredGrade,
      requiredGems = 0,
      notifyUsers = false,
      isActive = false,
      isTestQuestion = false,
      testCompetitionType = null
    } = formData;

    if (!prompt || !topic || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, topic, and difficulty are required" },
        { status: 400 }
      );
    }

    // Validate based on question type
    if (questionType === 'multiple_choice') {
      if (!choices || correct === undefined || correct === '') {
        return NextResponse.json(
          { error: "Multiple choice questions require choices and a correct answer" },
          { status: 400 }
        );
      }

      // Convert choices to object if it's an array
      let choicesObj = choices;
      if (Array.isArray(choices)) {
        choicesObj = choices.reduce((acc, choice, index) => {
          acc[String.fromCharCode(65 + index)] = choice; // A, B, C, D...
          return acc;
        }, {} as Record<string, string>);
      }

      // Check if the correct answer is a key in the choices object
      const validCorrect = Object.prototype.hasOwnProperty.call(choicesObj, correct);
      
      // If not, check if it's a value in the choices object
      let correctAnswer = correct; // Create a mutable copy
      if (!validCorrect && Object.values(choicesObj).includes(correct)) {
        // Find the key for the matching value
        const correctKey = Object.entries(choicesObj).find(
          ([_, value]) => value === correct
        )?.[0];
        
        if (correctKey) {
          correctAnswer = correctKey; // Update the mutable copy
        } else {
          return NextResponse.json(
            { error: "Correct answer must match one of the provided choices" },
            { status: 400 }
          );
        }
      } else if (!validCorrect) {
        return NextResponse.json(
          { error: "Correct answer must match one of the provided choices" },
          { status: 400 }
        );
      }
    } else if (questionType === 'manual_input') {
      if (!correct) {
        return NextResponse.json(
          { error: "Manual input questions require a correct answer" },
          { status: 400 }
        );
      }
    }

    // Determine the source based on the request
    const source = formData.source || (formData.isForCompetition ? 'competition' : 'DAILY_LESSON');
    
    // Create the question data object with proper field mappings
    const questionData: any = {
      // Mapped fields (as per @map in schema)
      prompt,
      topic, // This maps to topicKey in the database
      difficulty,
      explanation: explanation || '',
      timeLimit: parseInt(timeLimit as string) || 60,
      // choices and correctChoice will be set below considering the input format
      
      // Required fields with defaults
      gems: Number.isFinite(gems) ? Number(gems) : 0,
      grade: null,
      source: source, // Add source field
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Other fields
      position: 0,
      competitionId: null
    };
    
    // Only include imageUrl if provided
    if (imageUrl) {
      questionData.imageUrl = imageUrl;
    }

    // Add test question metadata if it's a test question
    if (isTestQuestion && testCompetitionType) {
      questionData.explanation = `Test question for ${testCompetitionType.toLowerCase()} competition. ${explanation || ''}`;
    }

    // Add image data if provided
    if (imageData) {
      questionData.imageUrl = imageData;
    } else if (imageUrl) {
      questionData.imageUrl = imageUrl;
    }

    // Add type-specific data
    if (questionType === 'multiple_choice') {
      if (Array.isArray(choices)) {
        // Array choices: store as array and 'correct' is the value
        questionData.choices = choices;
        questionData.correctChoice = correct;
      } else if (typeof choices === 'object' && choices !== null) {
        // Object choices: store as object and 'correct' is the key → map to value
        questionData.choices = choices;
        const valueForKey = (choices as Record<string, any>)[String(correct)];
        questionData.correctChoice = valueForKey !== undefined ? String(valueForKey) : '';
      } else {
        return NextResponse.json(
          { error: "Invalid choices format" },
          { status: 400 }
        );
      }
    } else if (questionType === 'manual_input') {
      questionData.correctChoice = correct;
      questionData.choices = {}; // Empty for manual input
    }

    const question = await prisma.mathQuestion.create({
      data: questionData
    });

    // Send notification to users about new questions if requested
    if (notifyUsers === true || notifyUsers === 'true') {
      try {
        // Get all users with notification settings enabled
        const usersToNotify = await prisma.user.findMany({
          where: {
            role: "user",
            notificationSettings: {
              newQuestionsEnabled: true,
              pushEnabled: true
            }
          },
          select: { id: true }
        });

        if (usersToNotify.length > 0) {
          // Create notifications for all eligible users
          const notifications = usersToNotify.map(u => ({
            userId: u.id,
            type: 'NEW_QUESTION' as any,
            title: 'New Question Available! 🎯',
            message: `A new ${question.difficulty} question in ${question.topic.replace(/_/g, ' ')} is now available for practice!`,
            data: {
              questionId: question.id,
              topic: question.topic,
              difficulty: question.difficulty,
              source: questionData.source || 'PRACTICE'
            } as any,
            isRead: false
          }));

          // Batch create notifications
          await prisma.notification.createMany({
            data: notifications
          });

          console.log(`Sent notifications to ${notifications.length} users for question ${question.id}`);
        }
      } catch (error) {
        console.error('Failed to send notification:', error);
      }
    }

    return NextResponse.json({ 
      message: "Question created successfully",
      question 
    });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
} 