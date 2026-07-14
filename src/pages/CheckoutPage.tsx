import Main from "@/components/layouts/Main";
import Heading from "@/components/ui/Heading";
import { trackCtaClick, trackEvent } from "@/utils/analytics";
import { classList } from "@/utils/tailwind";
import { useSessionStorage } from "@uidotdev/usehooks";
import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

export const CheckoutPage = () => {
  const [status, setStatus] = useState<"success" | "cancel" | "error">();

  const [searchParams] = useSearchParams();
  const [savedAddress] = useSessionStorage("address", "");
  const productCode = searchParams.get("product") || "site_report";

  useEffect(() => {
    const success = !!searchParams.get("success");
    const cancel = !!searchParams.get("cancel");

    if (success && !cancel) setStatus("success");
    else if (cancel && !success) setStatus("cancel");
    else setStatus("error");
  }, [searchParams]);

  useEffect(() => {
    if (!status) return;

    trackEvent("checkout_status_view", {
      status,
      product_type: productCode,
      address: savedAddress || undefined,
      timestamp: new Date().toISOString(),
    });
  }, [status, savedAddress, productCode]);

  if (!status) return null;

  return (
    <Main>
      <section>
        <div className="relative max-w-260 mx-auto">
          <div className="bg-white p-10 md:px-16 md:pb-16 rounded-md shadow-lg">
            <Heading tag="h1" size="h1">
              Thank you
            </Heading>

            <hr className="my-6 border-gray-300" />

            {status === "success" && (
              <div className="mt-15 mb-10 space-y-4">
                <Heading tag="h2" size="h3">
                  Order confirmed!
                </Heading>
                <Heading tag="p" size="h4">
                  Thank you for your purchase. We have received your order and
                  our team is getting started on your custom assessment.
                </Heading>
                <p className="text-lg text-gray-600">
                  You will receive an email confirmation shortly, and your
                  comprehensive PDF report will be delivered directly to your
                  inbox within <strong>48 hours</strong>.
                </p>
              </div>
            )}

            {status === "cancel" && (
              <div className="mt-15 mb-10 space-y-4">
                <Heading tag="h2" size="h3">
                  Order cancelled
                </Heading>
                <Heading tag="p" size="h4">
                  Your payment process was cancelled and you have not been
                  charged.
                </Heading>
                <p className="text-lg text-gray-600">
                  If you changed your mind or encountered an issue, you can
                  return to your free assessment below and try again when you
                  are ready.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="mt-15 mb-10 space-y-4">
                <Heading tag="h2" size="h3">
                  Something went wrong
                </Heading>
                <Heading tag="p" size="h4">
                  We were unable to automatically verify your order status.
                </Heading>
                <p className="text-lg text-gray-600">
                  Please check your email for a receipt from Stripe. If you have
                  been charged but have not received an order confirmation from
                  us, please contact support for assistance.
                </p>
              </div>
            )}

            {!!savedAddress && (
              <Link
                to={"/assessment?address=" + encodeURIComponent(savedAddress)}
                onClick={() =>
                  trackCtaClick("back_to_free_report", {
                    address: savedAddress,
                  })
                }
                className={classList([
                  "inline-flex items-center gap-1",
                  "rounded outline-primary outline-offset-3",
                  "underline underline-offset-2 decoration-transparent",
                  "transition-colors",
                  "focus-visible:outline-2",
                  "hover:text-primary hover:decoration-primary",
                ])}
              >
                <ArrowLeft />
                Back to free report
              </Link>
            )}
          </div>
        </div>
      </section>
    </Main>
  );
};

export default CheckoutPage;
