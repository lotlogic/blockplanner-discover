import type { GeoApi } from "@/@types/api";
import type { CheckoutData } from "@/components/FullReportCta/PaymentModal";
import { FullReportCta } from "@/components/FullReportCta/FullReportCta";
import { toTitleCase } from "@/utils/text";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { buildFreeReportCards } from "./free-report";
import { StayInTheKnowForm } from "./StayInTheKnowForm";

type Props = {
  savedAddress: string;
  report?: GeoApi;
  checkoutData: CheckoutData;
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

export const ReportContent = ({
  report,
  savedAddress,
  checkoutData,
}: Props) => {
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>(
    {},
  );

  const zoneText = [
    report?.zone.zoneCode,
    toTitleCase(report?.zone.properties?.LAND_USE_POLICY_DESC),
  ]
    .filter(Boolean)
    .join(" · ");

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
      <div className="border-b border-bp-blueGum/10 bg-bp-sand px-6 py-6 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-bp-eucalypt">
            Free property snapshot
          </p>
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.24em] text-bp-blueGum/45">
            {reportMonth}
          </p>
        </div>
        <h3 className="mt-3 text-2xl font-semibold leading-tight text-bp-blueGum md:text-[2rem]">
          {address.replace(", Australia", "")}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
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
            Before you read on
          </p>
          <div className="mt-4 space-y-4 text-sm leading-6 text-bp-blueGum/76">
            <p>
              &apos;Zone allows&apos; means the zone and your block size
              allow it. That is all this snapshot has checked.
            </p>
            <p>
              It has not looked at what decides whether a project works on
              your block: your Crown lease, heritage, site access, trees,
              easements and sewer. Any one of these can change the answer. A
              full report checks each against your title and current
              imagery.
            </p>
            <p>
              Tap{" "}
              <strong className="font-semibold text-bp-blueGum">
                Learn more
              </strong>{" "}
              on any option for the detail.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-4">
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
                ? "Zone allows"
                : card.status === "review"
                  ? "Needs review"
                  : "Not available";

            return (
              <article
                key={card.key}
                className="rounded-sm border border-bp-blueGum/10 bg-white p-5 shadow-[0_10px_28px_rgba(73,79,74,0.06)] md:p-6"
              >
                <div className="flex items-center justify-between gap-4">
                  <button
                    type="button"
                    className="group block min-w-0 rounded-sm text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-bp-eucalypt"
                    aria-expanded={isExpanded}
                    aria-controls={bodyId}
                    onClick={() => toggleCard(card.key)}
                  >
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.14em] ${card.status === "possible" ? "normal-case" : "uppercase"} ${statusStyles}`}
                    >
                      {statusLabel}
                    </span>
                    <h4 className="mt-3 text-xl font-semibold text-bp-blueGum transition-colors group-hover:text-bp-eucalypt">
                      {card.title}
                    </h4>
                    <p className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-bp-blueGum/55">
                      {card.technical}
                    </p>
                  </button>

                  <button
                    type="button"
                    className="inline-flex shrink-0 items-center gap-1 rounded-sm text-xs font-semibold uppercase tracking-[0.12em] text-bp-eucalypt transition-colors hover:text-bp-blueGum focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-bp-eucalypt"
                    aria-expanded={isExpanded}
                    aria-controls={bodyId}
                    onClick={() => toggleCard(card.key)}
                  >
                    {isExpanded ? "Show less" : "Learn more"}
                    <ChevronDown
                      className={`size-4 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      aria-hidden="true"
                    />
                  </button>
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
            Here&apos;s what would be assessed next
          </h4>
          <div className="mt-4 space-y-4 text-sm leading-7 text-bp-blueGum/76">
            <p>
              These results are based on your property&apos;s zone and size.
              Whether a project is achievable depends on more than that.
              Here&apos;s what we&apos;d look at next.
            </p>
            <p>
              <strong>Crown lease.</strong> All Canberra homes are held under
              a Crown lease rather than freehold title, and some leases limit
              what can be built regardless of what the planning framework
              permits. Your lease purpose clause is available through Access
              Canberra or your title documents.
            </p>
            <p>
              <strong>Trees.</strong> Registered and regulated trees on your
              block can affect where a second dwelling can go and how much
              usable space you have.
            </p>
            <p>
              <strong>Easements.</strong> An easement is a right that allows
              someone else to use part of your land for a specific purpose,
              such as stormwater drains, gas lines, or shared driveways.
              Depending on where an easement sits on your block, it can limit
              where a second dwelling can go. Your title may also have
              easements that don&apos;t show up in standard mapping.
            </p>
            <p>
              <strong>Sewer.</strong> Where your sewer connection sits affects
              where a second dwelling can be serviced and what it costs.
            </p>
            <p>
              <strong>Heritage.</strong> If your property is within a heritage
              overlay, development proposals need to respond to heritage
              requirements. This may include input from a heritage architect.
            </p>
            <p>
              <strong>Additional planning controls.</strong> Depending on your
              suburb and what you&apos;re planning, district policies and
              subdivision requirements may also apply.
            </p>
            <p>
              <strong>Lease Variation Charge.</strong> If you&apos;re
              considering adding dwellings to your block, an LVC may apply when
              you seek to separately title additional dwellings. This applies
              across all residential zones and the amount varies by suburb, zone
              and number of dwellings.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <FullReportCta
            data={checkoutData}
            isDisabled={false}
            location="inline"
          />
        </div>

        <div className="mt-8 border-t border-bp-blueGum/10 pt-8">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-bp-eucalypt">
            The person behind this
          </p>

          <div className="mt-5 flex flex-wrap items-start gap-6">
            <a
              href="https://www.linkedin.com/in/mqporteous/"
              aria-label="Mitch Porteous on LinkedIn"
              target="_blank"
              rel="noreferrer"
              className="block shrink-0"
            >
              <img
                src={`${import.meta.env.BASE_URL}images/team/mitch-porteous.avif`}
                alt="Mitch Porteous"
                className="h-31 w-26 rounded-sm object-cover"
              />
            </a>
            <div className="min-w-0 flex-1 basis-70">
              <div className="flex items-center gap-2.5">
                <span className="text-lg font-semibold text-bp-blueGum">
                  Mitch Porteous
                </span>
                <a
                  href="https://www.linkedin.com/in/mqporteous/"
                  aria-label="Mitch Porteous on LinkedIn"
                  target="_blank"
                  rel="noreferrer"
                  className="flex size-6.5 items-center justify-center rounded-full border border-bp-blueGum/15 transition-colors hover:bg-bp-blueGum/5"
                >
                  <img
                    src={`${import.meta.env.BASE_URL}images/team/linkedin.png`}
                    alt=""
                    className="size-3.5"
                  />
                </a>
              </div>
              <p className="mt-1 text-sm text-bp-eucalypt">
                Founder, BlockPlanner · a Canberra planning and advocacy
                practice
              </p>
              <p className="mt-3 text-sm leading-7 text-bp-blueGum/76">
                We built this tool so you can see what&apos;s possible before
                spending money on specialist consultants or chasing
                government.
              </p>
              <p className="mt-3 text-sm leading-7 text-bp-blueGum/76">
                <a
                  href="https://region.com.au/empower-owner-occupiers-tax-hit-puts-missing-middle-out-of-reach-for-small-players-says-submission/996456/"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-primary underline underline-offset-3"
                >
                  In the news
                </a>
                , Region Canberra, 5 September 2026.
              </p>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-start gap-6 border-t border-bp-blueGum/10 pt-6">
            <div className="min-w-0 flex-1 basis-65">
              <p className="text-base font-semibold text-bp-blueGum">
                Stay in the know
              </p>
              <p className="mt-1.5 text-sm leading-6 text-bp-blueGum/68">
                What&apos;s changing in ACT planning, what the Lease Variation
                Charge is doing to project numbers, and what we learn from
                real Canberra blocks. Sent when there is something worth
                knowing.
              </p>
            </div>
            <StayInTheKnowForm
              address={address}
              zone={report?.zone.zoneCode ?? undefined}
            />
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
        <span>
          This tool covers freestanding houses in RZ1 and RZ2.
          <br />
          We advise on RZ3 and RZ4 separately.
        </span>
      </div>
    </div>
  );
};

export default ReportContent;
