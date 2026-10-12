import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { year } = await request.json();

    const newYear = await prisma.academicYear.create({
      data: {
        year,
        isActive: false // By default, not active until explicitly set
      }
    });

    return NextResponse.json(newYear);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id, isActive } = await request.json();

    if (isActive) {
      // Deactivate all others
      await prisma.academicYear.updateMany({
        where: { id: { not: id } },
        data: { isActive: false }
      });
    }

    const updated = await prisma.academicYear.update({
      where: { id },
      data: { isActive }
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
