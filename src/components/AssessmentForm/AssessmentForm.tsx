import AddressInput from "@/components/ui/AddressInput";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { trackCtaClick, trackLookupStarted } from "@/utils/analytics";
import { motion as m } from "framer-motion";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type SelectedPlace = {
  address: string;
  lat?: number;
  lng?: number;
};

export const FreeBlockAssessment = () => {
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(
    null,
  );
  const addressInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const handlePlaceSelect = (place: google.maps.places.Place | null) => {
    if (place) {
      const address = place.formattedAddress?.trim();
      const lat = place.location?.lat();
      const lng = place.location?.lng();

      if (!address) return;

      setSelectedPlace({
        address,
        ...(typeof lat === "number" ? { lat } : {}),
        ...(typeof lng === "number" ? { lng } : {}),
      });
    }
  };

  const handleInputChange = () => {
    if (selectedPlace) setSelectedPlace(null);
  };

  const onSearch = () => {
    if (!selectedPlace?.address) {
      addressInputRef.current?.focus();
      return;
    }

    const params = new URLSearchParams({
      address: selectedPlace.address,
    });

    if (
      typeof selectedPlace.lat === "number" &&
      typeof selectedPlace.lng === "number"
    ) {
      params.set("lat", String(selectedPlace.lat));
      params.set("lng", String(selectedPlace.lng));
    }

    trackCtaClick("check_my_block", { address: selectedPlace.address });
    trackLookupStarted(selectedPlace.address);
    navigate("/assessment?" + params.toString());
  };

  return (
    <m.section
      className="mt-[6vh]! md:mt-[11vh]! z-5"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="mx-auto max-w-5xl text-center">
        <div className="mx-auto max-w-4xl border border-white/55 bg-[rgb(248_246_228_/_0.95)] px-6 py-10 shadow-[0_22px_70px_rgba(73,79,74,0.16)] md:px-12 md:py-14">
          <Heading
            tag="h1"
            size="h1"
            className="lg:text-[3.1rem] text-[2.1rem] leading-[1] md:text-[3.1rem]"
          >
            Discover the potential of your property.
          </Heading>

          <p className="mx-auto mt-6 max-w-3xl text-bp-blueGum/82">
            <span className="block text-[1.08rem] leading-7 md:text-[1.18rem] md:leading-8">
              See what the ACT planning rules currently allow for your home.
            </span>
            <span className="mt-2 block text-[0.88rem] leading-5 md:text-[0.9rem] md:leading-6">
              Free and fast.
            </span>
          </p>

          <div className="mx-auto mt-10 flex w-full max-w-xl flex-col gap-4 md:mt-12 md:max-w-4xl md:flex-row">
            <div className="grow">
              <label>
                <span className="sr-only">Enter your ACT address</span>
                <AddressInput
                  name="search"
                  placeholder="88 Prospect Lane, Curtin"
                  handlePlaceSelect={handlePlaceSelect}
                  handleInputChange={handleInputChange}
                  inputRef={addressInputRef}
                />
              </label>
            </div>
            <Button
              label="Check my property"
              onClick={onSearch}
              className="min-h-16 rounded-xl bg-[#C4622D]! px-8 text-base text-white! hover:bg-[#A84F23]! focus-visible:bg-[#A84F23]! md:min-w-56 md:text-base"
            />
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-[0.82rem] leading-6 text-bp-blueGum/72 md:text-[0.85rem]">
            General information only, not professional advice. Covers
            freestanding houses in RZ1 and RZ2 zones. Results based on block
            size and zone - site conditions assessed separately.
          </p>

          <p className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-center gap-x-3 gap-y-2 text-[0.78rem] leading-5 text-bp-blueGum/72 md:text-[0.82rem]">
            <a
              href="/privacy"
              className="font-medium underline decoration-transparent underline-offset-3 transition-colors duration-200 hover:decoration-current"
            >
              Privacy policy
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="/disclaimer"
              className="font-medium underline decoration-transparent underline-offset-3 transition-colors duration-200 hover:decoration-current"
            >
              Read Disclaimer
            </a>
            <span aria-hidden="true">·</span>
            <span>© 2026 BlockPlanner Pty Ltd</span>
          </p>
        </div>
      </div>
    </m.section>
  );
};

export default FreeBlockAssessment;
