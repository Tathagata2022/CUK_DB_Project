import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { status, remarks } = body;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { template: true, department: true }
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const userRole = (session.user as any).role;
    const userDeptId = (session.user as any).departmentId;

    // Role-based validation
    if (userRole === "HOD") {
      if (submission.departmentId !== userDeptId) {
        return NextResponse.json({ error: "Unauthorized for this department" }, { status: 403 });
      }
      if (status !== "UNDER_REVIEW" && status !== "RETURNED") {
        return NextResponse.json({ error: "HoD can only verify or return" }, { status: 400 });
      }
    } else if (userRole === "COMPETENT_AUTHORITY") {
      if (status !== "VERIFIED" && status !== "RETURNED") {
        return NextResponse.json({ error: "Competent Authority can only endorse/verify or return" }, { status: 400 });
      }
    } else if (userRole === "ADMIN") {
      // Admin has full operational override
    } else {
      return NextResponse.json({ error: "Unauthorized role for status transition" }, { status: 403 });
    }

    const updated = await prisma.submission.update({
      where: { id },
      data: {
        status,
        remarks: remarks !== undefined ? remarks : submission.remarks,
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        submissionId: id,
        action: `STATUS_${status}`,
        record: `${submission.template.name} (${submission.department.name})`,
        newValue: `Changed to ${status}${remarks ? `. Remarks: ${remarks}` : ''}`
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}
