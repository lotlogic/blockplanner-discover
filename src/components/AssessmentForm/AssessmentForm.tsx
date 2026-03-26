import AddressInput from "@/components/ui/AddressInput";
import Button from "@/components/ui/Button";
import Heading from "@/components/ui/Heading";
import { trackCtaClick, trackLookupStarted } from "@/utils/analytics";
import { motion as m } from "framer-motion";
import { useState } from "react";
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
  const [disabled, setDisabled] = useState(true);

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
      setDisabled(false);
    }
  };

  const handleInputChange = () => {
    if (selectedPlace) setSelectedPlace(null);
    setDisabled(true);
  };

  const onSearch = () => {
    if (disabled || !selectedPlace?.address) return;

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
        <div className="mx-auto max-w-4xl rounded-[2rem] border border-white/70 bg-white/75 px-6 py-10 shadow-[0_22px_70px_rgba(73,79,74,0.16)] backdrop-blur-md md:px-12 md:py-14">
          <p className="text-xs font-medium uppercase tracking-[0.32em] text-bp-eucalypt/80 md:text-sm">
            Free ACT property check
          </p>

          <Heading
            tag="h1"
            size="h1"
            className="mt-4 text-4xl leading-tight md:text-6xl"
          >
            Discover the potential of your property.
          </Heading>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-bp-blueGum/80 md:text-2xl">
            See what the ACT planning rules currently allow for your home.
            Free and instant.
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
                />
              </label>
            </div>
            <Button
              label="Check my block"
              disabled={disabled}
              onClick={onSearch}
              className="min-h-16 rounded-xl px-8 text-base md:min-w-56 md:text-lg"
            />
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-sm leading-7 text-bp-blueGum/72 md:text-base">
            General information only, not professional advice. Covers
            freestanding houses in RZ1 and RZ2 zones. Based on block size and
            zoning, site conditions may vary.{" "}
            <a
              href="/disclaimer"
              className="font-medium underline decoration-transparent underline-offset-3 hover:decoration-current transition-colors duration-200"
            >
              Read full disclaimer
            </a>
          </p>
        </div>
      </div>
    </m.section>
  );
};

export default FreeBlockAssessment;
