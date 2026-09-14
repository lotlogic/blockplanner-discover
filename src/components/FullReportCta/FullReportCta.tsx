import InfoGraphic from "@/images/blueprint.svg?react";
// import InfoGraphic from "@/images/house.svg?react";
import Button from "@/components//ui/Button";
import Heading from "@/components//ui/Heading";
import { trackCtaClick } from "@/utils/analytics";
import { classList } from "@/utils/tailwind";
import { motion as m } from "framer-motion";
import { ArrowUp, FileText } from "lucide-react";
import { useState } from "react";
import ContactModal from "./ContactModal";
import { PaymentModal, type CheckoutData } from "./PaymentModal";

type Props = {
  data?: CheckoutData;
  isDisabled: boolean;
  location: "mobile" | "desktop" | "inline";
};

export const FullReportCta = ({ data, isDisabled, location }: Props) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const ctaLocation =
    location === "mobile"
      ? "report_sticky"
      : location === "inline"
        ? "report_inline"
        : "report_sidebar";

  const ctaClasses =
    location === "mobile"
      ? classList([
          "bg-white",
          "lg:hidden",
          "fixed bottom-0 left-0 right-0 z-50",
          "border-t border-gray-200",
          "shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] transition-transform duration-500",
          { "translate-y-full": isDisabled },
        ])
      : classList(["hidden lg:block w-80 sticky top-8 pt-20 "]);

  const bodyClasses =
    location === "mobile"
      ? "flex flex-col gap-4 px-4 py-8 mx-auto max-w-[80ch]"
      : "border border-gray-200 rounded-md px-5 py-10 shadow-sm flex flex-col gap-4";

  const openPaymentModal = () => {
    if (!isDisabled) {
      trackCtaClick("purchase_full_report", {
        address: data?.address,
        zone: data?.zone,
        block_size: data?.blockSizeM2,
        location: ctaLocation,
      });
      setPayModalOpen(true);
    }
  };

  if (location === "inline") {
    return (
      <m.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15, ease: "easeOut" }}
        className="rounded-sm border border-bp-blueGum/10 bg-bp-sand px-6 py-8 md:px-8 md:py-9"
      >
        <div className="flex flex-wrap items-start gap-9">
          <div className="min-w-0 flex-1 basis-75">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-bp-eucalypt">
              The next step, if you want it
            </p>
            <Heading tag="h3" size="h3" className="mt-3 mb-0!">
              A full report looks at what&apos;s on the ground
            </Heading>
            <p className="mt-4 text-sm leading-7 text-bp-blueGum/76">
              We check each of the factors above against your title and
              current imagery, then set out what they mean for your block, so
              you get an honest picture of what&apos;s worth pursuing.
            </p>
            <p className="mt-4 text-sm leading-7 text-bp-blueGum/76">
              Already know it&apos;s worth pursuing? Talk to Mitch directly.
              We can kick off the planning and approvals process and manage
              the project right through to approval, and we also do
              financial feasibilities and massing studies.
            </p>
          </div>

          <div className="min-w-0 flex-1 basis-75 rounded-sm border border-bp-blueGum/10 bg-white px-6 py-6">
            <div className="flex flex-col gap-1">
              <span className="text-3xl font-bold text-bp-blueGum">
                $299
              </span>
              <span className="text-sm text-bp-blueGum/62">
                Delivered within 48 hours
              </span>
            </div>
            <div className="my-5 border-t border-bp-blueGum/10" />
            <Button
              label="Order your report"
              leftIcon={<FileText className="size-5" />}
              className={classList([
                "w-full px-6 py-4",
                { "animate-attention": !isDisabled },
              ])}
              onClick={openPaymentModal}
              disabled={isDisabled}
            />
            <Button
              label="Talk to Mitch directly"
              variant="outline"
              className="mt-2.5 min-h-13 w-full border-bp-blueGum/12! bg-white! px-6 py-4 text-bp-blueGum! hover:bg-gray-50! hover:text-bp-blueGum! focus-visible:bg-gray-50! focus-visible:text-bp-blueGum! focus-visible:outline-bp-blueGum!"
              onClick={() => setContactModalOpen(true)}
            />
            <p className="mt-3 text-xs text-bp-blueGum/55">
              Based on current satellite imagery and publicly available
              spatial data. Site conditions may have changed.
            </p>
          </div>
        </div>

        <PaymentModal
          isOpen={payModalOpen}
          setIsOpen={setPayModalOpen}
          ctaLocation={ctaLocation}
          email={data?.email}
          address={data?.address}
          suburb={data?.suburb}
          blockSizeM2={data?.blockSizeM2}
          zone={data?.zone}
        />

        <ContactModal
          isOpen={contactModalOpen}
          setIsOpen={setContactModalOpen}
          email={data?.email}
          address={data?.address}
        />
      </m.div>
    );
  }

  // animation
  const initial =
    location === "desktop" ? { opacity: 0, x: 100 } : { opacity: 0, y: 100 };
  const animate =
    location === "desktop" ? { opacity: 1, x: 0 } : { opacity: 1, y: 0 };

  return (
    <m.div
      initial={initial}
      animate={animate}
      transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
      className={ctaClasses}
    >
      <div
        className={classList([
          // "relative",
          "group",
          bodyClasses,
          "bg-white",
          "text-center",
          "text-sm",
          "text-gray-600",
          "rte",
        ])}
        data-state={drawerOpen ? "open" : "closed"}
      >
        <Button
          variant="outline"
          label="toggle drawer"
          leftIcon={<ArrowUp />}
          iconOnly
          className={classList([
            "absolute top-4 right-4 border-none lg:hidden",
            "group-data-[state=open]:transform-[scaleY(-1)]",
            "transition-all",
            "duration-500",
          ])}
          onClick={() => setDrawerOpen(!drawerOpen)}
        />

        <InfoGraphic width={70} className="mx-auto" fill="#494f4a" />

        <Heading tag="h3" size="h4" className="mt-0! mb-0">
          <span>Want to know what&apos;s actually realistic for your property?</span>
        </Heading>

        <div
          className={classList([
            "flex flex-col gap-4",
            "max-lg:max-h-54",
            "max-sm:max-h-40",
            "opacity-100",
            "overflow-hidden",
            "max-lg:transition-all",
            "duration-500",
            "max-lg:group-data-[state=closed]:max-h-0",
            "max-lg:group-data-[state=closed]:opacity-0",
          ])}
        >
          <p className="">
            These results are based on size and zone alone. The full report
            looks at what&apos;s physically on your land &mdash; where your home
            sits, rear yard depth, trees, easements and access &mdash; so you
            get an honest picture of what&apos;s worth pursuing.
          </p>

          <hr className="my-4 border-gray-300" />

          <div className="mb-4">
            <p className="text-base font-normal mb-2">
              Delivered within 48 hours
            </p>
            <p className="font-bold text-2xl">$299</p>
          </div>
        </div>

        <Button
          label="Request your report"
          leftIcon={<FileText className="size-5" />}
          className={classList([
            "w-full px-6 py-4 shadow-lg",
            { "animate-attention": !isDisabled },
          ])}
          onClick={openPaymentModal}
          disabled={isDisabled}
        />

        <div className="text-xs">
          Based on current satellite imagery and publicly available spatial
          data. Site conditions may have changed.
        </div>

        <div
          className={classList([
            "max-lg:max-h-20",
            "max-sm:max-h-10",
            "opacity-100",
            "overflow-hidden",
            "max-lg:transition-all",
            "duration-500",
            "max-lg:group-data-[state=closed]:max-h-0",
            "max-lg:group-data-[state=closed]:opacity-0",
          ])}
        >
          <p className="mt-4">
            Already know it&apos;s worth pursuing? Skip ahead and talk to us
            directly about a professional feasibility assessment covering your
            planning options, design and whether it&apos;s financially viable.
          </p>
          <Button
            label="Talk to us directly"
            variant="outline"
            className="mt-4 min-h-14 w-full border-bp-blueGum/12! bg-white! px-6 py-4 text-bp-blueGum! hover:bg-gray-50! hover:text-bp-blueGum! focus-visible:bg-gray-50! focus-visible:text-bp-blueGum! focus-visible:outline-bp-blueGum!"
            onClick={() => setContactModalOpen(true)}
          />
        </div>

        <PaymentModal
          isOpen={payModalOpen}
          setIsOpen={setPayModalOpen}
          ctaLocation={ctaLocation}
          // data
          email={data?.email}
          address={data?.address}
          suburb={data?.suburb}
          blockSizeM2={data?.blockSizeM2}
          zone={data?.zone}
        />

        <ContactModal
          isOpen={contactModalOpen}
          setIsOpen={setContactModalOpen}
          email={data?.email}
          address={data?.address}
        />
      </div>
    </m.div>
  );
};

export default FullReportCta;
