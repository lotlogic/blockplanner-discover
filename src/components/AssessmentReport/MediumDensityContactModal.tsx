import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import TextModal from "@/components/ui/TextModal";
import { trackEvent } from "@/utils/analytics";
import { isValidPhoneNumber } from "@/utils/phone";
import { classList } from "@/utils/tailwind";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Mail, Phone, Target, User } from "lucide-react";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const intentOptions = [
  "Sell",
  "Develop myself",
  "Have someone develop for me",
  "Open to options",
] as const;
const ownershipOptions = ["Yes", "I act for the owner", "No"] as const;
const jointDevelopmentOptions = ["Yes", "Maybe", "No"] as const;

const contactFormSchema = z.object({
  clientName: z.string().trim().min(2, "Please enter your name"),
  email: z
    .email({ pattern: z.regexes.rfc5322Email, message: "Invalid email format" })
    .trim(),
  clientPhone: z
    .string()
    .trim()
    .refine(isValidPhoneNumber, {
      message:
        "Enter a valid phone number, including country code if overseas",
    }),
  intent: z.enum(intentOptions, {
    message: "Please select your primary intention",
  }),
  ownsBlock: z.enum(ownershipOptions, {
    message: "Please tell us whether you own the block",
  }),
  jointDevelopment: z.enum(jointDevelopmentOptions, {
    message: "Please select an option",
  }),
  message: z
    .string()
    .trim()
    .max(2000, "Please keep this under 2,000 characters"),
  company: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  address?: string;
  zone?: string;
  email?: string;
};

type RadioGroupProps = {
  legend: string;
  name: "ownsBlock" | "jointDevelopment";
  options: readonly string[];
  register: ReturnType<typeof useForm<ContactFormValues>>["register"];
  error?: string;
};

const RadioGroup = ({
  legend,
  name,
  options,
  register,
  error,
}: RadioGroupProps) => (
  <fieldset>
    <legend className="text-sm font-semibold text-bp-blueGum">{legend}</legend>
    <div className="mt-3 grid gap-2 sm:grid-cols-3">
      {options.map((option) => (
        <label
          key={option}
          className="flex min-h-11 cursor-pointer items-center gap-2 rounded-sm border border-bp-blueGum/15 bg-white px-3 py-2 text-sm text-bp-blueGum transition-colors has-checked:border-bp-eucalypt has-checked:bg-bp-sand"
        >
          <input
            type="radio"
            value={option}
            {...register(name)}
            className="size-4 shrink-0 accent-bp-eucalypt"
          />
          <span>{option}</span>
        </label>
      ))}
    </div>
    {error && (
      <p className="mt-1 pl-1 text-xs text-error" role="alert">
        {error}
      </p>
    )}
  </fieldset>
);

export const MediumDensityContactModal = (props: Props) => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const closeModal = () => {
    props.setIsOpen(false);
    setSubmitError(undefined);
    setIsSubmitted(false);
  };

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      email: props.email || "",
      message: "",
    },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = form;

  const onSubmit: SubmitHandler<ContactFormValues> = async (formData) => {
    setSubmitError(undefined);

    if (!props.address) {
      setSubmitError("We could not identify the property address.");
      return;
    }

    const userData = {
      address: props.address,
      name: formData.clientName,
      email: formData.email,
      phone: formData.clientPhone,
      intent: formData.intent,
      requestType: `${props.zone || "RZ3/RZ4"} request a call`,
      ownsBlock: formData.ownsBlock,
      jointDevelopment: formData.jointDevelopment,
      message: formData.message,
    };

    try {
      trackEvent("medium_density_request_call_submit", {
        ...userData,
        zone: props.zone,
        owns_block: formData.ownsBlock,
        joint_development: formData.jointDevelopment,
        timestamp: new Date().toISOString(),
      });

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/enquiry/get-in-touch`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...userData,
            company: formData.company,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setIsSubmitted(true);
    } catch (error) {
      trackEvent("medium_density_request_call_error", {
        address: props.address,
        zone: props.zone,
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      });
      setSubmitError(
        "We couldn't send your details. Please call 0401 637 961 or try again.",
      );
    }
  };

  if (!props.address) return null;

  return (
    <TextModal open={props.isOpen} onClose={closeModal}>
      <Heading tag="h2" size="h2" className="text-center">
        Request a call
      </Heading>
      <p className="mx-auto mt-3 max-w-150 text-center text-base leading-7 text-bp-blueGum/72">
        Leave your details and we&apos;ll call you within two business days. A
        few quick questions will help us come prepared.
      </p>
      <p className="mt-3 text-center text-sm text-bp-blueGum/55">
        {props.address}
      </p>

      {isSubmitted ? (
        <div className="mx-auto mt-7 max-w-130 rounded-sm border border-emerald-200 bg-emerald-50 px-5 py-5 text-center text-emerald-800">
          <p className="font-semibold">Thanks. Your details have been sent.</p>
          <p className="mt-2 text-sm">
            We&apos;ll be in touch within two business days.
          </p>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mx-auto mt-7 flex w-full max-w-150 flex-col gap-4"
          noValidate
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label>
                <span className="sr-only">Your name</span>
                <span className="relative block">
                  <User className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-300" />
                  <input
                    type="text"
                    {...register("clientName")}
                    aria-invalid={errors.clientName ? "true" : "false"}
                    placeholder="Your name"
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
                <span className="sr-only">Your phone number</span>
                <span className="relative block">
                  <Phone className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-300" />
                  <input
                    type="tel"
                    {...register("clientPhone")}
                    aria-invalid={errors.clientPhone ? "true" : "false"}
                    placeholder="Your phone number"
                    className={classList(
                      "w-full rounded-md border border-gray-300 bg-white px-4 py-3 pl-11 placeholder-gray-500",
                      "focus-visible:border-transparent",
                    )}
                    autoComplete="tel"
                  />
                </span>
              </label>
              {errors.clientPhone && (
                <p className="mt-1 pl-1 text-xs text-error" role="alert">
                  {errors.clientPhone.message}
                </p>
              )}
            </div>
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

          <div>
            <label>
              <span className="sr-only">Primary intention</span>
              <span className="relative block">
                <Target className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-gray-300" />
                <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-gray-500" />
                <select
                  defaultValue=""
                  {...register("intent")}
                  aria-invalid={errors.intent ? "true" : "false"}
                  className={classList(
                    "w-full appearance-none rounded-md border border-gray-300 bg-white py-3 pr-10 pl-11 text-gray-700",
                    "focus-visible:border-transparent invalid:text-gray-500",
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
            {errors.intent && (
              <p className="mt-1 pl-1 text-xs text-error" role="alert">
                {errors.intent.message}
              </p>
            )}
          </div>

          <div className="mt-2 border-t border-bp-blueGum/10 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-bp-eucalypt">
              Three quick questions so we come prepared
            </p>
          </div>

          <RadioGroup
            legend="Do you own this block?"
            name="ownsBlock"
            options={ownershipOptions}
            register={register}
            error={errors.ownsBlock?.message}
          />

          <div>
            <RadioGroup
              legend="Would you consider doing this jointly with a neighbour?"
              name="jointDevelopment"
              options={jointDevelopmentOptions}
              register={register}
              error={errors.jointDevelopment?.message}
            />
            <p className="mt-2 text-sm text-bp-blueGum/60">
              Blocks next to each other are often worth more together.
            </p>
          </div>

          <div>
            <label
              className="text-sm font-semibold text-bp-blueGum"
              htmlFor="medium-density-message"
            >
              Anything else you want us to know?
            </label>
            <textarea
              id="medium-density-message"
              {...register("message")}
              rows={4}
              className="mt-3 w-full resize-y rounded-md border border-gray-300 bg-white px-4 py-3 text-bp-blueGum placeholder-gray-500 focus-visible:border-transparent"
            />
            {errors.message && (
              <p className="mt-1 pl-1 text-xs text-error" role="alert">
                {errors.message.message}
              </p>
            )}
          </div>

          <input type="hidden" {...register("company")} />

          {submitError && (
            <p className="text-sm text-error" role="alert">
              {submitError}
            </p>
          )}

          <Button
            label="Send"
            type="submit"
            loading={isSubmitting}
            className="mt-2 min-h-13 w-full text-base"
          />
        </form>
      )}
    </TextModal>
  );
};

export default MediumDensityContactModal;
