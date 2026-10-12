import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TemplateListClient from "./TemplateListClient";

export const dynamic = "force-dynamic";

export default async function ManageTemplates() {
  const templates = await prisma.template.findMany({
    include: {
      fields: { orderBy: { order: "asc" } },
      _count: { select: { submissions: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="animate-fade-in" style={{ padding: "30px 40px" }}>
      <TemplateListClient initialTemplates={templates} />
    </main>
  );
}
