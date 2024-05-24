import { verify } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const decoded = verify(body.token, process.env.JWT_SECRET ? process.env.JWT_SECRET : '');
    if (decoded !== undefined) {
      const response = NextResponse.json(decoded,
        { status: 200, headers: { "content-type": "application/json" }
      });
      return response;
    }
    return NextResponse.json({ success: false },
      { status: 401, headers: { "content-type": "application/json" }
    });
  } catch {
    return NextResponse.json({ success: false },
      { status: 401, headers: { "content-type": "application/json" }
    })
  }
}