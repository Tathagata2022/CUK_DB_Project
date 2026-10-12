import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true, submissions: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, code, school, type } = await request.json();

    if (!name || !code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }

    const existingCode = await prisma.department.findUnique({ where: { code } });
    if (existingCode) {
      return NextResponse.json({ error: "Department code already in use" }, { status: 400 });
    }

    const newDepartment = await prisma.department.create({
      data: {
        name,
        code: code.toUpperCase(),
        school: school || null,
        type: type || "DEPARTMENT"
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATED_DEPARTMENT",
        record: `Department ${newDepartment.name}`,
        newValue: `Created ${newDepartment.type} [${newDepartment.code}] under ${newDepartment.school || 'General'}`
      }
    });

    return NextResponse.json(newDepartment, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Department ID required" }, { status: 400 });
    }

    // Check if it has submissions
    const subCount = await prisma.submission.count({ where: { departmentId: id } });
    if (subCount > 0) {
      return NextResponse.json({ error: "Cannot delete department with active data submissions" }, { status: 400 });
    }

    // Unlink users
    await prisma.user.updateMany({
      where: { departmentId: id },
      data: { departmentId: null }
    });

    await prisma.department.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete department" }, { status: 500 });
  }
}
