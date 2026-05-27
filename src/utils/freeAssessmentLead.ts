export async function recordFreeAssessmentLead(email: string): Promise<void> {
  const trimmedEmail = email.trim();
  if (!trimmedEmail) return;

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/monday/free-assessment-leads`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      keepalive: true,
      body: JSON.stringify({ email: trimmedEmail }),
    },
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}
