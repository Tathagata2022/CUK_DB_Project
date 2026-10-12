import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const templates = await prisma.template.findMany({
      include: {
        fields: { orderBy: { order: "asc" } },
        _count: { select: { submissions: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(templates);
  } catch (error) {
    return NextResponse.json({ error: "Internal Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, category, fields } = body;

    if (!name || !fields || fields.length === 0) {
      return NextResponse.json({ error: "Name and at least one field are required" }, { status: 400 });
    }

    const template = await prisma.template.create({
      data: {
        name,
        description: description || null,
        category: category || "General",
        fields: {
          create: fields.map((f: any, i: number) => ({
            name: f.name,
            type: f.type || "text",
            required: f.required !== undefined ? f.required : true,
            order: i
          }))
        }
      },
      include: { fields: true }
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as any).id,
        action: "CREATED_TEMPLATE",
        record: `Template: ${template.name}`,
        newValue: `Created data collection template with ${fields.length} dynamic columns`
      }
    });

    return NextResponse.json(template, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 });
    }

    const subCount = await prisma.submission.count({ where: { templateId: id } });
    if (subCount > 0) {
      return NextResponse.json({ error: "Cannot delete template with existing submissions. Clear submissions first." }, { status: 400 });
    }

    await prisma.templateField.deleteMany({ where: { templateId: id } });
    await prisma.template.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
