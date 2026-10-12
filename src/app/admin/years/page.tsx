import { prisma } from "@/lib/prisma";
import YearClient from "./YearClient";

export default async function ManageYears() {
  const years = await prisma.academicYear.findMany({
    orderBy: { year: 'desc' }
  });

  return (
    <main className="animate-fade-in" style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Academic Years</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>
        Define reporting cycles (e.g., 2026-27). Only one year can be active at a time for new submissions.
      </p>

      <YearClient initialYears={years} />
    </main>
  );
}
