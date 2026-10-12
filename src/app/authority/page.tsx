import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AuthorityClient from "./AuthorityClient";

export const dynamic = "force-dynamic";

export default async function AuthorityDashboard() {
  const session = await getServerSession(authOptions);

  const role = (session?.user as any)?.role;
  if (!session || (role !== "COMPETENT_AUTHORITY" && role !== "ADMIN")) {
    redirect("/");
  }

  const submissions = await prisma.submission.findMany({
    include: {
      template: { include: { fields: { orderBy: { order: "asc" } } } },
      academicYear: true,
      department: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      <div style={{ marginBottom: "25px" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Competent Authority Review &amp; Compliance Portal</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Monitor university compliance, review department submissions, and endorse data for administration.
        </p>
      </div>

      <AuthorityClient submissions={submissions} />
    </main>
  );
}
