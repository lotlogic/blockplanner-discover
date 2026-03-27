import type { GeoApi, LotCheckPathwayCard, LotRule } from "@/@types/api";

export type FreeReportCardStatus = "possible" | "not_available" | "review";

export type FreeReportCard = {
  key: string;
  title: string;
  technical: string;
  body: string;
  status: FreeReportCardStatus;
};

type PathwayConfig = {
  title: string;
  technical: string;
};

type PathwaySummary = {
  pathway: string;
  display: PathwayConfig;
  status: FreeReportCardStatus;
  body: string;
};

const PATHWAY_CONFIG: Record<string, PathwayConfig> = {
  "second dwelling / granny flat": {
    title: "Add a second dwelling",
    technical: "Secondary dwelling / granny flat",
  },
  "unit-titling": {
    title: "Create separate titles later",
    technical: "Unit titling",
  },
  subdivision: {
    title: "Sell off part of your land",
    technical: "Subdivision",
  },
  "townhouses / multi-unit": {
    title: "Build multiple dwellings",
    technical: "Townhouses / multi-unit",
  },
  "co-housing": {
    title: "Explore a shared-living project",
    technical: "Co-housing",
  },
};

const PATHWAY_ORDER = [
  "second dwelling / granny flat",
  "unit-titling",
  "subdivision",
  "townhouses / multi-unit",
  "co-housing",
];

const CARD_ORDER = [
  "granny_flat",
  "dual_occupancy",
  "unit_titling",
  "subdivision",
  "multi_unit",
  "co_housing",
];

const normalizePathwayKey = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeParameterKey = (value?: string | null) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeCardBody = (value?: string | null) =>
  String(value || "")
    .trim()
    .replace(/\s+/g, " ");

const formatArea = (value?: number | null) =>
  typeof value === "number" && Number.isFinite(value)
    ? `${value.toLocaleString("en-AU")} m²`
    : "this block size";

const getFirstResolvedExplanation = (rules: LotRule[]) =>
  rules.find((rule) => rule.explanationResolved?.trim())?.explanationResolved?.trim();

const getRuleForParameter = (rules: LotRule[], parameter: string) =>
  rules.find((rule) => normalizeParameterKey(rule.parameter) === parameter);

const buildSizeGateMessage = (
  minBlockRule: LotRule,
  blockAreaSqm: number | null,
) => {
  const value =
    typeof minBlockRule.current?.value === "number"
      ? minBlockRule.current.value
      : null;

  if (value === null) {
    return "This pathway does not currently qualify on block size alone.";
  }

  return `Under the current ACT planning rules, this pathway generally needs a block of at least ${value.toLocaleString(
    "en-AU",
  )} m². This property is ${formatArea(blockAreaSqm)}, so it does not currently qualify on size alone.`;
};

const buildFallbackUnavailableMessage = (pathway: string) =>
  `${PATHWAY_CONFIG[pathway]?.title || "This pathway"} is not currently available under the current planning rules for this zone.`;

const buildPathwaySummary = (
  pathway: string,
  rules: LotRule[],
  blockAreaSqm: number | null,
): PathwaySummary | null => {
  const display = PATHWAY_CONFIG[pathway];
  if (!display) return null;

  const minBlockRule = getRuleForParameter(rules, "min_block_area_m2");
  const allowedRule = getRuleForParameter(rules, "allowed_boolean");
  const positiveExplanation =
    allowedRule?.explanationResolved?.trim() || getFirstResolvedExplanation(rules);

  if (minBlockRule?.evaluation.currentMeetsRule === false) {
    return {
      pathway,
      display,
      status: "not_available",
      body:
        allowedRule?.evaluation.currentMeetsRule === false &&
        allowedRule.explanationResolved?.trim()
          ? allowedRule.explanationResolved.trim()
          : buildSizeGateMessage(minBlockRule, blockAreaSqm),
    };
  }

  if (allowedRule?.evaluation.currentMeetsRule === false) {
    return {
      pathway,
      display,
      status: "not_available",
      body:
        allowedRule.explanationResolved?.trim() ||
        buildFallbackUnavailableMessage(pathway),
    };
  }

  if (
    minBlockRule?.evaluation.currentMeetsRule === true ||
    allowedRule?.evaluation.currentMeetsRule === true
  ) {
    return {
      pathway,
      display,
      status: "possible",
      body:
        positiveExplanation ||
        `${display.title} appears to be available under the current planning rules, subject to site-specific checks.`,
    };
  }

  return {
    pathway,
    display,
    status: "review",
    body:
      positiveExplanation ||
      `${display.title} may depend on a more detailed review of access, setbacks, trees, easements and other site conditions.`,
  };
};

const buildFreeReportCardsFromBackend = (
  backendCards?: LotCheckPathwayCard[] | null,
): FreeReportCard[] => {
  const cards = (backendCards ?? [])
    .filter(
      (card) =>
        card &&
        typeof card.pathwayKey === "string" &&
        typeof card.title === "string" &&
        typeof card.status === "string",
    )
    .map((card) => ({
      key: String(card.pathwayKey),
      title: String(card.title),
      technical: String(card.technicalLabel || ""),
      body: normalizeCardBody(card.body),
      status: card.status,
    }));

  if (!cards.length) {
    return [];
  }

  return cards.sort((a, b) => {
    const aIndex = CARD_ORDER.indexOf(a.key);
    const bIndex = CARD_ORDER.indexOf(b.key);
    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return safeA - safeB;
  });
};

export const buildFreeReportCards = (
  report?: GeoApi,
): FreeReportCard[] => {
  const backendCards = buildFreeReportCardsFromBackend(
    report?.lotCheckRules?.cards,
  );
  if (backendCards.length) {
    return backendCards;
  }

  const matches = report?.lotCheckRules?.matches || [];
  const grouped = new Map<string, LotRule[]>();

  matches.forEach((match) => {
    const key = normalizePathwayKey(match.pathway);
    if (!key || !PATHWAY_CONFIG[key]) return;
    const existing = grouped.get(key) || [];
    existing.push(match);
    grouped.set(key, existing);
  });

  return PATHWAY_ORDER.map((pathway) =>
    buildPathwaySummary(
      pathway,
      grouped.get(pathway) || [],
      report?.lotCheckRules?.blockAreaSqm ?? null,
    ),
  )
    .filter((summary): summary is PathwaySummary => Boolean(summary))
    .map((summary) => ({
      key: summary.pathway,
      title: summary.display.title,
      technical: summary.display.technical,
      body: summary.body,
      status: summary.status,
    }));
};
