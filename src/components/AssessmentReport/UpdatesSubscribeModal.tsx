import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import TextModal from "@/components/ui/TextModal";
import { identifyUser, trackEvent } from "@/utils/analytics";
import { classList } from "@/utils/tailwind";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const subscribeFormSchema = z.object({
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

type SubscribeFormValues = z.infer<typeof subscribeFormSchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  address?: string;
  zone?: string;
  email?: string;
};

export const UpdatesSubscribeModal = (props: Props) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const closeModal = () => {
    props.setIsOpen(false);
    setSubmitError(undefined);
    setIsSubmitted(false);
  };

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SubscribeFormValues>({
    resolver: zodResolver(subscribeFormSchema),
    defaultValues: {
      email: props.email || "",
    },
  });

  const onSubmit: SubmitHandler<SubscribeFormValues> = async (formData) => {
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
            address: props.address,
            requestType: `${props.zone || "Planning"} updates subscription`,
            message: `Subscribed to BlockPlanner planning guides and updates from the ${props.zone || "property"} result.`,
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
        address: props.address,
        zone: props.zone,
        subscribed_to_updates: true,
      });
      trackEvent("planning_updates_subscription", {
        address: props.address,
        zone: props.zone,
        timestamp,
      });
      setIsSubmitted(true);
    } catch (error) {
      trackEvent("planning_updates_subscription_error", {
        address: props.address,
        zone: props.zone,
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      setSubmitError(
        "We couldn't save your subscription. Please try again shortly.",
      );
    }
  };

  return (
    <TextModal open={props.isOpen} onClose={closeModal}>
      <Heading tag="h2" size="h2" className="text-center">
        Subscribe for updates
      </Heading>
      <p className="mx-auto mt-3 max-w-130 text-center text-base leading-7 text-bp-blueGum/72">
        Get free planning guides and occasional updates from BlockPlanner while
        you consider your options.
      </p>

      {isSubmitted ? (
        <div
          className="mx-auto mt-7 max-w-120 rounded-sm border border-emerald-200 bg-emerald-50 px-5 py-5 text-center text-emerald-800"
          aria-live="polite"
        >
          <p className="font-semibold">You&apos;re subscribed.</p>
          <p className="mt-2 text-sm">
            We&apos;ll send relevant planning guides and updates to your inbox.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-7 flex w-full max-w-120 flex-col gap-4"
          noValidate
        >
          <div>
            <label>
              <span className="sr-only">Email address</span>
              <span className="relative block">
                <Mail className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-300" />
                <input
                  type="email"
                  {...register("email")}
                  aria-invalid={errors.email ? "true" : "false"}
                  placeholder="Email address"
                  autoComplete="email"
                  className={classList(
                    "w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-11 placeholder-gray-500",
                    "focus-visible:border-transparent",
                  )}
                />
              </span>
            </label>
            {errors.email && (
              <p className="mt-1 pl-1 text-xs text-error" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
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
                <a
                  href="/privacy"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold underline underline-offset-3"
                >
                  Privacy Policy
                </a>
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
            <p
              className="rounded-sm border border-error/30 bg-error/5 px-4 py-3 text-sm text-error"
              role="alert"
            >
              {submitError}
            </p>
          )}

          <Button
            label="Subscribe"
            type="submit"
            loading={isSubmitting}
            className="min-h-12 w-full"
          />
        </form>
      )}
    </TextModal>
  );
};

export default UpdatesSubscribeModal;
