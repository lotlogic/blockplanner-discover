import type { GeoApi } from "@/@types/api";
import Heading from "@/components/ui/Heading";
import {
  identifyUser,
  trackCtaClick,
  trackEvent,
  trackLookupPerformed,
} from "@/utils/analytics";
import { classList } from "@/utils/tailwind";
import { useLocalStorage, useSessionStorage } from "@uidotdev/usehooks";
import { motion as m } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FullReportCta } from "../FullReportCta/FullReportCta";
import ErrorMessage from "./ErrorMessage";
import GatedContentForm, {
  type GatedContentFormValues,
} from "./GatedContentForm";
import LoadingMessage from "./LoadingMessage";
import OffZoneForm, { type OffZoneFormValues } from "./OffZoneForm";
import ReportContent from "./ReportContent";

type ReportSaves = Record<string, { email: string; expiry: number }>;
const MIN_LOADING_MS = 1800;

export const FreeBlockAssessmentReport = () => {
  const [report, setReport] = useState<GeoApi>();
  const [isLoading, setIsLoading] = useState(true);
  const [isOffZone, setIsOffZone] = useState(false);
  const [showOffZone, setShowOffZone] = useState(false);
  const [isGated, setIsGated] = useState(false);
  const [error, setError] = useState<string>();
  const [email, setEmail] = useState<string>();

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
    show gated content if it is a saved search
  ****************************************************/
  useEffect(() => {
    if (!report?.formattedAddress) return;

    // save current address for checkout (and key for gated content)
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
    if (currentSave) setEmail(currentSave.email);

    // check property zoning
    if (!["RZ1", "RZ2"].includes(report.zone.zoneCode || "")) {
      setIsOffZone(true);
      setShowOffZone(!currentSave);
    }

    // check gated content
    setIsGated(!currentSave);
  }, [report]);

  /****************************************************
    checkout data for payload
  ****************************************************/
  const checkoutData = {
    email,
    address: report?.formattedAddress || savedAddress,
    suburb: report?.block?.properties?.DIVISION_NAME || undefined,
    zone: report?.lotCheckRules?.zoneCode || report?.zone?.zoneCode || "",
    blockSizeM2: report?.lotCheckRules?.blockAreaSqm,
  };

  /****************************************************
    handle forms
  ****************************************************/
  const handleGatedContent = (formData: GatedContentFormValues) => {
    const addressKey = report?.formattedAddress || savedAddress;
    if (addressKey) {
      identifyUser(formData.email, {
        address: addressKey,
        zone: report?.lotCheckRules?.zoneCode ?? report?.zone?.zoneCode ?? null,
        block_size: report?.lotCheckRules?.blockAreaSqm ?? null,
        parcel_id:
          report?.block?.blockKey ??
          (report?.block?.objectId != null
            ? String(report.block.objectId)
            : null),
      });

      trackCtaClick("view_report", { address: addressKey });
      trackEvent("gated_email_submit", {
        address: addressKey,
        email: formData.email,
        timestamp: new Date().toISOString(),
      });

      // save the search to localstorage
      let newSaves = { ...savedSearches };
      newSaves[addressKey] = {
        email: formData.email,
        expiry: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      };
      setSavedSearches(newSaves);

      // save email for payment form
      setEmail(formData.email);

      // keep session address in sync (used for checkout return link)
      setSavedAddress(addressKey);

      // show content
      setIsGated(false);
    }
  };

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

        // send email
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/enquiry/get-in-touch`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ...userData, company: formData.company }),
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

      {!isOffZone && isGated && (
        <GatedContentForm onSubmit={handleGatedContent} />
      )}

      <section
        className={classList([
          "mt-12 container mx-auto px-4 pb-60 lg:pb-12",
          { "blur-xs": showOffZone || isGated },
        ])}
      >
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex-1 w-full lg:max-w-260">
            <m.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
            >
              <Heading tag="h1" size="h1">
                Your block assessment
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
                ) : (
                  <ReportContent report={report} savedAddress={savedAddress} />
                )}
              </div>
            </m.div>

            <section className="text-gray-400 text-center mt-8">
              General information only, not professional advice. Results are
              based on block size and zone - site conditions are assessed
              separately.{" "}
              <a
                href="/disclaimer"
                className="font-medium underline underline-offset-3"
              >
                Read our full disclaimer.
              </a>
            </section>
          </div>

          <FullReportCta
            data={{
              ...checkoutData,
            }}
            isDisabled={isLoading || isGated || isOffZone || !!error}
            location="desktop"
          />
        </div>
      </section>

      <FullReportCta
        data={{
          ...checkoutData,
        }}
        isDisabled={isLoading || isGated || isOffZone || !!error}
        location="mobile"
      />
    </>
  );
};

export default FreeBlockAssessmentReport;
