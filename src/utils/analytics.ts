import type { GeoApi, LotCheckPathwayCard, LotRule } from "@/@types/api";
import mixpanel from "mixpanel-browser";

const DEFAULT_MIXPANEL_TOKEN = "96b3f842f9f82bc71b1419a1c8b3d873";
const MIXPANEL_TOKEN =
  import.meta.env.VITE_MIXPANEL_TOKEN || DEFAULT_MIXPANEL_TOKEN;
const MIXPANEL_ENABLED = Boolean(MIXPANEL_TOKEN);

let isInitialized = false;

export const initAnalytics = () => {
  if (!MIXPANEL_ENABLED || isInitialized) return;

  mixpanel.init(MIXPANEL_TOKEN, {
    autocapture: true,
    record_sessions_percent: 100,
    api_host: "https://api-eu.mixpanel.com",
  });

  isInitialized = true;
};

const withTimestamp = (props?: Record<string, unknown>) => ({
  ...props,
  timestamp: new Date().toISOString(),
});

export const trackEvent = (
  event: string,
  props?: Record<string, unknown>,
) => {
  if (!MIXPANEL_ENABLED) return;
  if (!isInitialized) initAnalytics();

  mixpanel.track(event, props);
};

export const identifyUser = (
  email: string,
  props?: Record<string, unknown>,
) => {
  if (!MIXPANEL_ENABLED || !email) return;
  if (!isInitialized) initAnalytics();

  const aliasKey = `mixpanel_alias_${email}`;
  if (typeof window !== "undefined") {
    const hasAlias = window.localStorage.getItem(aliasKey);
    if (!hasAlias) {
      try {
        mixpanel.alias(email);
        window.localStorage.setItem(aliasKey, "1");
      } catch {
        // ignore alias errors for repeat calls or blocked storage
      }
    }
  }

  mixpanel.identify(email);
  if (mixpanel.people && typeof mixpanel.people.set === "function") {
    mixpanel.people.set({
      $email: email,
      ...props,
    });
  }
};

export const trackCtaClick = (
  cta: string,
  props?: Record<string, unknown>,
) => {
  trackEvent("cta_click", withTimestamp({ cta, ...props }));
};

export const trackLookupStarted = (address?: string | null) => {
  if (!address) return;

  trackEvent("lookup_started", withTimestamp({ address }));
};

const buildRuleOutputs = (matches?: LotRule[]) =>
  (matches ?? []).map((match) => ({
    pathway: match.pathway,
    parameter: match.parameter,
    confidence: match.confidence,
    explanation: match.explanationResolved ?? match.explanation,
    evaluation: match.evaluation,
  }));

const buildPathwayCardOutputs = (cards?: LotCheckPathwayCard[]) =>
  (cards ?? []).map((card) => ({
    pathway_key: card.pathwayKey,
    title: card.title,
    status: card.status,
    technical_label: card.technicalLabel,
  }));

const getParcelId = (report: GeoApi) => {
  const block = report.block;
  if (block?.blockKey) return String(block.blockKey);
  if (block?.objectId != null) return String(block.objectId);

  const property = block?.properties;
  if (property?.BLOCK_KEY != null) return String(property.BLOCK_KEY);
  if (property?.AP_NUMBER) return String(property.AP_NUMBER);

  return undefined;
};

const getBlockSize = (report: GeoApi) =>
  report?.lotCheckRules?.blockAreaSqm ??
  report?.block?.derivedAreaSqm ??
  report?.block?.properties?.BLOCK_DERIVED_AREA ??
  null;

export const trackLookupPerformed = (
  report: GeoApi,
  overrides?: { address?: string | null },
) => {
  if (!report) return;

  const address = overrides?.address ?? report.formattedAddress;
  const zone = report.lotCheckRules?.zoneCode ?? report.zone?.zoneCode ?? null;

  trackEvent("lookup_performed", {
    address,
    parcel_id: getParcelId(report),
    block_size: getBlockSize(report),
    zone,
    rule_outputs: buildRuleOutputs(report.lotCheckRules?.matches),
    pathway_cards: buildPathwayCardOutputs(report.lotCheckRules?.cards),
    timestamp: new Date().toISOString(),
  });
};
