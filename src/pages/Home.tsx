import AssessmentForm from "@/components/AssessmentForm/AssessmentForm";
import Main from "@/components/layouts/Main";
import { motion as m } from "framer-motion";
import { ArrowUpRight } from "lucide-react";

const LVC_FORM_URL =
  "https://forms.monday.com/forms/316e54ed01893dd1b82597c400914642?r=apse2";

const steps = [
  {
    number: "1",
    title: "Enter your address",
    body: "Type in your Canberra address and we pull your block's zone and size instantly.",
  },
  {
    number: "2",
    title: "We check what's possible",
    body: "We assess your block against current ACT planning requirements and show you which development options are available and which aren't.",
  },
  {
    number: "3",
    title: "Get your free report",
    body: "A clear summary of what your block can support, including granny flats, dual occupancy, subdivision, and more.",
  },
];

export const HomePage = () => {
  return (
    <>
      <m.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="homeBg"
      ></m.div>
      <Main>
        <AssessmentForm />
        <section className="mt-24! max-w-none! bg-bp-blueGum px-0! py-16 text-bp-sand md:py-22">
          <div className="mx-auto max-w-360 px-4 text-center md:px-8">
            <p className="text-sm font-semibold uppercase text-bp-sand/90">
              Simple & free
            </p>
            <h2 className="mx-auto mt-6 max-w-4xl text-4xl font-semibold leading-[1.08] text-bp-sand md:text-6xl md:leading-[1.04]">
              Understanding your property in three steps
            </h2>
            <p className="mx-auto mt-5 max-w-4xl text-base leading-7 text-bp-sand/80 md:text-lg md:leading-7">
              No planning knowledge required. We explain the ACT planning rules
              that apply and tell you exactly what matters for your block.
            </p>

            <div className="mt-12 grid gap-9 md:mt-16 md:grid-cols-3 md:gap-8">
              {steps.map((step) => (
                <article key={step.number} className="text-center">
                  <div className="mx-auto flex size-20 items-center justify-center rounded-full border border-bp-sand/75 text-2xl font-semibold text-bp-sand md:size-22">
                    {step.number}
                  </div>
                  <h3 className="mt-7 text-base font-semibold uppercase leading-tight text-bp-sand md:text-lg">
                    {step.title}
                  </h3>
                  <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-bp-sand/78 md:text-base md:leading-7">
                    {step.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-0! max-w-none! bg-bp-sand px-0! py-14 md:py-18">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 text-bp-blueGum md:px-8">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Lease Variation Charge reform
            </h2>
            <p className="max-w-4xl text-base leading-8 text-bp-blueGum/78">
              BlockPlanner is also actively engaging the ACT Government to make
              refinements to the Lease Variation Charge - so more Canberra
              homeowners can afford to develop their own block. If the LVC
              affects what's possible for you, we'd like to hear about it.
            </p>
            <a
              href={LVC_FORM_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex w-fit items-center gap-2 rounded bg-primary px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-hover focus-visible:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Share your experience - takes 2 minutes
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </section>

        <section className="mt-0! max-w-none! bg-bp-sand px-0! py-14 md:py-18">
          <div className="mx-auto flex max-w-5xl flex-col gap-5 px-4 text-bp-blueGum md:px-8">
            <h2 className="text-2xl font-semibold md:text-3xl">
              Free education at every step
            </h2>
            <p className="max-w-4xl text-base leading-8 text-bp-blueGum/78">
              Practical guides on ACT planning, development pathways, and what
              the rules mean for homeowners. BlockPlanner also advocates for
              clearer, more accessible planning information for ACT homeowners.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://linkedin.com/company/blockplanner"
                target="_blank"
                rel="noreferrer"
                className="rounded border border-bp-blueGum/15 bg-white px-4 py-2 text-sm font-semibold text-bp-blueGum transition-colors hover:bg-bp-blueGum hover:text-bp-sand"
              >
                LinkedIn
              </a>
              <a
                href="https://instagram.com/blockplanner"
                target="_blank"
                rel="noreferrer"
                className="rounded border border-bp-blueGum/15 bg-white px-4 py-2 text-sm font-semibold text-bp-blueGum transition-colors hover:bg-bp-blueGum hover:text-bp-sand"
              >
                Instagram
              </a>
              <a
                href="https://facebook.com/blockplanner"
                target="_blank"
                rel="noreferrer"
                className="rounded border border-bp-blueGum/15 bg-white px-4 py-2 text-sm font-semibold text-bp-blueGum transition-colors hover:bg-bp-blueGum hover:text-bp-sand"
              >
                Facebook
              </a>
            </div>
          </div>
        </section>

        <footer className="max-w-none! bg-bp-blueGum px-4 py-8 text-bp-sand md:px-8">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 text-sm md:flex-row md:items-center md:justify-between">
            <div>
              <div className="font-semibold">BlockPlanner Pty Ltd</div>
              <div className="mt-1 text-bp-sand/58">
                Helping ACT homeowners understand what they can build, upgrade
                and what it costs.
              </div>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-bp-sand/70">
              <a
                href="https://www.blockplanner.com.au/tools/discover/privacy"
                target="_blank"
                rel="noreferrer"
                className="hover:text-bp-sand"
              >
                Privacy policy
              </a>
              <a
                href="https://www.blockplanner.com.au/tools/discover/disclaimer"
                target="_blank"
                rel="noreferrer"
                className="hover:text-bp-sand"
              >
                Read Disclaimer
              </a>
              <span>© 2026 BlockPlanner Pty Ltd</span>
            </div>
          </div>
        </footer>
      </Main>
    </>
  );
};

export default HomePage;
