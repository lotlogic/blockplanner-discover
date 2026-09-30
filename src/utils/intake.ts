// BlockPlanner intake service (Cloudflare Worker, lotlogic/blockplanner-intake).
// It writes website enquiries and subscriptions to the Airtable Leads board.
// Empty when VITE_INTAKE_URL isn't set, so local builds keep the old behaviour.
const INTAKE_URL = String(import.meta.env.VITE_INTAKE_URL || "")
  .trim()
  .replace(/\/+$/, "");

export const isIntakeConfigured = () => Boolean(INTAKE_URL);

// Returns true when the lead was saved. Never throws, so a form can send to
// the intake service alongside the backend without one failure hiding the other.
export const sendToIntake = async (
  body: Record<string, unknown>,
): Promise<boolean> => {
  if (!INTAKE_URL) return false;
  try {
    const response = await fetch(`${INTAKE_URL}/enquiry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sourceApp: "discover", ...body }),
    });
    return response.ok;
  } catch {
    return false;
  }
};
