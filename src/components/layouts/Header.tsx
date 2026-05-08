import Logo from "@/images/BlockPlanner-Inline.svg?react";
import { classList } from "@/utils/tailwind";

export const Header = () => {
  return (
    <>
      <header className="fixed w-full top-0 bg-bp-blueGum text-bp-sand z-[1400] shadow">
        <a
          href="#main-content"
          className={classList(
            "sr-only",
            "focus:not-sr-only",
            "focus:absolute top-2 left-2",
            "bg-bp-blueGum",
            "text-white",
            "px-4! py-2!",
            "rounded-md",
            "z-50",
          )}
        >
          Skip to main content
        </a>
        <div className="max-w-360 px-4 md:px-8 mx-auto">
          <div className="flex justify-between items-center h-15 lg:h-22.5">
            <a
              href="https://www.blockplanner.com.au"
              className="flex items-center rounded-md hover:opacity-80 transition-opacity"
              aria-label="BlockPlanner - Go to homepage"
            >
              <Logo fill="#f8f6e4" className="h-13 w-auto md:h-20" />
            </a>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
