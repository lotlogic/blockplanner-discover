import Button from "@/components//ui/Button";
import Heading from "@/components//ui/Heading";
import TextModal from "@/components//ui/TextModal";
import { trackCtaClick, trackEvent } from "@/utils/analytics";
import { isValidPhoneNumber } from "@/utils/phone";
import { classList } from "@/utils/tailwind";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Mail, Phone, Target, User } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const paymentFormSchema = z.object({
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
      message: "Please select from above",
    },
  ),
  clientName: z.string().trim().min(2, "Please enter a name"),
  clientPhone: z
    .string()
    .trim()
    .refine(isValidPhoneNumber, {
      message:
        "Enter a valid phone number, including country code if overseas",
    }),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

export type CheckoutData = {
  email?: string;
  address?: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
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

type Props = CheckoutData & {
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  ctaLocation?: string;
};

export const PaymentModal = (props: Props) => {
  const closeModal = () => props.setIsOpen(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
  });

  const onSubmit: SubmitHandler<PaymentFormValues> = async (formData) => {
    try {
      if (!formData.email) throw new Error("Missing query parameter - email");
      if (!props.address) throw new Error("Missing query parameter - address");
      if (!location.origin) throw new Error("Missing query parameter - site");

      trackCtaClick("purchase_report_submit", {
        address: props.address,
        zone: props.zone,
        block_size: props.blockSizeM2,
        location: props.ctaLocation,
      });

      trackEvent("checkout_form_submit", {
        address: props.address,
        zone: props.zone,
        block_size: props.blockSizeM2,
        suburb: props.suburb,
        intention: formData.intention,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/stripe/create-checkout-session`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            site: location.origin,
            cancelUrl: window.location.href,
            checkoutMode,
            productCode: "site_report",
            sourceApp: "discover",

            intention: formData.intention,

            // Backwards-compatible alias
            email: formData.email,

            clientName: formData.clientName ?? props.clientName,
            clientEmail: props.clientEmail ?? formData.email,
            clientPhone: formData.clientPhone ?? props.clientPhone,
            address: props.address,
            suburb: props.suburb,
            blockSizeM2: props.blockSizeM2,
            zone: props.zone,
          }),
        },
      );

      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      // redirect the user to the Stripe-hosted URL
      const { url } = await response.json();

      if (url) {
        trackEvent("checkout_redirect", {
          address: props.address,
          zone: props.zone,
          block_size: props.blockSizeM2,
          suburb: props.suburb,
          intention: formData.intention,
          timestamp: new Date().toISOString(),
        });
        window.location.href = url;
      } else {
        throw new Error("Stripe error! No checkout URL returned");
      }
    } catch (error: any) {
      trackEvent("checkout_error", {
        address: props.address,
        zone: props.zone,
        block_size: props.blockSizeM2,
        suburb: props.suburb,
        message: error?.message,
        timestamp: new Date().toISOString(),
      });
      console.log("Error: " + error.message);
    }
  };

  if (!props.address) return null;

  return (
    <TextModal open={props.isOpen} onClose={closeModal}>
      <Heading tag="h2" size="h2" className="text-center">
        Want a report that considers what's actually on your block?
      </Heading>

      <p className="text-center text-lg">
        Upgrade to the full PDF report for a clearer picture of what's worth
        pursuing. We look at your existing house, trees, easements, setbacks and
        access, then send practical next steps straight to your inbox.
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex flex-col gap-4 w-full max-w-91 mx-auto mt-6"
        noValidate
      >
        <div>
          <label>
            <span className="sr-only">What's your primary intention?</span>
            <span className="relative">
              <Target className="absolute top-1/2 left-3 size-6 -translate-y-1/2 text-gray-300 pointer-events-none" />
              <ChevronDown className="absolute top-1/2 right-4 size-5 -translate-y-1/2 text-gray-500 pointer-events-none" />
              <select
                defaultValue=""
                {...register("intention")}
                aria-invalid={errors.intention ? "true" : "false"}
                className={classList(
                  "w-full py-3 pl-12 pr-10 appearance-none",
                  "bg-white text-gray-700",
                  "border border-gray-300 rounded-md",
                  "focus-visible:border-transparent",
                  "invalid:text-gray-500",
                )}
              >
                <option value="" disabled>
                  What's your primary intention?
                </option>
                <option value="Sell">
                  I want to sell and understand what it's worth
                </option>
                <option value="Develop myself">
                  I want to develop it myself
                </option>
                <option value="Have someone develop for me">
                  I want someone to develop it for me
                </option>
                <option value="Open to options">
                  I'm open to options - help me figure it out
                </option>
              </select>
            </span>
          </label>
          {errors.intention && (
            <p className="text-xs text-error pl-1 mt-1" role="alert">
              {errors.intention.message as string}
            </p>
          )}
        </div>

        <div>
          <label>
            <span className="sr-only">Your name</span>
            <span className="relative">
              <User className="absolute top-1/2 left-3 size-6 -translate-y-1/2 text-gray-300" />
              <input
                type="text"
                defaultValue={props.clientName}
                {...register("clientName")}
                aria-invalid={errors.clientName ? "true" : "false"}
                placeholder="Your name"
                className={classList(
                  "w-full px-4 py-3 pl-12",
                  "bg-white placeholder-gray-500",
                  "border border-gray-300 rounded-md",
                  "focus-visible:border-transparent",
                )}
                autoComplete="name"
              />
            </span>
          </label>
          {errors.clientName && (
            <p className="text-xs text-error pl-1 mt-1" role="alert">
              {errors.clientName.message as string}
            </p>
          )}
        </div>

        <div>
          <label>
            <span className="sr-only">Your phone number</span>
            <span className="relative">
              <Phone className="absolute top-1/2 left-3 size-6 -translate-y-1/2 text-gray-300" />
              <input
                type="tel"
                defaultValue={props.clientPhone}
                {...register("clientPhone")}
                aria-invalid={errors.clientPhone ? "true" : "false"}
                placeholder="Your phone number"
                className={classList(
                  "w-full px-4 py-3 pl-12",
                  "bg-white placeholder-gray-500",
                  "border border-gray-300 rounded-md",
                  "focus-visible:border-transparent",
                )}
                autoComplete="tel"
              />
            </span>
          </label>
          {errors.clientPhone && (
            <p className="text-xs text-error pl-1 mt-1" role="alert">
              {errors.clientPhone.message as string}
            </p>
          )}
        </div>

        <div>
          <label>
            <span className="sr-only">Enter your email address</span>
            <span className="relative">
              <Mail className="absolute top-1/2 left-3 size-6 -translate-y-1/2 text-gray-300" />
              <input
                type="email"
                defaultValue={props.email}
                {...register("email", {
                  required: "Email Address is required",
                })}
                aria-invalid={errors.email ? "true" : "false"}
                placeholder="Enter your email address"
                className={classList(
                  "w-full px-4 py-3 pl-12",
                  "bg-white placeholder-gray-500",
                  "border border-gray-300 rounded-md",
                  "focus-visible:border-transparent",
                )}
              />
            </span>
          </label>
          {errors.email && (
            <p className="text-xs text-error pl-1 mt-1" role="alert">
              {errors.email.message as string}
            </p>
          )}
        </div>
        <Button label="Request your report" type="submit" />
      </form>
    </TextModal>
  );
};

export default PaymentModal;
