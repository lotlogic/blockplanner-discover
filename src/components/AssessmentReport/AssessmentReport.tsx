import type { GeoApi } from "@/@types/api";
import Heading from "@/components/ui/Heading";
import {
  trackCtaClick,
  trackEvent,
  trackLookupPerformed,
} from "@/utils/analytics";
import { classList } from "@/utils/tailwind";
import { useLocalStorage, useSessionStorage } from "@uidotdev/usehooks";
import { motion as m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ErrorMessage from "./ErrorMessage";
import LoadingMessage from "./LoadingMessage";
import CrownLeaseCheckoutModal from "./CrownLeaseCheckoutModal";
import MediumDensityContactModal from "./MediumDensityContactModal";
import MediumDensityReportContent from "./MediumDensityReportContent";
import OffZoneForm, { type OffZoneFormValues } from "./OffZoneForm";
import ReportContent from "./ReportContent";
import UpdatesSubscribeModal from "./UpdatesSubscribeModal";

type ReportSaves = Record<string, { email: string; expiry: number }>;
const MIN_LOADING_MS = 1800;

export const FreeBlockAssessmentReport = () => {
  const [report, setReport] = useState<GeoApi>();
  const [isLoading, setIsLoading] = useState(true);
  const [, setIsOffZone] = useState(false);
  const [showOffZone, setShowOffZone] = useState(false);
  const [error, setError] = useState<string>();
  const [email, setEmail] = useState<string>();
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);

  const hasTrackedLookup = useRef(false);

  const [searchParams] = useSearchParams();
  const [savedAddress, setSavedAddress] = useSessionStorage("address", "");
  const [savedSearches, setSavedSearches] = useLocalStorage<ReportSaves>(
    "searches",
    {},
  );

  /****************************************************
    fetch API data
  ****************************************************/
  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setReport(undefined);
    setError(undefined);
    setEmail(undefined);
    setIsOffZone(false);
    setShowOffZone(false);
    hasTrackedLookup.current = false;

    const fetchData = async () => {
      const startedAt = Date.now();
      try {
        const address = searchParams.get("address");
        const lat = searchParams.get("lat");
        const lng = searchParams.get("lng");

        if (!address && (!lat || !lng))
          throw new Error("Missing query parameter - address");

        const params = new URLSearchParams();
        if (lat && lng) {
          params.set("lat", lat);
          params.set("lng", lng);
          if (address) params.set("address", address);
        } else if (address) {
          params.set("address", address);
        }

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/geo/act-zone?${params.toString()}`,
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        if (!cancelled) setReport(result);
      } catch (error: any) {
        if (!cancelled) setError(error.message);
      } finally {
        const elapsed = Date.now() - startedAt;
        const waitFor = Math.max(0, MIN_LOADING_MS - elapsed);

        if (waitFor > 0) {
          await new Promise((resolve) => window.setTimeout(resolve, waitFor));
        }

        if (!cancelled) setIsLoading(false);
      }
    };

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  /****************************************************
    tracking for successful lookup
  ****************************************************/
  useEffect(() => {
    if (!report || hasTrackedLookup.current) return;
    trackLookupPerformed(report, { address: report.formattedAddress });
    hasTrackedLookup.current = true;
  }, [report]);

  /****************************************************
    restore contact details and handle unsupported zones
  ****************************************************/
  useEffect(() => {
    if (!report?.formattedAddress || isLoading) return;

    // Save the current address for checkout and return links.
    setSavedAddress(report.formattedAddress);

    // clear expired saves
    const time = new Date().getTime();
    let newSaves = { ...savedSearches };
    Object.entries(savedSearches).forEach(([key, value]) => {
      if (value.expiry < time) delete newSaves[key];
    });

    // persist if we removed anything
    if (Object.keys(newSaves).length !== Object.keys(savedSearches).length)
      setSavedSearches(newSaves);

    // check for current save (using de-expired saves)
    const currentSave = newSaves[report.formattedAddress];
    setEmail(currentSave?.email);

    const zoneCode = (
      report.zone.zoneCode ||
      report.lotCheckRules.zoneCode ||
      ""
    ).toUpperCase();
    const isStandardReportZone = ["RZ1", "RZ2"].includes(zoneCode);
    const isMediumDensityZone = ["RZ3", "RZ4"].includes(zoneCode);
    const isOtherZone = !isStandardReportZone && !isMediumDensityZone;

    setIsOffZone(isOtherZone);
    setShowOffZone(isOtherZone && !currentSave);
  }, [report, isLoading]);

  const zoneCode = (
    report?.zone.zoneCode ||
    report?.lotCheckRules.zoneCode ||
    ""
  ).toUpperCase();
  const isMediumDensityZone = ["RZ3", "RZ4"].includes(zoneCode);

  /****************************************************
    checkout data for payload
  ****************************************************/
  const checkoutData = {
    email,
    address: report?.formattedAddress || savedAddress,
    suburb: report?.block?.properties?.DIVISION_NAME || undefined,
    zone: zoneCode,
    blockSizeM2: report?.lotCheckRules?.blockAreaSqm,
  };

  const openContactModal = () => {
    trackCtaClick("request_medium_density_call", {
      address: checkoutData.address,
      zone: zoneCode,
      block_size: checkoutData.blockSizeM2,
    });
    setContactModalOpen(true);
  };

  const openLeaseModal = () => {
    trackCtaClick("purchase_crown_lease", {
      address: checkoutData.address,
      zone: zoneCode,
      block_size: checkoutData.blockSizeM2,
      location: "medium_density_result",
    });
    setLeaseModalOpen(true);
  };

  const openSubscribeModal = () => {
    trackCtaClick("subscribe_planning_updates", {
      address: checkoutData.address,
      zone: zoneCode,
      block_size: checkoutData.blockSizeM2,
      location: "medium_density_result",
    });
    setSubscribeModalOpen(true);
  };

  /****************************************************
    handle forms
  ****************************************************/
  const handleOffZone = async (formData: OffZoneFormValues) => {
    const addressKey = report?.formattedAddress || savedAddress;
    if (addressKey) {
      const userData = {
        address: addressKey,
        name: formData.clientName,
        email: formData.email,
        phone: formData.clientPhone,
        intent: formData.intent,
      };

      try {
        if (!formData.email) throw new Error("Missing query parameter - email");
        if (!addressKey) throw new Error("Missing query parameter - address");
        if (!location.origin) throw new Error("Missing query parameter - site");

        trackEvent("feasibility_form_submit", {
          ...userData,
          message: "This is an off zone enquiry",
          timestamp: new Date().toISOString(),
        });

        // Submit the contact request to the configured backend workflow.
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/enquiry/get-in-touch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...userData,
              requestType: "Off-zone enquiry",
              message: "This is an off-zone enquiry",
              company: formData.company,
            }),
          },
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
      } catch (error: any) {
        trackEvent("feasibility_form_error", {
          ...userData,
          message: error?.message,
          timestamp: new Date().toISOString(),
        });
        console.log("Error: " + error.message);
      }

      // save the search to localstorage
      let newSaves = { ...savedSearches };
      newSaves[addressKey] = {
        email: formData.email,
        expiry: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      };
      setSavedSearches(newSaves);
      setSavedAddress(addressKey);
      setShowOffZone(false);
    }
  };

  return (
    <>
      <OffZoneForm
        isOpen={showOffZone}
        setIsOpen={setShowOffZone}
        address={report?.formattedAddress || savedAddress}
        onSubmit={handleOffZone}
      />

      <MediumDensityContactModal
        isOpen={contactModalOpen}
        setIsOpen={setContactModalOpen}
        address={checkoutData.address}
        zone={zoneCode}
        email={email}
      />

      <CrownLeaseCheckoutModal
        isOpen={leaseModalOpen}
        setIsOpen={setLeaseModalOpen}
        email={email}
        address={checkoutData.address}
        suburb={checkoutData.suburb}
        zone={zoneCode}
        blockSizeM2={checkoutData.blockSizeM2}
      />

      {subscribeModalOpen && (
        <UpdatesSubscribeModal
          isOpen={subscribeModalOpen}
          setIsOpen={setSubscribeModalOpen}
          email={email}
          address={checkoutData.address}
          zone={zoneCode}
        />
      )}

      <section
        className={classList([
          "mt-12 container mx-auto px-4 pb-12",
          {
            "blur-xs":
              showOffZone ||
              contactModalOpen ||
              leaseModalOpen ||
              subscribeModalOpen,
          },
        ])}
      >
        <div className="mx-auto w-full lg:max-w-260">
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
          >
            <Heading tag="h1" size="h1">
              Here&apos;s your snapshot
            </Heading>
          </m.div>
          <m.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative mt-10"
          >
            <div className="overflow-hidden rounded-sm bg-white shadow-[-10px_0_22px_rgba(0,0,0,0.08),0_18px_50px_rgba(0,0,0,0.12)]">
              {isLoading ? (
                <LoadingMessage />
              ) : error ? (
                <ErrorMessage error={error} />
              ) : isMediumDensityZone ? (
                <MediumDensityReportContent
                  report={report}
                  savedAddress={savedAddress}
                  onRequestCall={openContactModal}
                  onGetLease={openLeaseModal}
                  onSubscribe={openSubscribeModal}
                />
              ) : (
                <ReportContent
                  report={report}
                  savedAddress={savedAddress}
                  checkoutData={checkoutData}
                />
              )}
            </div>
          </m.div>

          {(isLoading || error || isMediumDensityZone) && (
            <section className="text-gray-400 text-center mt-8">
              General information only, not professional advice. Results are
              based on block size and zone - site conditions are assessed
              separately.{" "}
              <Link
                to="/disclaimer"
                className="font-medium underline underline-offset-3"
              >
                Read our full disclaimer.
              </Link>
            </section>
          )}
        </div>
      </section>
    </>
  );
};

export default FreeBlockAssessmentReport;
