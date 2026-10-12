import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { templateId, data, status } = body;
    const departmentId = (session.user as any).departmentId;
    const userId = (session.user as any).id;

    if (!templateId || !data) {
      return NextResponse.json({ error: "Template ID and data are required" }, { status: 400 });
    }

    if (!departmentId) {
      return NextResponse.json({ error: "User is not linked to any department or section" }, { status: 400 });
    }

    const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });
    if (!activeYear) {
      return NextResponse.json({ error: "No active academic year found in system" }, { status: 400 });
    }

    const template = await prisma.template.findUnique({ where: { id: templateId } });

    // Upsert submission
    const submission = await prisma.submission.upsert({
      where: {
        templateId_departmentId_academicYearId: {
          templateId,
          departmentId,
          academicYearId: activeYear.id,
        },
      },
      update: {
        data: JSON.stringify(data),
        status: status || "DRAFT",
        submittedAt: status === "SUBMITTED" ? new Date() : null,
        // If resubmitting from returned, clear prior return remarks
        remarks: status === "SUBMITTED" ? null : undefined,
      },
      create: {
        templateId,
        departmentId,
        academicYearId: activeYear.id,
        data: JSON.stringify(data),
        status: status || "DRAFT",
        submittedAt: status === "SUBMITTED" ? new Date() : null,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        userId,
        submissionId: submission.id,
        action: status === "SUBMITTED" ? "SUBMITTED_TO_HOD" : "SAVED_DRAFT",
        record: `${template?.name || "Module"} Data`,
        newValue: status === "SUBMITTED" ? "Submitted for HoD verification" : "Saved draft locally",
      },
    });

    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
