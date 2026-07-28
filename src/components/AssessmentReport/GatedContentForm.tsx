import Button from "@/components//ui/Button";
import Heading from "@/components//ui/Heading";
import TextModal from "@/components//ui/TextModal";
import { classList } from "@/utils/tailwind";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail } from "lucide-react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { z } from "zod";

const gatedContentFormSchema = z.object({
  email: z
    .email({
      pattern: z.regexes.rfc5322Email,
      message: "Invalid email format",
    })
    .trim(),
  privacyAccepted: z.literal(true, {
    error: "You must agree to proceed",
  }),
});

export type GatedContentFormValues = z.infer<typeof gatedContentFormSchema>;

type GatedContentProps = {
  onSubmit: (data: GatedContentFormValues) => void;
};

const GatedContentForm = (props: GatedContentProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GatedContentFormValues>({
    resolver: zodResolver(gatedContentFormSchema),
  });

  const onSubmit: SubmitHandler<GatedContentFormValues> = async (formData) => {
    props.onSubmit(formData);
  };

  return (
    <TextModal open={true}>
      <div className="text-center">
        <Heading tag="h2" size="h2">
          Your BlockPlanner report is ready
        </Heading>

        <Heading tag="p" size="h4">
          Enter your email to view your development assessment.
        </Heading>

        <p className="pt-2 text-balance">We&apos;ll also send you a copy.</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 w-full max-w-91 mx-auto mt-6"
          noValidate
        >
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
          <div>
            <label className="relative flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                {...register("privacyAccepted")}
                aria-invalid={errors.privacyAccepted ? "true" : "false"}
                className={classList(
                  "peer",
                  "relative",
                  "appearance-none",
                  "shrink-0 size-4.5 mt-0.5",
                  "border border-gray-300 rounded-sm",
                  "focus-visible:border-transparent",
                )}
                required
              />
              <Check
                className={classList([
                  "pointer-events-none absolute top-1 left-px size-4 p-px",
                  "hidden outline-none",
                  "peer-checked:block",
                ])}
              />
              <span className="text-sm text-left">
                I agree to BlockPlanner's{" "}
                <a
                  href="/privacy"
                  className="font-semibold"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.privacyAccepted && (
              <p className="text-xs text-error pl-1 mt-1" role="alert">
                {errors.privacyAccepted.message}
              </p>
            )}
          </div>
          <Button className="mt-4" label="View my report" type="submit" />
        </form>
        <small className="block text-xs mt-6 text-balance">
          We require an email to prevent automated scraping and ensure you
          receive your report.
        </small>
      </div>
    </TextModal>
  );
};

export default GatedContentForm;
