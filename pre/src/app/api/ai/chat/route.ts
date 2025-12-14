import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';
import { prisma } from '@/lib/prisma';

// POST /api/ai/chat - Send message to AI assistant and get response
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { conversationId, message } = await request.json();

    if (!conversationId || !message) {
      return NextResponse.json({ error: 'Conversation ID and message are required' }, { status: 400 });
    }

    // Verify conversation belongs to user
    const conversation = await prisma.aIConversation.findFirst({
      where: {
        id: conversationId,
        user_id: user.id
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Save user message
    const userMessage = await prisma.aIMessage.create({
      data: {
        conversation_id: conversationId,
        role: 'user',
        content: message
      }
    });

    // Auto-title conversation if it has a default title
    try {
      const currentConversation = await prisma.aIConversation.findUnique({ where: { id: conversationId } });
      const defaultTitle = !currentConversation?.title || currentConversation.title.toLowerCase().startsWith('new');
      if (defaultTitle) {
        const raw = message.trim().replace(/\s+/g, ' ');
        const candidate = raw.length > 60 ? raw.slice(0, 57) + '...' : raw;
        const title = candidate || 'New Chat';
        await prisma.aIConversation.update({
          where: { id: conversationId },
          data: { title }
        });
      }
    } catch (e) {
      console.warn('Failed to auto-title conversation:', e);
    }

    // Generate AI response using LLM if available, otherwise fallback
    const aiText = await generateAIResponse(message, conversationId);

    // Save AI response
    const aiMessage = await prisma.aIMessage.create({
      data: {
        conversation_id: conversationId,
        role: 'assistant',
        content: aiText,
        metadata: {
          responseType: 'automated',
          timestamp: new Date().toISOString()
        }
      }
    });

    // Update conversation timestamp
    await prisma.aIConversation.update({
      where: { id: conversationId },
      data: { updated_at: new Date() }
    });

    return NextResponse.json({ 
      message: aiMessage,
      conversationId 
    });
  } catch (error) {
    console.error('Error in AI chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function callOpenAIChat(messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>): Promise<string | null> {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return null;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      console.error('OpenAI API error:', await response.text());
      return null;
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content?.trim();
    return content || null;
  } catch (err) {
    console.error('OpenAI call failed:', err);
    return null;
  }
}

async function generateAIResponse(userMessage: string, conversationId: string): Promise<string> {
  // Get conversation history for context (including the just-saved user message)
  const messages = await prisma.aIMessage.findMany({
    where: { conversation_id: conversationId },
    orderBy: { created_at: 'asc' },
    take: 20
  });

  // Prepare system prompt to support math, app help, and general Q&A
  const systemPrompt = `You are Precision Academic World's AI Assistant.
- Provide clear, concise, and correct answers.
- For math, show step-by-step solutions with reasoning and final boxed answer when appropriate. Avoid hallucinating; verify results.
- For app support, give actionable, specific guidance for this product (Precision Academic World): sign-in, profile, lessons, competitions, practice, payments, notifications, leaderboard, group chat, AI assistant usage. Reference on-screen labels and common paths using plain text. Never invent features that don't exist.
- If you need more details, ask a brief clarifying question before solving.
- Use simple formatting (short lists, short steps). No heavy Markdown tables.
- If the question is out of scope or requires human support (billing issues, account deletion confirmations), explain limits and suggest contacting support.`;

  // Map DB messages into chat format
  const chatHistory = messages.map((m) => ({
    role: (m.role as 'user' | 'assistant'),
    content: m.content,
  }));

  // Attempt LLM first if key present
  const llmAnswer = await callOpenAIChat([
    { role: 'system', content: systemPrompt },
    ...chatHistory,
  ]);

  if (llmAnswer) return llmAnswer;

  // Fallback to rule-based responses if LLM unavailable
  return generateRuleBasedResponse(userMessage, messages);
}

function generateRuleBasedResponse(userMessage: string, messages: any[]): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // App support patterns
  if (
    lowerMessage.includes('how do i') ||
    lowerMessage.includes('help with app') ||
    lowerMessage.includes('use the app') ||
    lowerMessage.includes('can\'t log in') ||
    lowerMessage.includes('cannot log in') ||
    lowerMessage.includes('reset password') ||
    lowerMessage.includes('update profile') ||
    lowerMessage.includes('buy gems') ||
    lowerMessage.includes('notifications') ||
    lowerMessage.includes('group chat') ||
    lowerMessage.includes('competition') ||
    lowerMessage.includes('practice')
  ) {
    return generateAppHelp(userMessage);
  }

  // Math problem solving patterns
  if (lowerMessage.includes('solve') || lowerMessage.includes('calculate') || lowerMessage.includes('find')) {
    return generateMathSolution(userMessage, messages);
  }
  
  // Algebra patterns
  if (lowerMessage.includes('algebra') || lowerMessage.includes('equation') || lowerMessage.includes('variable')) {
    return generateAlgebraHelp(userMessage, messages);
  }
  
  // Geometry patterns
  if (lowerMessage.includes('geometry') || lowerMessage.includes('area') || lowerMessage.includes('perimeter') || 
      lowerMessage.includes('volume') || lowerMessage.includes('triangle') || lowerMessage.includes('circle')) {
    return generateGeometryHelp(userMessage, messages);
  }
  
  // Calculus patterns
  if (lowerMessage.includes('calculus') || lowerMessage.includes('derivative') || lowerMessage.includes('integral') ||
      lowerMessage.includes('limit') || lowerMessage.includes('differentiation')) {
    return generateCalculusHelp(userMessage, messages);
  }
  
  // Statistics patterns
  if (lowerMessage.includes('statistics') || lowerMessage.includes('mean') || lowerMessage.includes('median') ||
      lowerMessage.includes('probability') || lowerMessage.includes('standard deviation')) {
    return generateStatisticsHelp(userMessage, messages);
  }
  
  // General math help
  if (lowerMessage.includes('help') || lowerMessage.includes('math') || lowerMessage.includes('problem')) {
    return generateGeneralMathHelp(userMessage, messages);
  }
  
  // Greeting patterns
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI Assistant. I can help you with:
    
• Math (algebra, geometry, calculus, statistics, trigonometry)
• Using this app (login, profile, lessons, competitions, practice, notifications)
• General questions and study tips

Ask me anything or tell me what you're trying to do.`;
  }
  
  // Default response
  return `I'm here to help you with math, app questions, and more.

Try asking me:
• "Solve this: 3x + 7 = 22"
• "How do I start a daily lesson?"
• "Where can I view my competition results?"
• "How do I update my profile photo?"

What would you like to do?`;
}

