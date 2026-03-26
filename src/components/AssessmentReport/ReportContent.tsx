import type { GeoApi } from "@/@types/api";
import { toTitleCase } from "@/utils/text";
import { buildFreeReportCards } from "./free-report";

type Props = {
  savedAddress: string;
  report?: GeoApi;
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
        <div className="border-b border-bp-blueGum/12 pb-3">
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
                  <p className="mt-4 text-sm leading-7 text-bp-blueGum/78 md:text-[0.96rem]">
                    {card.body}
                  </p>
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

        <div className="mt-8 rounded-sm border border-bp-blueGum/10 bg-bp-sand px-5 py-5 md:px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bp-eucalypt">
            Disclaimer
          </p>
          <p className="mt-3 text-sm leading-7 text-bp-blueGum/72">
            General information only, not professional advice. Covers
            freestanding houses in RZ1 and RZ2 zones. Based on block size and
            zoning, site conditions may vary. Trees, setbacks, easements,
            overlays and the position of the existing home can change what is
            realistic in practice.
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
