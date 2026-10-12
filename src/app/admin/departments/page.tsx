import { prisma } from "@/lib/prisma";
import DepartmentClient from "./DepartmentClient";

export const dynamic = "force-dynamic";

export default async function ManageDepartments() {
  const departments = await prisma.department.findMany({
    include: {
      _count: {
        select: { users: true, submissions: true }
      }
    },
    orderBy: { name: "asc" }
  });

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      <DepartmentClient initialDepartments={departments} />
    </main>
  );
}