function generateAppHelp(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('log in') || lower.includes("login") || lower.includes('sign in')) {
    return `To sign in:
- Go to the Login page from the navbar
- Enter your email and password, then select Sign In
- If you forgot your password, use "Forgot password" to reset it`;
  }
  if (lower.includes('reset password') || lower.includes('forgot')) {
    return `To reset your password:
- Open the Forgot Password page from the Login screen
- Enter your email and follow the instructions sent to your inbox`;
  }
  if (lower.includes('update profile') || lower.includes('profile')) {
    return `To update your profile:
- Open Profile from the navbar
- Edit your name, avatar, and details, then save changes`;
  }
  if (lower.includes('buy gems') || lower.includes('purchase') || lower.includes('gems')) {
    return `To buy gems:
- Select Buy Gems or open the gem purchase modal from the navbar
- Pick a package and complete the payment
- Gems will reflect in your wallet after a successful payment`;
  }
  if (lower.includes('competition')) {
    return `Competitions:
- Browse or enter a competition from Competitions
- During live competitions, answer within the time limit
- Results are available on the Dashboard or Competition page after submission`;
  }
  if (lower.includes('practice')) {
    return `Practice:
- Open Practice from the navbar
- Select a topic or start a test set
- Submit to see your results and explanations`;
  }
  if (lower.includes('notifications')) {
    return `Notifications:
- Click the bell icon to view notifications
- Manage topics in Notification Settings`;
  }
  if (lower.includes('group chat') || lower.includes('chat')) {
    return `Group Chat:
- Open Group Chat from the navbar
- Join the main room and follow community rules when chatting`;
  }

  return `Tell me what you're trying to do in the app (e.g., reset password, join a competition, start a lesson), and I'll guide you step-by-step.`;
}

function generateMathSolution(userMessage: string, messages: any[]): string {
  return `I'd be happy to help you solve that math problem! 

To provide the most accurate solution, could you please:

1. **Write out the complete problem** - Include all numbers, variables, and operations
2. **Show any work you've already done** - This helps me understand your approach
3. **Specify what you're trying to find** - What's the unknown variable or result?

For example:
• "Solve: 2x + 5 = 13"
• "Calculate the area of a rectangle with length 8 and width 6"
• "Find the derivative of f(x) = x² + 3x + 1"

Once you provide the complete problem, I'll give you a step-by-step solution with explanations! 📝✨`;
}

function generateAlgebraHelp(userMessage: string, messages: any[]): string {
  return `Great! Let's work on algebra together! 🧮

**Common Algebra Topics I can help with:**

📝 **Linear Equations**
• Solving for x: 2x + 5 = 13
• Systems of equations
• Inequalities

🔢 **Quadratic Equations**
• Factoring: x² + 5x + 6
• Quadratic formula
• Completing the square

📊 **Functions**
• Linear functions: f(x) = mx + b
• Quadratic functions: f(x) = ax² + bx + c
• Domain and range

**How to get help:**
1. Write out your equation clearly
2. Show any steps you've tried
3. Tell me what you're stuck on

**Example questions:**
• "How do I solve 3x - 7 = 14?"
• "Can you factor x² - 4x + 4?"
• "What's the domain of f(x) = √(x-2)?"

What specific algebra problem would you like to work on?`;
}

