import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import TextModal from "@/components/ui/TextModal";
import { identifyUser, trackCtaClick, trackEvent } from "@/utils/analytics";
import { getCheckoutSiteUrl } from "@/utils/publicPath";
import { writeSessionStorageString } from "@/utils/sessionStorage";
import { classList } from "@/utils/tailwind";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, Mail, Target, User } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const crownLeaseFormSchema = z.object({
  clientName: z.string().trim().min(2, "Please enter your full name"),
  email: z
    .email({ pattern: z.regexes.rfc5322Email, message: "Invalid email format" })
    .trim(),
  intention: z.enum(
    [
      "Sell",
      "Develop myself",
      "Have someone develop for me",
      "Open to options",
    ],
    {
      message: "Please select your primary intention",
    },
  ),
});

type CrownLeaseFormValues = z.infer<typeof crownLeaseFormSchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  email?: string;
  address?: string;
  suburb?: string;
  zone?: string;
  blockSizeM2?: string | number;
};

const checkoutMode =
  String(import.meta.env.VITE_STRIPE_CHECKOUT_MODE || "live")
    .trim()
    .toLowerCase() === "sandbox"
    ? "sandbox"
    : "live";

export const CrownLeaseCheckoutModal = (props: Props) => {
  const [submitError, setSubmitError] = useState<string>();
  const closeModal = () => {
    props.setIsOpen(false);
    setSubmitError(undefined);
  };
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CrownLeaseFormValues>({
    resolver: zodResolver(crownLeaseFormSchema),
    defaultValues: { email: props.email || "", intention: undefined },
  });

  const onSubmit: SubmitHandler<CrownLeaseFormValues> = async (formData) => {
    setSubmitError(undefined);

    try {
      if (!props.address) {
        throw new Error("Please select a property address first.");
      }

      writeSessionStorageString("address", props.address);
      trackCtaClick("purchase_crown_lease_submit", {
        address: props.address,
        zone: props.zone,
        block_size: props.blockSizeM2,
        intention: formData.intention,
        location: "medium_density_result",
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site: getCheckoutSiteUrl(),
            cancelUrl: window.location.href,
            checkoutMode,
            productCode: "crown_lease",
            sourceApp: "discover",
            intention: formData.intention,
            email: formData.email,
            clientName: formData.clientName,
            clientEmail: formData.email,
            address: props.address,
            suburb: props.suburb,
            zone: props.zone,
            blockSizeM2: props.blockSizeM2,
          }),
        },
      );
      const responseBody = (await response.json().catch(() => ({}))) as {
        url?: string | null;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          responseBody.message ||
            `Unable to start checkout (${response.status}).`,
        );
      }
      if (!responseBody.url) {
        throw new Error("Stripe did not return a checkout URL.");
      }

      identifyUser(formData.email, {
        name: formData.clientName,
        address: props.address,
        product_type: "crown_lease",
        intention: formData.intention,
      });
      trackEvent("checkout_redirect", {
        product_type: "crown_lease",
        address: props.address,
        zone: props.zone,
        intention: formData.intention,
        source: "discover",
        timestamp: new Date().toISOString(),
      });
      window.location.href = responseBody.url;
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to start checkout. Please try again.";
      trackEvent("checkout_error", {
        product_type: "crown_lease",
        address: props.address,
        zone: props.zone,
        message,
        timestamp: new Date().toISOString(),
      });
      setSubmitError(message);
    }
  };

  if (!props.address) return null;

  return (
    <TextModal open={props.isOpen} onClose={closeModal}>
      <Heading tag="h2" size="h2" className="text-center">
        Crown lease check - $149
      </Heading>
      <p className="mx-auto mt-3 max-w-150 text-center text-base leading-7 text-bp-blueGum/72">
        We&apos;ll retrieve and read your Crown lease so you know exactly which
        LVC scenario applies.
      </p>

      <div className="mx-auto mt-7 grid max-w-150 gap-5 md:grid-cols-[1fr_0.72fr]">
        <div className="rounded-sm border border-bp-blueGum/10 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bp-blueGum/55">
            What you get
          </p>
          <ul className="mt-3 space-y-3 text-sm leading-6 text-bp-blueGum/72">
            <li className="flex gap-3">
              <Check className="mt-1 size-4 shrink-0 text-bp-eucalypt" />
              <span>Your Crown lease purpose clause, exactly as written</span>
            </li>
            <li className="flex gap-3">
              <Check className="mt-1 size-4 shrink-0 text-bp-eucalypt" />
              <span>
                A clear explanation of what it means for your potential LVC
              </span>
            </li>
            <li className="flex gap-3">
              <Check className="mt-1 size-4 shrink-0 text-bp-eucalypt" />
              <span>Which LVC schedule applies, Schedule 1 or Schedule 2</span>
            </li>
            <li className="flex gap-3">
              <Check className="mt-1 size-4 shrink-0 text-bp-eucalypt" />
              <span>Emailed to you within 24 hours</span>
            </li>
          </ul>
        </div>
        <div className="rounded-sm border border-bp-blueGum/10 bg-bp-sand p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-bp-blueGum/55">
            One-off fee
          </p>
          <p className="mt-2 text-4xl font-semibold text-bp-blueGum">$149</p>
          <p className="mt-2 text-sm leading-6 text-bp-blueGum/62">
            Includes the government search and our summary.
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mx-auto mt-6 flex w-full max-w-150 flex-col gap-4"
        noValidate
      >
        <div className="rounded-sm border border-bp-blueGum/10 bg-bp-blueGum/5 px-4 py-3 text-sm text-bp-blueGum/72">
          <span className="font-semibold">Property:</span> {props.address}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label>
              <span className="sr-only">Full name</span>
              <span className="relative block">
                <User className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
                  {...register("clientName")}
                  aria-invalid={errors.clientName ? "true" : "false"}
                  placeholder="Full name"
                  className={classList(
                    "w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-11 placeholder-gray-500",
                    "focus-visible:border-transparent",
                  )}
                  autoComplete="name"
                />
              </span>
            </label>
            {errors.clientName && (
              <p className="mt-1 pl-1 text-xs text-error" role="alert">
                {errors.clientName.message}
              </p>
            )}
          </div>

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
                  className={classList(
                    "w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-11 placeholder-gray-500",
                    "focus-visible:border-transparent",
                  )}
                  autoComplete="email"
                />
              </span>
            </label>
            {errors.email && (
              <p className="mt-1 pl-1 text-xs text-error" role="alert">
                {errors.email.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label>
            <span className="sr-only">Primary intention</span>
            <span className="relative block">
              <Target className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-300" />
              <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-gray-500" />
              <select
                defaultValue=""
                {...register("intention")}
                aria-invalid={errors.intention ? "true" : "false"}
                className={classList(
                  "w-full appearance-none rounded-md border border-gray-300 bg-white py-3 pr-10 pl-11 text-gray-700",
                  "focus-visible:border-transparent",
                )}
              >
                <option value="" disabled>
                  What&apos;s your primary intention?
                </option>
                <option value="Sell">
                  I want to sell and understand what it&apos;s worth
                </option>
                <option value="Develop myself">
                  I want to develop it myself
                </option>
                <option value="Have someone develop for me">
                  I want someone to develop it for me
                </option>
                <option value="Open to options">
                  I&apos;m open to options - help me figure it out
                </option>
              </select>
            </span>
          </label>
          {errors.intention && (
            <p className="mt-1 pl-1 text-xs text-error" role="alert">
              {errors.intention.message}
            </p>
          )}
        </div>

        {submitError && (
          <p className="text-sm text-error" role="alert">
            {submitError}
          </p>
        )}

        <Button
          label="Pay $149 and get my lease"
          type="submit"
          loading={isSubmitting}
          className="min-h-13 w-full text-base"
        />
      </form>
    </TextModal>
  );
};

export default CrownLeaseCheckoutModal;
