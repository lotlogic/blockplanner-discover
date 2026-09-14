import Button from "@/components/ui/Button";
import { identifyUser, trackEvent } from "@/utils/analytics";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link } from "react-router-dom";
import { z } from "zod";

const staySubscribeSchema = z.object({
  email: z
    .email({
      pattern: z.regexes.rfc5322Email,
      message: "Enter a valid email address",
    })
    .trim(),
  consent: z.literal(true, {
    error: "Please confirm that you want to receive updates",
  }),
});

type StaySubscribeFormValues = z.infer<typeof staySubscribeSchema>;

type Props = {
  address?: string;
  zone?: string;
};

// Inline counterpart to UpdatesSubscribeModal.tsx - same Monday.com lead
// path, tracking, and consent checkbox, without the modal chrome.
export const StayInTheKnowForm = ({ address, zone }: Props) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StaySubscribeFormValues>({
    resolver: zodResolver(staySubscribeSchema),
  });

  const onSubmit: SubmitHandler<StaySubscribeFormValues> = async (
    formData,
  ) => {
    setSubmitError(undefined);

    try {
      const timestamp = new Date().toISOString();
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/monday/product-leads`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            leadType: "contact_request",
            email: formData.email,
            address,
            requestType: `${zone || "Planning"} updates subscription`,
            message: `Subscribed to BlockPlanner planning guides and updates from the ${zone || "property"} result.`,
            sourceApp: "discover",
            timestamp,
          }),
        },
      );

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => ({}))) as {
          message?: string;
        };
        throw new Error(responseBody.message || "Subscription failed");
      }

      identifyUser(formData.email, {
        address,
        zone,
        subscribed_to_updates: true,
      });
      trackEvent("planning_updates_subscription", {
        address,
        zone,
        location: "report_inline",
        timestamp,
      });
      setIsSubmitted(true);
    } catch (error) {
      trackEvent("planning_updates_subscription_error", {
        address,
        zone,
        location: "report_inline",
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      setSubmitError(
        "We couldn't save your subscription. Please try again shortly.",
      );
    }
  };

  if (isSubmitted) {
    return (
      <p
        className="min-w-0 flex-1 basis-70 text-sm font-medium text-emerald-800"
        aria-live="polite"
      >
        You&apos;re subscribed. We&apos;ll send relevant planning guides and
        updates to your inbox.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="min-w-0 flex-1 basis-70"
      noValidate
    >
      <div className="flex flex-wrap items-start gap-2.5">
        <div className="min-w-45 flex-1">
          <label>
            <span className="sr-only">Email address</span>
            <span className="relative block">
              <Mail className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-bp-blueGum/35" />
              <input
                type="email"
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
                placeholder="Your email address"
                autoComplete="email"
                className="w-full rounded-sm border border-bp-blueGum/20 bg-white py-3.5 pr-4 pl-10 text-sm text-bp-blueGum placeholder-bp-blueGum/40 focus-visible:border-transparent"
              />
            </span>
          </label>
          {errors.email && (
            <p className="mt-1 pl-1 text-xs text-error" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
        <Button
          label="Subscribe"
          type="submit"
          loading={isSubmitting}
          className="min-h-13.5 shrink-0 px-6"
        />
      </div>

      <div className="mt-3">
        <label className="relative flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            {...register("consent")}
            aria-invalid={errors.consent ? "true" : "false"}
            className="peer relative mt-0.5 size-4.5 shrink-0 appearance-none rounded-sm border border-gray-300 focus-visible:border-transparent"
          />
          <Check className="pointer-events-none absolute top-1 left-px hidden size-4 p-px outline-none peer-checked:block" />
          <span className="text-left text-sm leading-6 text-bp-blueGum/72">
            I agree to receive occasional BlockPlanner planning updates. I
            can unsubscribe at any time. See the{" "}
            <Link
              to="/privacy"
              target="_blank"
              rel="noreferrer"
              className="font-semibold underline underline-offset-3"
            >
              Privacy Policy
            </Link>
            .
          </span>
        </label>
        {errors.consent && (
          <p className="mt-1 pl-1 text-xs text-error" role="alert">
            {errors.consent.message}
          </p>
        )}
      </div>

      {submitError && (
        <p className="mt-2 text-xs text-error" role="alert">
          {submitError}
        </p>
      )}
    </form>
  );
};

export default StayInTheKnowForm;
