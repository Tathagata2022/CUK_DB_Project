import { prisma } from "@/lib/prisma";
import ReportClient from "./ReportClient";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [submissions, templates, departments, academicYears] = await Promise.all([
    prisma.submission.findMany({
      include: {
        department: true,
        template: {
          include: { fields: { orderBy: { order: "asc" } } },
        },
        academicYear: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.template.findMany({
      include: { fields: { orderBy: { order: "asc" } } },
      orderBy: { name: "asc" },
    }),
    prisma.department.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.academicYear.findMany({
      orderBy: { year: "desc" },
    }),
  ]);

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      <div style={{ marginBottom: "25px" }}>
        <Link href="/admin" style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>
          &larr; Admin Dashboard
        </Link>
        <h1 style={{ fontSize: "2rem", fontWeight: "800", marginTop: "4px" }}>
          University Consolidated Report Generator
        </h1>
        <p style={{ color: "var(--text-muted)" }}>
          Multi-dimensional consolidation by Academic Year, School, Department, Category, and Workflow Status.
        </p>
      </div>

      <ReportClient
        initialSubmissions={submissions}
        templates={templates}
        departments={departments}
        academicYears={academicYears}
      />
    </main>
  );
}
