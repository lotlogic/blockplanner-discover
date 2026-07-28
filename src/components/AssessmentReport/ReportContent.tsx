import type { GeoApi } from "@/@types/api";
import { toTitleCase } from "@/utils/text";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { buildFreeReportCards } from "./free-report";

type Props = {
  savedAddress: string;
  report?: GeoApi;
};

const renderReportText = (text: string) => {
  const [body, rules] = text.split(/\n-{3,}\n/);
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const ruleLines = (rules || "")
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  return (
    <>
      {paragraphs.map((paragraph) => (
        <p
          key={paragraph}
          className="mt-4 whitespace-pre-line text-sm leading-7 text-bp-blueGum/78 first:mt-0 md:text-[0.96rem]"
        >
          {paragraph}
        </p>
      ))}
      {!!ruleLines.length && (
        <div className="mt-5 rounded-sm bg-bp-sand px-4 py-4 text-xs leading-6 text-bp-blueGum/68">
          {ruleLines.map((line) =>
            line.toLowerCase() === "the rule behind this:" ? (
              <p
                key={line}
                className="font-semibold uppercase text-bp-eucalypt"
              >
                The rule behind this
              </p>
            ) : (
              <p key={line} className="mt-2 first:mt-0">
                {line}
              </p>
            ),
          )}
        </div>
      )}
    </>
  );
};

