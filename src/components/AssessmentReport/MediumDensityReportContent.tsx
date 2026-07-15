import type { GeoApi } from "@/@types/api";
import Button from "@/components/ui/Button";
import { ArrowRight, FileText, Phone } from "lucide-react";

type Props = {
  report?: GeoApi;
  savedAddress: string;
  onRequestCall: () => void;
  onGetLease: () => void;
};

const MEDIUM_DENSITY_HEIGHTS: Record<string, number> = {
  RZ3: 4,
  RZ4: 6,
};

export const MediumDensityReportContent = ({
  report,
  savedAddress,
  onRequestCall,
  onGetLease,
}: Props) => {
  const zoneCode = (
    report?.zone.zoneCode ||
    report?.lotCheckRules.zoneCode ||
    ""
  ).toUpperCase();
  const storeys = MEDIUM_DENSITY_HEIGHTS[zoneCode];
  const address = report?.formattedAddress || savedAddress;
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapQuery =
    typeof report?.location?.lat === "number" &&
    typeof report?.location?.lng === "number"
      ? `${report.location.lat},${report.location.lng}`
      : encodeURIComponent(address);
  const mapSrc = apiKey
    ? `https://maps.googleapis.com/maps/api/staticmap?size=1100x420&scale=2&zoom=18&maptype=satellite&markers=color:0xC4622D|${mapQuery}&key=${apiKey}`
    : undefined;

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
          Free tool
        </p>
      </div>

      <div className="border-b border-bp-blueGum/10 bg-bp-sand px-6 py-6 md:px-10">
        <h3 className="text-2xl font-semibold leading-tight text-bp-blueGum md:text-[2rem]">
          {address.replace(", Australia", "")}
        </h3>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
          <span className="rounded-full bg-bp-blueGum px-3 py-1 font-medium uppercase tracking-[0.12em] text-bp-sand">
            {zoneCode}
          </span>
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
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-bp-eucalypt">
          Medium-density planning
        </p>
        <h3 className="mt-3 text-3xl font-semibold leading-tight text-bp-blueGum md:text-4xl">
          Your block is in {zoneCode}
        </h3>

        <div className="mt-6 space-y-5 text-[0.96rem] leading-7 text-bp-blueGum/78">
          <p>
            This zone allows medium-density development including townhouses,
            terrace houses, and apartments.
          </p>
          <p>
            Block size alone doesn&apos;t set a maximum number of dwellings here.
            What you can build comes down to how well a design uses the site
            within the limits that apply: a height limit for multi-unit housing
            ({storeys} storeys in your case), site coverage of no more than 50%
            of the block, and meeting the Residential Policy assessment
            outcomes.
          </p>
          <p>
            Depending on your proposal, other planning documents would apply
            too: District Policies (what&apos;s expected in your part of Canberra),
            Design Guides (how the building should look) and Technical
            Specifications (the detail).
          </p>
        </div>

        <div className="mt-7 rounded-sm border border-bp-eucalypt/20 bg-bp-sand px-5 py-5 md:px-6">
          <p className="text-lg font-semibold leading-7 text-bp-blueGum">
            This zone opens up other options too, including a secondary
            residence, unit titling and block subdivision.
          </p>
        </div>

        <div className="mt-7 space-y-5 text-[0.96rem] leading-7 text-bp-blueGum/78">
          <p>
            What&apos;s worth doing depends on your site, your street, and
            what&apos;s selling in your suburb. It also depends on what you&apos;re
            trying to get out of it, and what you&apos;re willing to take on.
          </p>
          <p>
            Leave your details and we&apos;ll call you within two business days to
            understand what would be useful. This could include a massing study
            showing what fits on your site, a feasibility model on whether the
            numbers work, or an introduction to a trusted builder, architect or
            developer.
          </p>
        </div>

        <div className="mt-8 border-t border-bp-blueGum/10 pt-8">
          <Button
            label="Request a call"
            leftIcon={<Phone className="size-5" />}
            rightIcon={<ArrowRight className="size-4" />}
            onClick={onRequestCall}
            className="min-h-13 w-full px-6 text-base md:w-auto"
          />
        </div>

        <div className="mt-8 rounded-sm border border-bp-blueGum/10 bg-white px-5 py-5 shadow-[0_10px_28px_rgba(73,79,74,0.06)] md:px-6 md:py-6">
          <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h4 className="text-xl font-semibold text-bp-blueGum">
                Would you rather start with your Crown lease?
              </h4>
              <p className="mt-3 text-sm leading-7 text-bp-blueGum/72">
                Your Crown lease sets its own limits on top of the planning
                rules. We&apos;ll send you a copy from government records, with a
                summary of what it means for your block.
              </p>
            </div>
            <Button
              label="Get my lease - $149"
              variant="outline"
              leftIcon={<FileText className="size-5" />}
              onClick={onGetLease}
              className="min-h-13 w-full whitespace-nowrap px-6 md:w-auto"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-bp-blueGum/10 bg-stone-50 px-6 py-4 text-xs uppercase tracking-[0.16em] text-bp-blueGum/55 md:flex-row md:items-center md:justify-between md:px-10">
        <span>blockplanner.com.au</span>
        <span>Tailored guidance for {zoneCode}</span>
      </div>
    </div>
  );
};

export default MediumDensityReportContent;
