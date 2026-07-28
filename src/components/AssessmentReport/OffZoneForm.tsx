import Button from "@/components//ui/Button";
import Heading from "@/components//ui/Heading";
import TextModal from "@/components//ui/TextModal";
import { isValidPhoneNumber } from "@/utils/phone";
import { classList } from "@/utils/tailwind";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, Mail, Phone, Target, User } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const intentOptions = [
  "Sell",
  "Develop myself",
  "Have someone develop for me",
  "Open to options",
] as const;

const offZoneFormSchema = z.object({
  email: z
    .email({
      pattern: z.regexes.rfc5322Email,
      message: "Invalid email format",
    })
    .trim(),
  clientName: z.string().trim().min(2, "Please enter a name"),
  clientPhone: z.string().trim().refine(isValidPhoneNumber, {
    message: "Enter a valid phone number, including country code if overseas",
  }),
  intent: z.enum(intentOptions, {
    message: "Please select your intent",
  }),
  company: z.string().optional(),
});

export type OffZoneFormValues = z.infer<typeof offZoneFormSchema>;

type Props = {
  isOpen: boolean;
  setIsOpen: (x: boolean) => void;
  address: string;
  onSubmit: (data: OffZoneFormValues) => void;
};

const OffZoneForm = (props: Props) => {
  const closeModal = () => props.setIsOpen(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OffZoneFormValues>({
    resolver: zodResolver(offZoneFormSchema),
  });

  const onSubmit: SubmitHandler<OffZoneFormValues> = async (formData) => {
    props.onSubmit(formData);
  };

  return (
    <TextModal open={props.isOpen} onClose={closeModal}>
      <div className="text-center">
        <Heading tag="h2" size="h2">
          Your property is in a different zone - but you can still get your free
          assessment.
        </Heading>

        <p className="pt-2 text-balance">
          The free report covers residential properties (RZ1 - RZ4). Your
          property is in a different zone - industrial, commercial, or a
          designated area - where different rules apply, so we assess these
          individually.
        </p>

        <p className="pt-2 text-balance">
          Leave your details and Mitch will call you back - usually within one
          business day.
        </p>

        <Heading tag="p" size="h4">
          {props.address}
        </Heading>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full max-w-91 mx-auto mt-6"
          noValidate
        >
          <div>
            <label>
              <span className="sr-only">Your name</span>
              <span className="relative">
                <User className="absolute top-1/2 left-3 size-6 -translate-y-1/2 text-gray-300" />
                <input
                  type="text"
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
              <span className="sr-only">Intent</span>
              <span className="relative">
                <Target className="pointer-events-none absolute top-1/2 left-3 size-6 -translate-y-1/2 text-gray-300" />
                <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-gray-500" />
                <select
                  defaultValue=""
                  {...register("intent")}
                  aria-invalid={errors.intent ? "true" : "false"}
                  className={classList(
                    "w-full py-3 pl-12 pr-10 appearance-none",
                    "bg-white text-gray-700",
                    "border border-gray-300 rounded-md",
                    "focus-visible:border-transparent",
                    "invalid:text-gray-500",
                  )}
                >
                  <option value="" disabled>
                    What are you hoping to do?
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
              <p className="text-xs text-error pl-1 mt-1" role="alert">
                {errors.intent.message as string}
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
                  {...register("email")}
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
                {errors.email.message}
              </p>
            )}
          </div>
          <input type="hidden" {...register("company")} />
          <Button className="mt-4" label="Send my details" type="submit" />
        </form>
      </div>
    </TextModal>
  );
};

export default OffZoneForm;
