import Logo from "@/images/BlockPlanner-Inline.svg?react";
import { classList } from "@/utils/tailwind";
import { Link } from "react-router-dom";

export const Header = () => {
  const nav = [{ label: "Privacy", url: "/privacy" }];

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
            <Link
              to="/"
              className="flex items-center rounded-md hover:opacity-80 transition-opacity"
              aria-label="BlockPlanner - Go to homepage"
            >
              <Logo fill="#f8f6e4" className="h-13 w-auto md:h-20" />
            </Link>
            <div>
              <nav className="block" role="menubar">
                <ul className="relative flex items-center gap-6 xl:gap-8">
                  {nav.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.url}
                        className={classList(
                          "font-medium",
                          "underline decoration-transparent underline-offset-2",
                          "hover:decoration-bp-sand",
                          "transition-colors duration-200",
                          "px-2 py-1",
                          "rounded-md",
                        )}
                        role="menuitem"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
