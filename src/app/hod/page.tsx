import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import HodClient from "./HodClient";

export const dynamic = "force-dynamic";

export default async function HodDashboard() {
  const session = await getServerSession(authOptions);

  const role = (session?.user as any)?.role;
  if (!session || (role !== "HOD" && role !== "ADMIN")) {
    redirect("/");
  }

  const deptId = (session?.user as any)?.departmentId;

  const submissions = await prisma.submission.findMany({
    where: deptId ? { departmentId: deptId } : {},
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
        <h1 style={{ fontSize: "2rem", fontWeight: "800" }}>Head of Department Verification Portal</h1>
        <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>
          Review, technically scrutinize, and verify data entries submitted by department nodal officers.
        </p>
      </div>

      <HodClient submissions={submissions} />
    </main>
  );
}
