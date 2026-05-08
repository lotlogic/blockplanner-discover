import type { GeoApi } from "@/@types/api";
import { toTitleCase } from "@/utils/text";
import { buildFreeReportCards } from "./free-report";

const LVC_FORM_URL =
  "https://forms.monday.com/forms/316e54ed01893dd1b82597c400914642?r=apse2";

const LVC_WAIVER_URL =
  "https://www.revenue.act.gov.au/rates-and-property-charges/lease-variation-charge-lvc/rz1-lease-variation-charge-lvc-partial-waiver";

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
          <div className="mt-4 space-y-4 text-sm leading-7 text-bp-blueGum/76">
            <p>
              <strong>Your Crown lease.</strong> In the ACT, residential land is
              held under a Crown lease, not freehold title. Your lease has a
              purpose clause that says what can be built on the block. Many
              leases in Canberra are limited to a single dwelling. If yours is,
              that restriction applies regardless of what the planning rules
              permit - a lease variation through a development application is
              required before a second dwelling can be built or sold separately,
              and a Lease Variation Charge (LVC) applies. Depending on your
              suburb, this can range from around $46,000 to well over $300,000.
            </p>
            <p>
              If you are in RZ1 and considering dual occupancy, check whether
              you qualify for the{" "}
              <a
                href={LVC_WAIVER_URL}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-3"
              >
                ACT Government's RZ1 LVC Partial Waiver
              </a>
              .
            </p>
            <p>
              BlockPlanner is actively engaging with the ACT Government to push
              for fairer LVC treatment for resident-led projects. If the LVC
              would affect the feasibility of your project, we would like to
              hear from you.{" "}
              <a
                href={LVC_FORM_URL}
                target="_blank"
                rel="noreferrer"
                className="font-semibold underline underline-offset-3"
              >
                Share your experience with the LVC - takes 2 minutes
              </a>
              .
            </p>
            <p>
              <strong>Your easements.</strong> Your title may also have
              easements - legal rights held by third parties over part of your
              land. You cannot build over an easement, and depending where one
              sits it can significantly affect what is practical in the rear
              yard. The easement data in this report comes from ACTmapi
              deposited plans and is indicative only - not all easements
              registered on title will appear here. A title search confirms what
              actually applies.
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
                className="grid gap-4 rounded-sm border border-bp-blueGum/10 bg-white p-5 shadow-[0_10px_28px_rgba(73,79,74,0.06)] md:grid-cols-[1fr_auto] md:items-start md:p-6"
              >
                <div>
                  <h4 className="text-xl font-semibold text-bp-blueGum">
                    {card.title}
                  </h4>
                  <p className="mt-1 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-bp-blueGum/55">
                    {card.technical}
                  </p>
                  <div className="mt-4">{renderReportText(card.body)}</div>
                </div>

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${statusStyles}`}
                >
                  {statusLabel}
                </span>
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
            There is more to the picture.
          </h4>
          <div className="mt-4 space-y-4 text-sm leading-7 text-bp-blueGum/76">
            <p>
              The options above are based on your block size and zone. They tell
              you what the planning rules permit in principle. What actually
              works on your specific block depends on what is already there.
            </p>
            <p>
              <strong>Trees.</strong> Significant trees are protected under the
              Urban Forest Act 2023. A protected tree has a Tree Protection Zone
              - an area around the trunk and canopy where you cannot build or
              excavate without approval. Depending where trees sit, they can
              reduce usable space or rule out certain configurations entirely.
              This assessment flags significant trees based on canopy size from
              aerial imagery. We also separately check the ACTmapi Registered
              Trees layer - individually listed trees with a higher level of
              protection.
            </p>
            <p>
              <strong>Easements.</strong> Depending on where an easement sits on
              your block, it can significantly affect where a second dwelling
              can go. The paid report maps what's visible from ACTmapi for your
              specific block.
            </p>
            <p>
              <strong>Heritage.</strong> If the property is within a heritage
              overlay, development proposals need to respond to heritage
              requirements. Our assessment uses the ACTmapi heritage layer. If
              heritage applies, free preliminary advice may be available through
              the ACT Government's heritage architecture service.
            </p>
            <p>
              <strong>Sewer.</strong> Where the sewer connection sits affects
              where a second dwelling can be serviced and what it costs.
            </p>
            <p>
              <strong>District policies.</strong> Additional planning
              requirements may apply on top of zone rules depending on your
              suburb - particularly in the Inner North and City districts.
            </p>
            <p>
              <strong>Subdivision and Leasing Policy.</strong> For blocks where
              subdivision is being considered, NI2023-540 F01 (Subdivision
              Policy) and F02 (Leasing Policy) apply in addition to the zone
              rules. A registered town planner can advise on what this means for
              a specific proposal.
            </p>
            <p>
              This report is a preliminary read. It is not a professional
              feasibility assessment and does not replace advice from a
              registered town planner. The paid BlockPlanner report covers all
              of the above in detail for your specific block.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-sm border border-bp-blueGum/10 bg-bp-sand px-5 py-5 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bp-eucalypt">
            Disclaimer
          </p>
          <p className="mt-3 text-sm leading-7 text-bp-blueGum/72">
            General information only, not professional advice. Covers
            freestanding houses in RZ1 and RZ2 zones. Results based on block
            size and zone - site conditions assessed separately.
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
