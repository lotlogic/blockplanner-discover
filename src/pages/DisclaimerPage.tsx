import Main from "@/components/layouts/Main";
import Heading from "@/components/ui/Heading";
import { classList } from "@/utils/tailwind";
import { ArrowBack } from "@mui/icons-material";
import { motion as m } from "framer-motion";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    title: "About this tool",
    paragraphs: [
      "This disclaimer applies to both BlockPlanner's free property assessment tool (the Free Product) and any paid report purchased through BlockPlanner Pty Ltd (the Paid Product). By using either product, you acknowledge and agree to be bound by the terms of this Disclaimer.",
      "The Free Product is an assessment tool that helps ACT homeowners understand how the new planning rules might affect their property. It uses two inputs - your block's zoning and its size - to indicate what types of housing are generally permitted or worth exploring under the ACT Territory Plan.",
      "Our products were created as we believe more Canberrans should have easy access to planning information. Housing policy is changing, and most people don't have a planner or developer in their corner to help them make sense of it. We built our products to change that.",
    ],
  },
  {
    title: "What this tool does and doesn't do",
    paragraphs: [
      "The results you see in either product are based on publicly available zoning and block size data. They reflect what the planning rules generally allow for a block of your size in your zone - nothing more.",
      "The Free Product does not assess the specific conditions of your property. It does not consider existing buildings, trees, easements, covenants, slope, heritage overlays, lease conditions, or anything else that may affect what can actually be built on your land. A block that appears eligible based on zone and size alone may face practical or legal constraints that this tool cannot detect.",
      "The Paid Product assesses specific site conditions based on available data, but it remains a preliminary informational output only. It does not constitute a professional site assessment and is subject to the same limitations of accuracy, currency, and professional advice as set out in this Disclaimer.",
      "Results from either product should be read as a starting point for your own research, they are indicative only and not a conclusive assessment.",
    ],
  },
  {
    title: "No reliance",
    paragraphs: [
      "You must not rely on the results of either product as the basis for any decision, including any decision to develop land, enter into a transaction, or incur costs.",
      "You are solely responsible for verifying all planning controls, constraints and development potential with relevant authorities and qualified professionals before acting on any information provided.",
    ],
  },
  {
    title: "This is not professional advice",
    paragraphs: [
      "The information provided by either product is general in nature and does not constitute planning advice, legal advice, financial advice, or investment advice. It should not be considered a substitute for professional advice.",
      "Before making any decisions about your property - including whether to proceed with a development, enter into any agreement, or seek development approval - you should consult a qualified town planner, solicitor, or other relevant professional.",
      "Payment for the Paid Product report does not alter the nature of the information provided. A Paid Product is an informational output, not professional planning, legal, or financial advice, and does not give rise to a duty of care or professional relationship beyond what is expressly stated in this Disclaimer.",
    ],
  },
  {
    title: "Accuracy and currency",
    paragraphs: [
      "We take reasonable care to ensure our data is current and our rules-based logic reflects the ACT Territory Plan as in force at the time of use. However, the ACT planning framework is reviewed and changes often, and the information produced by our products may not reflect the most recent amendments, interpretations, or legislation.",
      "We do not guarantee the accuracy, completeness or currency of any results derived from either product.",
    ],
  },
  {
    title: "Limitation of liability",
    paragraphs: [
      "By using either product, you acknowledge that you do so at your own risk. To the maximum extent permitted by law, BlockPlanner Pty Ltd is released from any action, claim, cost, damages, loss and other liability (including liability for negligence), whether direct, indirect, consequential, or otherwise, arising from your use of, or reliance on, either product and the results derived from either product.",
      "Where liability cannot be excluded by law (including under the Australian Consumer Law), our liability is limited to the extent provided for under the Australian Consumer Law (Schedule 2 of the Competition and Consumer Act 2010 (Cth)).",
      "Nothing in this Disclaimer excludes any rights you may have under the Australian Consumer Law that cannot lawfully be excluded.",
    ],
  },
  {
    title: "Third party data",
    paragraphs: [
      "Either product may incorporate or rely on data sourced from third parties or publicly available datasets. BlockPlanner Pty Ltd does not guarantee the accuracy, completeness or reliability of any third-party information.",
      "Where either product contains links to external websites or resources, those links are provided for convenience only and do not constitute endorsement. BlockPlanner Pty Ltd has no control over and accepts no responsibility for the content of those external sources.",
    ],
  },
  {
    title: "System availability and security",
    paragraphs: [
      "We do not warrant that this tool, or any associated website or services, will be uninterrupted, error-free, or free from viruses or other harmful components. You are responsible for ensuring that your own systems are protected when accessing this tool.",
    ],
  },
  {
    title: "Our mission",
    paragraphs: [
      "BlockPlanner is a Canberra-based company working to make property development more accessible to everyday Australians. We believe that better-informed landowners lead to better housing outcomes - and that increasing housing supply starts with people understanding what's possible on their own land.",
      "If you'd like to explore your options further, we offer a range of services and can connect you with professionals who work in this space.",
    ],
  },
  {
    title: "Governing law",
    paragraphs: [
      "This Disclaimer is governed by the laws of the Australian Capital Territory, Australia.",
    ],
  },
];

export const DisclaimerPage = () => {
  const navigate = useNavigate();

  return (
    <Main>
      <section>
        <div className="relative mx-auto max-w-260">
          <m.button
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.25, ease: "easeOut" }}
            className={classList([
              "flex align-middle gap-1",
              "text-sm font-medium",
              "underline decoration-transparent underline-offset-2",
              "hover:decoration-gray-700",
              "transition-colors duration-200",
              "px-2 py-1",
              "rounded-md",
            ])}
            onClick={() => navigate(-1)}
          >
            <ArrowBack fontSize="small" />
            Go Back
          </m.button>

          <m.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-4 rounded-md bg-white p-10 shadow-lg md:px-16 md:pb-16"
          >
            <Heading tag="h1" size="h1">
              Disclaimer - BlockPlanner
            </Heading>
            <div className="prose mt-6 max-w-none md:mt-10">
              {sections.map((section) => (
                <article key={section.title} className="mt-8 first:mt-0">
                  <h2>{section.title}</h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </article>
              ))}
            </div>
          </m.div>
        </div>
      </section>
    </Main>
  );
};

export default DisclaimerPage;
