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

// Values are what the backend, Stripe metadata and the intake Worker read;
// only the wording changes with who is buying. Monday maps anything it
// doesn't know (e.g. "Hold") to "Open to options".
const INTENTION_VALUES = [
  "Sell",
  "Develop myself",
  "Have someone develop for me",
  "Hold",
  "Open to options",
] as const;

type IntentionValue = (typeof INTENTION_VALUES)[number];
type ClientRole = (typeof CLIENT_ROLE_OPTIONS)[number]["value"];
type IntentionOption = { value: IntentionValue; label: string };

// The question and its options, worded for each kind of purchaser. A buyer
// doesn't own it yet, so "sell" isn't offered to them.
const INTENTION_COPY: Record<ClientRole, { prompt: string; options: IntentionOption[] }> = {
  owner: {
    prompt: "What's your primary intention?",
    options: [
      { value: "Sell", label: "I want to sell and understand what it's worth" },
      { value: "Develop myself", label: "I want to develop it myself" },
      { value: "Have someone develop for me", label: "I want someone to develop it for me" },
      { value: "Hold", label: "Keep it for now, plan for later" },
      { value: "Open to options", label: "I'm open to options - help me figure it out" },
    ],
  },
  buyer: {
    prompt: "What would you do with it?",
    options: [
      { value: "Develop myself", label: "I'd develop it myself after buying" },
      { value: "Have someone develop for me", label: "I'd want someone to develop it for me" },
      { value: "Hold", label: "I'd live in it or hold it, and plan for later" },
      { value: "Open to options", label: "I'm weighing it up - help me see what's possible" },
    ],
  },
  agent: {
    prompt: "What does the owner want to do?",
    options: [
      { value: "Sell", label: "Sell, and show buyers what's possible" },
      { value: "Develop myself", label: "Develop it themselves" },
      { value: "Have someone develop for me", label: "Have someone develop it for them" },
      { value: "Hold", label: "Keep it for now, plan for later" },
      { value: "Open to options", label: "They're open to options" },
    ],
  },
  other: {
    prompt: "What's the plan for this property?",
    options: [
      { value: "Sell", label: "Sell it and understand what it's worth" },
      { value: "Develop myself", label: "Develop it themselves" },
      { value: "Have someone develop for me", label: "Have someone develop it for them" },
      { value: "Hold", label: "Keep it for now, plan for later" },
      { value: "Open to options", label: "Not decided yet - help figure it out" },
    ],
  },
};

// Shown on the plans question until they've said how they're connected.
export const INTENTION_LOCKED_PROMPT = "First, choose how you're connected";

export const intentionSchema = (message: string) =>
  z.enum(INTENTION_VALUES as unknown as [IntentionValue, ...IntentionValue[]], { message });

const isClientRole = (role: string | undefined): role is ClientRole =>
  CLIENT_ROLE_OPTIONS.some((o) => o.value === role);

export const intentionPromptFor = (role: string | undefined) =>
  isClientRole(role) ? INTENTION_COPY[role].prompt : INTENTION_LOCKED_PROMPT;

// No options until a role is chosen; the select stays disabled until then.
export const intentionOptionsFor = (role: string | undefined): IntentionOption[] =>
  isClientRole(role) ? INTENTION_COPY[role].options : [];