function generateGeometryHelp(userMessage: string, messages: any[]): string {
  return `Perfect! Geometry is all about shapes and spaces! 📐

**Geometry Topics I can help with:**

🔷 **2D Shapes**
• **Triangles**: Area = ½ × base × height
• **Rectangles**: Area = length × width
• **Circles**: Area = πr², Circumference = 2πr
• **Polygons**: Regular and irregular

🔶 **3D Shapes**
• **Cubes**: Volume = side³
• **Cylinders**: Volume = πr²h
• **Spheres**: Volume = 4/3πr³

📏 **Formulas & Theorems**
• Pythagorean theorem: a² + b² = c²
• Distance formula
• Midpoint formula

**How to get help:**
1. Tell me the shape you're working with
2. Provide the measurements you have
3. Say what you need to find

**Example questions:**
• "Find the area of a triangle with base 6 and height 8"
• "What's the volume of a cylinder with radius 3 and height 10?"
• "How do I use the Pythagorean theorem?"

What geometry problem can I help you solve?`;
}

function generateCalculusHelp(userMessage: string, messages: any[]): string {
  return `Excellent! Calculus is the study of change and motion! 📈

**Calculus Topics I can help with:**

📊 **Limits**
• Finding limits as x approaches a value
• One-sided limits
• Limits at infinity

🔢 **Derivatives**
• Power rule: d/dx(xⁿ) = nxⁿ⁻¹
• Product rule, quotient rule, chain rule
• Applications: velocity, acceleration, optimization

📐 **Integrals**
• Antiderivatives
• Definite integrals
• Area under curves

**Key Concepts:**
• **Derivative** = rate of change (slope of tangent)
• **Integral** = accumulation (area under curve)
• **Limit** = value function approaches

**How to get help:**
1. Write the function clearly
2. Specify what you need (derivative, integral, limit)
3. Show any work you've done

**Example questions:**
• "Find the derivative of f(x) = x³ + 2x² - 5x + 1"
• "Calculate ∫(2x + 3)dx"
• "What's the limit of (x²-4)/(x-2) as x→2?"

What calculus problem would you like to tackle?`;
}

function generateStatisticsHelp(userMessage: string, messages: any[]): string {
  return `Great choice! Statistics helps us understand data and make informed decisions! 📊

**Statistics Topics I can help with:**

📈 **Descriptive Statistics**
• **Mean**: Average of all values
• **Median**: Middle value when ordered
• **Mode**: Most frequent value
• **Range**: Difference between max and min

📊 **Measures of Spread**
• **Variance**: Average squared deviation from mean
• **Standard Deviation**: Square root of variance
• **Quartiles**: 25th, 50th, 75th percentiles

🎲 **Probability**
• Basic probability rules
• Conditional probability
• Binomial distribution

**Common Formulas:**
• Mean = Σx/n
• Standard Deviation = √(Σ(x-μ)²/n)
• Probability = favorable outcomes / total outcomes

**How to get help:**
1. Provide your data set
2. Tell me what you need to calculate
3. Specify the type of analysis

**Example questions:**
• "Find the mean of: 5, 8, 12, 15, 20"
• "Calculate standard deviation for this data"
• "What's the probability of rolling a 6 on a die?"

What statistics problem can I help you with?`;
}

function generateGeneralMathHelp(userMessage: string, messages: any[]): string {
  return `I'm here to help you with all your math questions! 🎯

**What I can help you with:**

🔢 **Core Math Topics**
• **Arithmetic**: Addition, subtraction, multiplication, division
• **Algebra**: Equations, functions, inequalities
• **Geometry**: Shapes, areas, volumes, theorems
• **Calculus**: Derivatives, integrals, limits
• **Statistics**: Mean, median, probability
• **Trigonometry**: Sine, cosine, tangent

💡 **Problem-Solving Strategies**
• Break down complex problems
• Step-by-step solutions
• Multiple approaches
• Real-world applications

📚 **Learning Support**
• Concept explanations
• Practice problems
• Study tips
• Common mistakes to avoid

**How to get the best help:**
1. **Be specific**: "Solve 2x + 5 = 13" vs "Help with math"
2. **Show your work**: Let me see what you've tried
3. **Ask follow-ups**: "Why does this step work?"
4. **Request examples**: "Can you show me more problems like this?"

**Try asking:**
• "I'm stuck on this problem: [write it out]"
• "Can you explain [concept] in simple terms?"
• "Give me practice problems for [topic]"
• "What's the best way to approach this?"

What math topic or problem would you like to work on? I'm ready to help! 🚀`;
} 