export const ReportContent = ({ report, savedAddress }: Props) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {},
  );

  const zoneText = [
    report?.zone.zoneCode,
    toTitleCase(report?.zone.properties?.LAND_USE_POLICY_DESC),
  ]
    .filter(Boolean)
    .join(" - ");

  const address = report?.formattedAddress || savedAddress;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const cards = buildFreeReportCards(report);
  const mapQuery =
    typeof report?.location?.lat === "number" &&
    typeof report?.location?.lng === "number"
      ? `${report.location.lat},${report.location.lng}`
      : encodeURIComponent(address);
  const mapSrc = apiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?size=1100x420&scale=2&zoom=18&maptype=satellite&markers=color:0xC4622D|${mapQuery}&key=${apiKey}`
    : undefined;
  const reportMonth = new Intl.DateTimeFormat("en-AU", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  const toggleCard = (cardKey: string) => {
    setExpandedCards((current) => ({
      ...current,
      [cardKey]: !current[cardKey],
    }));
  };

  return (
    <div className="text-bp-blueGum">
      <div className="flex items-center justify-between bg-bp-blueGum px-6 py-5 md:px-10">
        <div>
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.3em] text-bp-sand/70">
            BlockPlanner
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-bp-sand md:text-3xl">
            Property Assessment
          </h2>
        </div>
        <p className="text-right text-[0.62rem] font-medium uppercase tracking-[0.24em] text-bp-sand/60">
          Free report
        </p>
      </div>

      <div className="border-b border-bp-blueGum/10 bg-bp-sand px-6 py-6 md:px-10">
        <h3 className="text-2xl font-semibold leading-tight text-bp-blueGum md:text-[2rem]">
          {address.replace(", Australia", "")}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          {!!report?.zone.zoneCode && (
            <span className="rounded-full bg-bp-blueGum px-3 py-1 font-medium uppercase tracking-[0.12em] text-bp-sand">
              {report.zone.zoneCode}
            </span>
          )}
          {!!zoneText && (
            <span className="rounded-full border border-bp-blueGum/15 bg-white px-3 py-1 text-bp-blueGum/75">
              {zoneText}
            </span>
          )}
          {!!report?.lotCheckRules.blockAreaSqm && (
            <span className="rounded-full border border-bp-blueGum/15 bg-white px-3 py-1 text-bp-blueGum/75">
              {report.lotCheckRules.blockAreaSqm.toLocaleString("en-AU")} m²
            </span>
          )}
          <span className="rounded-full border border-bp-blueGum/15 bg-white px-3 py-1 text-bp-blueGum/75">
            {reportMonth}
          </span>
        </div>
      </div>

      <div className="relative h-52 overflow-hidden border-b border-bp-blueGum/10 bg-bp-blueGum/8 md:h-62">
        {mapSrc ? (
          <img
            src={mapSrc}
            alt={`Satellite image of ${address}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#bbc5bf,#d9d5c8)]" />
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(73,79,74,0.06),rgba(73,79,74,0.22))]" />
        <p className="absolute bottom-4 left-4 rounded-full bg-black/35 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-white/85">
          Property snapshot
        </p>
      </div>

      <div className="px-6 py-8 md:px-10 md:py-10">
        <div className="rounded-sm border border-bp-blueGum/10 bg-bp-sand px-5 py-5 md:px-6">
          <p className="text-xs font-semibold uppercase text-bp-eucalypt">
            Before you read your results
          </p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-bp-blueGum/76">
            <p>
              These results give you a clear starting point - what the planning
              framework says is possible on a block like yours, based on your
              zone and size. For most homeowners, what you&apos;ll see below
              reflects what&apos;s genuinely available to you.
            </p>
            <p>
              One thing worth checking alongside your results: your Crown lease.
              All Canberra homes are held under a Crown lease rather than
              freehold title, and some leases limit what can be built regardless
              of what the planning framework permits. If you&apos;re not sure,
              it&apos;s easy to check - your lease purpose clause is available
              through Access Canberra or your title documents.
            </p>
            <p>
              For anything beyond what&apos;s covered here, see the bottom of
              this page - and your options on the right.
            </p>
          </div>
        </div>

        <div className="mt-8 border-b border-bp-blueGum/12 pb-3">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-bp-eucalypt">
            What the current planning rules allow on a property this size
          </p>
        </div>

        <div className="mt-6 space-y-4">
          {cards.map((card) => {
            const isExpanded = Boolean(expandedCards[card.key]);
            const bodyId = `report-card-${card.key}-body`;
            const statusStyles =
              card.status === "possible"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : card.status === "review"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-stone-200 bg-stone-50 text-stone-700";
            const statusLabel =
              card.status === "possible"
                ? "Possible"
                : card.status === "review"
                  ? "Needs review"
                  : "Not available";

            return (
              <article
                key={card.key}
                className="rounded-sm border border-bp-blueGum/10 bg-white p-5 shadow-[0_10px_28px_rgba(73,79,74,0.06)] md:p-6"
              >
                <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-start">
                  <button
                    type="button"
                    className="group block w-full rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bp-eucalypt"
                    aria-expanded={isExpanded}
                    aria-controls={bodyId}
                    onClick={() => toggleCard(card.key)}
                  >
                    <h4 className="text-xl font-semibold text-bp-blueGum transition-colors group-hover:text-bp-eucalypt">
                      {card.title}
                    </h4>
                    <p className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-bp-blueGum/55">
                      {card.technical}
                    </p>
                  </button>

                  <div className="flex flex-col items-start gap-2 md:items-end">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusStyles}`}
                    >
                      {statusLabel}
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-sm text-xs font-semibold uppercase tracking-[0.12em] text-bp-eucalypt transition-colors hover:text-bp-blueGum focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bp-eucalypt"
                      aria-expanded={isExpanded}
                      aria-controls={bodyId}
                      onClick={() => toggleCard(card.key)}
                    >
                      {isExpanded ? "Show less" : "See more"}
                      <ChevronDown
                        className={`size-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div
                    id={bodyId}
                    className="mt-5 border-t border-bp-blueGum/10 pt-5"
                  >
                    {renderReportText(card.body)}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {!cards.length && (
          <p className="py-20 text-center text-lg text-bp-blueGum/70">
            We couldn&apos;t build the summary cards for this zone from the
            current rule set.
          </p>
        )}

        <div className="mt-8 rounded-sm border border-bp-blueGum/10 bg-white px-5 py-5 md:px-6">
          <h4 className="text-lg font-semibold text-bp-blueGum">
            There is more to the picture
          </h4>
          <div className="mt-4 space-y-4 text-sm leading-7 text-bp-blueGum/76">
            <p>
              These results are based on your block&apos;s zone and size.
              What&apos;s actually possible depends on what&apos;s already
              there. Here&apos;s what we look at more closely in the paid
              report.
            </p>
            <p>
              <strong>Trees.</strong> Registered and regulated trees on your
              block can affect where a second dwelling can go and how much
              usable space you have.
            </p>
            <p>
              <strong>Easements.</strong> An easement is a right that allows
              someone else to use part of your land for a specific purpose -
              common examples are stormwater drains, gas lines, or shared
              driveways. Depending on where an easement sits on your block, it
              can limit where a second dwelling can go. Your title may also have
              easements that don&apos;t show up in standard mapping.
            </p>
            <p>
              <strong>Sewer.</strong> Where your sewer connection sits affects
              where a second dwelling can be serviced and what it costs.
            </p>
            <p>
              <strong>Heritage.</strong> If your property is within a heritage
              overlay, development proposals need to respond to heritage
              requirements. The paid report includes a referral to a trusted
              heritage architect for a preliminary assessment.
            </p>
            <p>
              <strong>Additional planning controls.</strong> Depending on your
              suburb and what you&apos;re planning, district policies and
              subdivision requirements may also apply. We can advise on these
              separately - get in touch if this is relevant to your project.
            </p>
            <p>
              <strong>Lease Variation Charge.</strong> If you&apos;re
              considering adding dwellings to your block, an LVC may apply when
              you seek to separately title additional dwellings. This applies
              across all residential zones and the amount varies by suburb, zone
              and number of dwellings. The paid report provides further context
              and links to relevant resources.
            </p>
            <p>
              <strong>Ready to go further?</strong> See the options on the
              right.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-sm border border-bp-blueGum/10 bg-bp-sand px-5 py-5 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bp-eucalypt">
            Disclaimer
          </p>
          <p className="mt-3 text-sm leading-7 text-bp-blueGum/72">
            General information only, not professional advice. Results are based
            on block size and zone - site conditions are assessed separately.{" "}
            <Link
              to="/disclaimer"
              className="font-semibold underline underline-offset-3"
            >
              Read our full disclaimer.
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-bp-blueGum/10 bg-stone-50 px-6 py-4 text-xs uppercase tracking-[0.16em] text-bp-blueGum/55 md:flex-row md:items-center md:justify-between md:px-10">
        <span>blockplanner.com.au</span>
        <span>Covers freestanding houses in RZ1 and RZ2 only</span>
      </div>
    </div>
  );
};

export default ReportContent;
