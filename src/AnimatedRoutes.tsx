import { AnimatePresence } from "framer-motion";
import { Route, Routes, useLocation } from "react-router-dom";
import AssessmentPage from "./pages/AssessmentPage";
import CheckoutPage from "./pages/CheckoutPage";
import DisclaimerPage from "./pages/DisclaimerPage";
import { HomePage } from "./pages/Home";
import NotFound from "./pages/NotFound";
import PrivacyPage from "./pages/PrivacyPage";
// Import other pages...

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence initial={false} mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<HomePage />} />
        <Route path="/assessment" element={<AssessmentPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/disclaimer" element={<DisclaimerPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

export default AnimatedRoutes;
