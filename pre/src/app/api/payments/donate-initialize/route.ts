import { NextRequest, NextResponse } from "next/server";

// NOTE: For production, move this key to env and reference via process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_SECRET_KEY = "sk_test_54bac629f29f850504ab96fd15abd6226a4a8082";

export async function POST(req: NextRequest) {
	try {
		const { amount, email } = await req.json();

		if (!amount || amount <= 0) {
			return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
		}

		if (!email || typeof email !== "string" || !email.includes("@")) {
			return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
		}

		// Generate a reference for payment
		const reference = `DON_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

		// Initialize Paystack payment (amount is in kobo)
		const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
			method: "POST",
			headers: {
				Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
				amount: amount * 100,
				reference,
				callback_url: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/?donation=success`,
				metadata: {
					payment_type: "DONATION",
				},
			}),
		});

		const data = await paystackResponse.json();

		if (!paystackResponse.ok) {
			return NextResponse.json({ error: "Failed to initialize donation", details: data }, { status: 400 });
		}

		return NextResponse.json({
			success: true,
			authorization_url: data.data.authorization_url,
			reference: data.data.reference,
		});
	} catch (error) {
		console.error("Error initializing donation:", error);
		return NextResponse.json({ error: "Failed to initialize donation" }, { status: 500 });
	}
} 