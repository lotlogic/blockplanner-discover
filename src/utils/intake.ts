// Lead capture goes to the BlockPlanner intake Worker, which writes each
// submission to the Airtable CRM Leads table. Payment fulfilment is separate:
// the same Worker receives Stripe's webhook directly.
const INTAKE_URL = (import.meta.env.VITE_INTAKE_URL || "").replace(/\/$/, "");

export async function submitEnquiry(body: Record<string, unknown>) {
  if (!INTAKE_URL) throw new Error("Lead capture is not configured");

  const response = await fetch(`${INTAKE_URL}/enquiry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sourceApp: "discover", ...body }),
  });

  if (!response.ok) {
    const responseBody = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(
      responseBody.error || `HTTP error! status: ${response.status}`,
    );
  }

  return response;
}
