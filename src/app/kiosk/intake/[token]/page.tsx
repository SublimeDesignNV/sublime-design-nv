import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import KioskIntakeForm from "./KioskIntakeForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ mode?: string }>;
};

export default async function KioskIntakePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { mode } = await searchParams;

  const lead = await db.intakeLead.findUnique({
    where: { token },
    select: {
      id: true,
      firstName: true,
      serviceType: true,
      status: true,
    },
  });

  if (!lead) notFound();

  return (
    <KioskIntakeForm
      leadId={lead.id}
      token={token}
      firstName={lead.firstName}
      serviceType={lead.serviceType}
      skipPhotos={mode === "tradeshow" || !mode}
    />
  );
}
