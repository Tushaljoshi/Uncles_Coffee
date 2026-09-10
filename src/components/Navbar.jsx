import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

const Navbar = () => {
  const { t, language, changeLanguage } = useLanguage();

  const [languageOpen, setLanguageOpen] =
    useState(false);
  const [tableEditing, setTableEditing] = useState(false);
  const [tableNumber, setTableNumber] = useState("12");
  const [customerName, setCustomerName] = useState("Tushal");

  // =========================================================
  // DESKTOP NAVIGATION STYLE
  // =========================================================

  const navLinkClass = ({ isActive }) =>
    `rounded-full px-4 py-2.5 text-xs font-medium whitespace-nowrap transition-all duration-200 lg:px-5 lg:text-sm ${isActive
      ? "bg-caramel text-cream shadow-sm"
      : "text-espresso hover:bg-latte"
    }`;

  // =========================================================
  // MOBILE BOTTOM NAVIGATION STYLE
  // =========================================================

  const mobileNavClass = ({ isActive }) =>
    `flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[8px] font-medium transition-all duration-200 sm:text-[9px] ${isActive
      ? "bg-caramel text-cream shadow-sm"
      : "text-espresso hover:bg-latte"
    }`;

  // =========================================================
  // LANGUAGE OPTIONS
  // =========================================================

  const languages = [
    {
      code: "en",
      label: "English",
      native: "English",
    },
    {
      code: "hi",
      label: "Hindi",
      native: "हिन्दी",
    },
  ];

  const currentLanguage =
    languages.find(
      (item) => item.code === language
    ) || languages[0];

  return (
    <>
      {/* =====================================================
          TOP NAVBAR
      ===================================================== */}

      <header
        className="
          sticky
          top-0
          z-50
          w-full
          border-b
          border-[#E8DED0]
          bg-cream/95
          backdrop-blur-md
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[64px]
            w-full
            max-w-[1240px]
            items-center
            justify-between
            gap-3
            px-3
            sm:h-[68px]
            sm:px-5
            lg:h-[72px]
            lg:px-8
          "
        >

          {/* =================================================
              LOGO
          ================================================= */}

          <NavLink
            to="/"
            end
            className="
              flex
              relative
              min-w-0
              shrink-0
              items-center
              gap-2
              sm:gap-3
            "
          >

            {/* Logo */}

            <div
              className="
                flex
                h-9
                w-9
                shrink-0
                items-center
                justify-center
                border
                border-[#E5D8C8]
                bg-[#F7F0E6]
                sm:h-10
                sm:w-10
              "
            >
              <img
                src="/logo1.png"
                alt="Uncle's Coffee Logo"
                className="
                  h-10
                  w-10
                  object-contain
                  sm:h-12
                  sm:w-12
                "
              />
            </div>

            {/* Brand */}

            <div className="min-w-0 leading-none">

              <h1
                className="
                  truncate
                  font-serif
                  text-[15px]
                  font-semibold
                  tracking-[-0.02em]
                  text-espresso
                  sm:text-[17px]
                  lg:text-[19px]
                "
              >
                Uncle&apos;s Coffee
              </h1>

              <p
                className="
                  mt-1
                  text-[7px]
                  font-semibold
                  uppercase
                  tracking-[0.14em]
                  text-caramel
                  sm:text-[8px]
                  lg:text-[9px]
                "
              >
                Table Dining
              </p>

            </div>

          </NavLink>

          {/* =================================================
              DESKTOP NAVIGATION
          ================================================= */}

          <nav className="hidden items-center gap-0.5 lg:flex">

            <NavLink
              to="/"
              end
              className={navLinkClass}
            >
              <span className="flex text-md font-bold items-center">
                {t.nav.welcome}
              </span>
            </NavLink>

            <NavLink
              to="/menu"
              className={navLinkClass}
            >
              <span className="flex font-bold items-center">
                {t.nav.menu}
              </span>
            </NavLink>

            <NavLink
              to="/cart"
              className={navLinkClass}
            >
              <span className="flex font-bold items-center">
                {t.nav.cart}
              </span>
            </NavLink>

            <NavLink
              to="/tracking"
              className={navLinkClass}
            >
              <span className="flex font-bold items-center">
                {t.nav.tracking}
              </span>
            </NavLink>

            <NavLink
              to="/myorders"
              className={navLinkClass}
            >
              <span className="flex font-bold items-center">
                {t.nav.orders}
              </span>
            </NavLink>

            <NavLink
              to="/bookings"
              className={navLinkClass}
            >
              <span className="flex font-bold items-center">
                {t.nav.bookings}
              </span>
            </NavLink>

          </nav>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <div
            className="
              flex
              min-w-0
              shrink-0
              items-center
              gap-2
              sm:gap-3
            "
          >

            {/* =================================================
                LANGUAGE SELECTOR
            ================================================= */}

            <div className="relative">

              <button
                type="button"
                onClick={() =>
                  setLanguageOpen(
                    !languageOpen
                  )
                }
                aria-label={t.common.language}
                className="
                  flex
                  items-center
                  gap-1.5
                  rounded-full
                  border
                  border-[#E5D9CA]
                  bg-[#F7F2EA]
                  px-2.5
                  py-2
                  text-[12px]
                  font-medium
                  text-espresso
                  transition
                  hover:bg-latte
                  sm:px-3
                  sm:text-[10px]
                "
              >

                <span className="text-sm">
                  🌐
                </span>

                <span className="hidden font-bold md:inline">
                  {currentLanguage.native}
                </span>

                <span className="text-[7px]">
                  ▼
                </span>

              </button>

              {/* Language Dropdown */}

              {languageOpen && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+8px)]
                    z-[100]
                    w-[145px]
                    overflow-hidden
                    rounded-xl
                    border
                    border-[#E5D9CA]
                    bg-white
                    p-1
                    shadow-[0_10px_30px_rgba(61,35,20,0.12)]
                  "
                >

                  <div className="px-3 py-2">

                    <p
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.1em]
                        text-[#806F61]
                      "
                    >
                      {t.common.language}
                    </p>

                  </div>

                  {languages.map((item) => {

                    const selected =
                      language === item.code;

                    return (
                      <button
                        key={item.code}
                        type="button"
                        onClick={() => {
                          changeLanguage(
                            item.code
                          );

                          setLanguageOpen(
                            false
                          );
                        }}
                        className={`
                          flex
                          w-full
                          items-center
                          justify-between
                          rounded-lg
                          px-3
                          py-2.5
                          text-left
                          text-[10px]
                          transition
                          ${selected
                            ? "bg-caramel text-cream"
                            : "text-espresso hover:bg-latte"
                          }
                        `}
                      >

                        <span>
                          {item.native}
                        </span>

                        {selected && (
                          <span>
                            ✓
                          </span>
                        )}

                      </button>
                    );
                  })}

                </div>
              )}

            </div>

            {/* =================================================
                TABLE INFORMATION
            ================================================= */}

            <button
              type="button"
              onClick={() => setTableEditing((editing) => !editing)}
              className="
                flex
                max-w-[150px]
                items-center
                gap-1.5
                rounded-full
                bg-[#EFE9DF]
                px-2.5
                py-2
                text-[8px]
                font-medium
                text-espresso
                transition
                hover:bg-latte
                sm:max-w-none
                sm:gap-2
                sm:px-4
                sm:text-xs
              "
            >

              <span
                className="
                  h-1.5
                  w-1.5
                  shrink-0
                  rounded-full
                  bg-caramel
                  sm:h-2
                  sm:w-2
                "
              />

              <span className="text-[12px] font-bold truncate">
                {t.welcome.table} {tableNumber} · {customerName}
              </span>

              <span
                className="
                  hidden
                  shrink-0
                  font-semibold
                  text-caramel
                  underline
                  underline-offset-2
                  sm:inline
                "
              >
                {t.nav.change}
              </span>

            </button>

            {tableEditing && (
              <div className="absolute right-0 top-[calc(100%+8px)] z-[100] w-[min(280px,calc(100vw-24px))] rounded-xl border border-[#E5D9CA] bg-white p-3 shadow-[0_10px_30px_rgba(61,35,20,0.12)]">
                <div className="grid gap-2">
                  <label className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#806F61]">
                    {t.welcome.table}
                    <input
                      type="text"
                      value={tableNumber}
                      onChange={(event) => setTableNumber(event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg bg-[#F7F2EA] px-3 text-xs text-espresso outline-none focus:ring-2 focus:ring-caramel/20"
                    />
                  </label>

                  <label className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#806F61]">
                    {t.welcome.customerName}
                    <input
                      type="text"
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      className="mt-1 h-9 w-full rounded-lg bg-[#F7F2EA] px-3 text-xs text-espresso outline-none focus:ring-2 focus:ring-caramel/20"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setTableEditing(false)}
                    className="mt-1 rounded-full bg-caramel px-3 py-2 text-[10px] font-semibold text-cream"
                  >
                    {t.common.save}
                  </button>
                </div>
              </div>
            )}

          </div>

        </div>

      </header>

      {/* =====================================================
          MOBILE BOTTOM NAVIGATION
      ===================================================== */}

      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-[60]
          border-t
          border-[#E5D9CA]
          bg-cream/95
          px-2
          pt-2
          pb-[env(safe-area-inset-bottom)]
          shadow-[0_-5px_20px_rgba(61,35,20,0.08)]
          backdrop-blur-xl
          lg:hidden
        "
      >

        <div
          className="
            mx-auto
            flex
            w-full
            max-w-md
            items-center
            gap-1
          "
        >

          {/* =================================================
              WELCOME
          ================================================= */}

          <NavLink
            to="/"
            end
            className={mobileNavClass}
          >

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 11.5 12 4l9 7.5" />
              <path d="M5 10.5V20h14v-9.5" />
              <path d="M9 20v-5h6v5" />
            </svg>

            <span className="whitespace-nowrap text-[10px] font-bold sm:text-[12px]">
              {t.nav.welcome}
            </span>

          </NavLink>

          {/* =================================================
              MENU
          ================================================= */}

          <NavLink
            to="/menu"
            className={mobileNavClass}
          >

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 5h16" />
              <path d="M4 9h16" />
              <path d="M4 13h10" />
              <path d="M4 17h8" />
            </svg>

            <span className="whitespace-nowrap text-[10px] font-bold sm:text-[12px]">
              {t.nav.menu}
            </span>

          </NavLink>

          {/* =================================================
              CART
          ================================================= */}

          <NavLink
            to="/cart"
            className={mobileNavClass}
          >

            <div className="relative">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 8h12l1 12H5L6 8Z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
            </div>

            <span className="whitespace-nowrap text-[10px] font-bold sm:text-[12px]">
              {t.nav.cart}
            </span>

          </NavLink>

          {/* =================================================
              LIVE TRACKING
          ================================================= */}

          <NavLink
            to="/tracking"
            className={mobileNavClass}
          >

            <div className="relative">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="8"
                />

                <path d="M12 8v4l2.5 2" />

              </svg>

              {/* Live indicator */}

              <span
                className="
                  absolute
                  -right-1
                  -top-1
                  h-2
                  w-2
                  rounded-full
                  bg-success
                  ring-2
                  ring-cream
                "
              />

            </div>

            <span className="whitespace-nowrap text-[10px] font-bold sm:text-[12px]">
              {t.nav.tracking}
            </span>

          </NavLink>

          {/* =================================================
              MY ORDERS
          ================================================= */}

          <NavLink
            to="/myorders"
            className={mobileNavClass}
          >

            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 3h12v18H6z" />

              <path d="M9 7h6" />
              <path d="M9 11h6" />
              <path d="M9 15h4" />

            </svg>

            <span className="whitespace-nowrap text-[10px] font-bold sm:text-[12px]">
              {t.nav.orders}
            </span>

          </NavLink>

          <NavLink
            to="/bookings"
            className={mobileNavClass}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="3.5" />
              <path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" />
              <path d="M3 20h18" />
            </svg>
            <span className="whitespace-nowrap text-[10px] font-bold sm:text-[12px]">
              {t.nav.bookings}
            </span>

          </NavLink>

        </div>

      </nav>

      {/* =====================================================
          MOBILE CONTENT SPACING
          
          Prevents the fixed bottom navigation from covering
          the bottom of every page.
      ===================================================== */}

    </>
  );
};

export default Navbar;