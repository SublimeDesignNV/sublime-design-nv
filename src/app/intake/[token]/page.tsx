import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import IntakeForm from "./IntakeForm";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ edit?: string }>;
};

export default async function IntakePage({ params, searchParams }: Props) {
  const { token } = await params;
  const { edit } = await searchParams;
  const editMode = edit === "1";

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

  // Already completed — show a message instead of re-rendering the form (unless edit mode)
  if (!editMode && (lead.status === "INTAKE_COMPLETE" || lead.status === "VISION_GENERATED" || lead.status === "BID_READY" || lead.status === "CONVERTED")) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="w-16 h-1 bg-red mx-auto mb-8" />
          <h1 className="font-display text-3xl text-charcoal mb-4">
            You&apos;re all set, {lead.firstName}!
          </h1>
          <p className="text-gray-mid text-lg">
            We&apos;ve already received your project details. We&apos;ll be in touch shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <IntakeForm
      leadId={lead.id}
      token={token}
      firstName={lead.firstName}
      serviceType={lead.serviceType}
    />
  );
}
