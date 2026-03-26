import AnimatedLogo from "@/components//ui/AnimatedLogo";
import { useEffect, useState } from "react";

const steps = [
  "Checking the block and zone",
  "Applying the current ACT planning rules",
  "Laying out your report",
];

const LoadingMessage = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [showDelayMessage, setShowDelayMessage] = useState(false);

  useEffect(() => {
    const timers = [
      window.setTimeout(() => setStepIndex(1), 700),
      window.setTimeout(() => setStepIndex(2), 1400),
      window.setTimeout(() => setShowDelayMessage(true), 4000),
    ];

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, []);

  return (
    <div className="px-8 py-16 md:px-12 md:py-20 text-center">
      <AnimatedLogo width={112} className="mx-auto" />
      <p className="mt-8 text-xs font-medium uppercase tracking-[0.28em] text-bp-eucalypt/80">
        Preparing your report
      </p>
      <h2 className="mt-4 text-2xl font-semibold text-bp-blueGum md:text-3xl">
        {steps[stepIndex]}
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-bp-blueGum/70">
        We&apos;re checking your property details and setting out the report in
        a cleaner document view.
      </p>

      <div className="mx-auto mt-10 max-w-md space-y-3 text-left">
        {steps.map((step, index) => {
          const state =
            index < stepIndex ? "done" : index === stepIndex ? "active" : "idle";

          return (
            <div
              key={step}
              className="flex items-center gap-3 rounded-full border border-bp-blueGum/10 bg-bp-sand/60 px-4 py-3"
            >
              <span
                className={[
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold",
                  state === "done"
                    ? "bg-primary text-white"
                    : state === "active"
                      ? "bg-bp-blueGum text-white"
                      : "bg-white text-bp-blueGum/45",
                ].join(" ")}
              >
                {index + 1}
              </span>
              <span className="text-sm text-bp-blueGum">{step}</span>
            </div>
          );
        })}
      </div>

      {showDelayMessage && (
        <p className="mx-auto mt-8 max-w-lg text-sm leading-6 text-bp-blueGum/65">
          This one is taking a little longer than usual. We&apos;re still
          waiting on the lookup response.
        </p>
      )}
    </div>
  );
};

export default LoadingMessage;
