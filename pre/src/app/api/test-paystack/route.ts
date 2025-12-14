import { NextRequest, NextResponse } from "next/server";

const PAYSTACK_SECRET_KEY = "sk_test_54bac629f29f850504ab96fd15abd6226a4a8082";

export async function GET(req: NextRequest) {
  try {
    // Test Paystack connection by fetching transaction list
    const response = await fetch("https://api.paystack.co/transaction", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    });

    const data = await response.json();

    if (response.ok) {
      return NextResponse.json({
        success: true,
        message: "Paystack connection successful",
        data: {
          total: data.data?.length || 0,
          status: data.status,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        message: "Paystack connection failed",
        error: data.message,
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Paystack test error:", error);
    return NextResponse.json({
      success: false,
      message: "Failed to connect to Paystack",
      error: error instanceof Error ? error.message : "Unknown error",
    }, { status: 500 });
  }
} 