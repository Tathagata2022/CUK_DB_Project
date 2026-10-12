import { prisma } from "@/lib/prisma";
import UserClient from "./UserClient";

export default async function ManageUsers() {
  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' }
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' }
  });

  return (
    <main className="animate-fade-in" style={{ padding: '20px' }}>
      <UserClient initialUsers={users} departments={departments} />
    </main>
  );
}
