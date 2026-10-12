import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import DynamicForm from "./DynamicForm";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TemplateSubmissionPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    redirect("/");
  }

  const { id } = await Promise.resolve(params);
  const departmentId = (session.user as any).departmentId;

  const template = await prisma.template.findUnique({
    where: { id },
    include: { fields: { orderBy: { order: "asc" } } },
  });

  if (!template) {
    notFound();
  }

  const activeYear = await prisma.academicYear.findFirst({ where: { isActive: true } });

  const existingSubmission = departmentId && activeYear
    ? await prisma.submission.findUnique({
        where: {
          templateId_departmentId_academicYearId: {
            templateId: template.id,
            departmentId,
            academicYearId: activeYear.id,
          },
        },
        include: {
          department: true,
          academicYear: true,
        },
      })
    : null;

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ marginBottom: "25px" }}>
          <Link href="/dashboard" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
            &larr; Back to Department Modules
          </Link>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginTop: "10px" }}>
            <div>
              <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>{template.name}</h1>
              <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
                {template.description || "Enter all requested departmental data accurately."}
              </p>
            </div>
            <span className="badge badge-verified" style={{ padding: "6px 14px", fontSize: "0.85rem" }}>
              Cycle: {activeYear?.year || "2026-27"}
            </span>
          </div>
        </div>

        <div className="glass-panel">
          <DynamicForm
            templateId={template.id}
            fields={template.fields}
            existingSubmission={existingSubmission}
            departmentName={(session.user as any).departmentName || "Department"}
          />
        </div>
      </div>
    </main>
  );
}
