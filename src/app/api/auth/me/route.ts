import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId as string },
      select: { id: true, name: true, email: true }
    });
    
    return NextResponse.json({ user });
  } catch (e) {
    return NextResponse.json({ user: null }, { status: 500 });
  }
}

