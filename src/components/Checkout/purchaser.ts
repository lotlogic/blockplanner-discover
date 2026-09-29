import { z } from "zod";

// Who the purchaser is to the property. Sent to the backend as clientRole and
// stored on the Stripe session, so each report is written for the right
// reader (an owner, a buyer or an agent get different wording).
export const CLIENT_ROLE_OPTIONS = [
  { value: "owner", label: "I own it (or co-own it)" },
  { value: "buyer", label: "I'm buying, or thinking of it" },
  { value: "agent", label: "I'm the owner's agent" },
  { value: "other", label: "Other (family, adviser, builder)" },
] as const;

export const clientRoleSchema = z.enum(
  CLIENT_ROLE_OPTIONS.map((o) => o.value) as ["owner", "buyer", "agent", "other"],
  { message: "Please tell us how you're connected to this property" },
);

// Values are unchanged from before except the new "Hold"; the backend and
// Monday map anything they don't know to "Open to options".
export const INTENTION_OPTIONS = [
  { value: "Sell", label: "I want to sell and understand what it's worth" },
  { value: "Develop myself", label: "I want to develop it myself" },
  { value: "Have someone develop for me", label: "I want someone to develop it for me" },
  { value: "Hold", label: "Keep it for now, plan for later" },
  { value: "Open to options", label: "I'm open to options - help me figure it out" },
] as const;

export const intentionSchema = (message: string) =>
  z.enum(
    INTENTION_OPTIONS.map((o) => o.value) as [
      "Sell",
      "Develop myself",
      "Have someone develop for me",
      "Hold",
      "Open to options",
    ],
    { message },
  );

// A buyer doesn't own it yet, so "sell" isn't an option for them.
export const intentionOptionsFor = (role: string | undefined) =>
  role === "buyer"
    ? INTENTION_OPTIONS.filter((o) => o.value !== "Sell")
    : INTENTION_OPTIONS;
