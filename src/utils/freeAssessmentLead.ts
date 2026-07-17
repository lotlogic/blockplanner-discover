type FreeAssessmentLead = {
  email: string;
  address?: string;
  zone?: string;
  blockSizeM2?: string | number;
};

export async function recordFreeAssessmentLead(
  lead: FreeAssessmentLead,
): Promise<void> {
  const trimmedEmail = lead.email.trim();
  if (!trimmedEmail) return;

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/monday/free-assessment-leads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({
        email: trimmedEmail,
        address: lead.address,
        zone: lead.zone,
        blockSizeM2: lead.blockSizeM2,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
