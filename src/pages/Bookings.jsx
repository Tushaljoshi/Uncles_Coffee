import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const Booking = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [date, setDate] = useState(
    location.state?.date || "2026-09-12"
  );

  const [guests, setGuests] = useState(
    location.state?.guests || 2
  );

  const [time, setTime] = useState(
    location.state?.time || "19:30"
  );

  const [savedBooking] = useState(() => {
    try {
      const booking = localStorage.getItem(
        "uncleCoffeeBooking"
      );

      return booking ? JSON.parse(booking) : null;
    } catch {
      return null;
    }
  });

  const timeSlots = [
    "06:00 PM",
    "06:30 PM",
    "07:00 PM",
    "07:30 PM",
    "08:00 PM",
    "08:30 PM",
    "09:00 PM",
    "09:30 PM",
  ];

  const formatDate = (value) => {
    if (!value) return "";

    const selectedDate = new Date(
      `${value}T00:00:00`
    );

    return selectedDate.toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );
  };

  const handleCheckAvailability = () => {
    navigate("/bookings/tables", {
      state: {
        date,
        guests,
        time,
      },
    });
  };

  const handleCheckExistingBooking = () => {
    navigate("/bookings/tracking", {
      state: savedBooking,
    });
  };

  return (
    <div className="min-h-screen bg-cream text-espresso">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main>

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="mx-auto max-w-[1240px] px-4 pb-6 pt-7 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pb-14">

          {/* Step indicator */}

          <div className="mb-5 flex items-center gap-2">

            <span
              className="
                rounded-full
                bg-[#F4D7C8]
                px-3
                py-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-[#7E321C]
              "
            >
              {t.booking.step}
            </span>

            <span className="text-[10px] text-[#8B796A]">
              •
            </span>

            <span className="text-[10px] text-[#6E5C4F]">
              {t.booking.reserveTable}
            </span>

          </div>

          {/* Hero heading */}

          <div className="mt-8 grid items-start gap-6 sm:gap-8 lg:mt-12 lg:grid-cols-[1.05fr_0.95fr]">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div>

              <p
                className="
                  mb-3
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.18em]
                  text-caramel
                "
              >
                {t.booking.reservations}
              </p>

              <h1
                className="
                  max-w-[680px]
                  font-serif
                  text-[42px]
                  leading-[0.98]
                  tracking-[-0.035em]
                  text-espresso
                  sm:text-[52px]
                  lg:text-[64px]
                "
              >
                {t.booking.heroTitle}
              </h1>

              <p
                className="
                  mt-5
                  max-w-[580px]
                  text-[15px]
                  leading-7
                  text-[#654F41]
                  sm:text-[17px]
                "
              >
                {t.booking.heroDescription}
              </p>

              {/* Small benefits */}

              <div className="mt-7 grid max-w-[570px] grid-cols-1 gap-3 sm:grid-cols-3">

                <Benefit
                  icon="✓"
                  title={t.booking.noLogin}
                  text={t.booking.quickBooking}
                />

                <Benefit
                  icon="◷"
                  title={t.booking.liveStatus}
                  text={t.booking.trackBooking}
                />

                <Benefit
                  icon="♡"
                  title={t.booking.flexible}
                  text={t.booking.modifyWhenNeeded}
                />

              </div>

              <div className="mt-6 max-w-[600px] border-t border-[#E8DED0] pt-4 sm:mt-8 sm:pt-6">
                <div className="mt-3 grid gap-2 sm:mt-4 sm:grid-cols-3 sm:gap-3">
                  <InfoBlock
                    icon="◷"
                    title="Easy Reservations"
                    text="Choose your date, time and party size in seconds."
                  />

                  <InfoBlock
                    icon="⌂"
                    title="Choose Your Table"
                    text="Select from our window, bar, booth and garden seating."
                  />

                  <InfoBlock
                    icon="✓"
                    title="Track Your Booking"
                    text="Get live reservation updates without creating an account."
                  />
                </div>
              </div>

            </div>

            {/* =================================================
                BOOKING CARD
            ================================================= */}

            <div
              className="
                rounded-[26px]
                border
                border-[#E6DBCD]
                bg-white
                p-5
                shadow-[0_18px_45px_rgba(61,35,20,0.08)]
                sm:p-7
              "
            >

              {savedBooking && (
                <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-[#F5EFE7] p-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-caramel">
                      {t.booking.existingBooking}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-[#67564A]">
                      {savedBooking.bookingId || t.booking.reservationReady}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckExistingBooking}
                    className="shrink-0 rounded-full bg-caramel px-4 py-2.5 text-[10px] font-semibold text-cream transition hover:bg-caramelHover"
                  >
                    {t.booking.checkBooking}
                  </button>
                </div>
              )}

              {/* Card heading */}

              <div className="mb-6">

                <div className="flex items-center justify-between">

                  <div>

                    <p
                      className="
                        text-[9px]
                        font-bold
                        uppercase
                        tracking-[0.14em]
                        text-caramel
                      "
                    >
                      RESERVE YOUR TABLE
                    </p>

                    <h2
                      className="
                        mt-1
                        font-serif
                        text-[28px]
                        tracking-[-0.025em]
                        text-espresso
                      "
                    >
                      {t.booking.findTable}
                    </h2>

                  </div>

                  {/* Calendar icon */}

                  <div
                    className="
                      flex
                      h-11
                      w-11
                      items-center
                      justify-center
                      rounded-full
                      bg-[#F5EBDD]
                      text-caramel
                    "
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
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="17"
                        rx="2"
                      />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                    </svg>
                  </div>

                </div>

                <p className="mt-2 text-[12px] leading-5 text-[#806F61]">
                  {t.booking.chooseDateTime}
                </p>

              </div>

              {/* =================================================
                  DATE
              ================================================= */}

              <div className="mb-5">

                <label
                  htmlFor="booking-date"
                  className="
                    mb-2
                    block
                    text-[11px]
                    font-semibold
                    text-espresso
                  "
                >
                  {t.booking.date}
                </label>

                <div className="relative">

                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-caramel
                    "
                  >
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="17"
                        rx="2"
                      />
                      <path d="M16 2v4" />
                      <path d="M8 2v4" />
                      <path d="M3 10h18" />
                    </svg>
                  </div>

                  <input
                    id="booking-date"
                    type="date"
                    value={date}
                    min="2026-09-09"
                    onChange={(e) =>
                      setDate(e.target.value)
                    }
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-[#E5D9CA]
                      bg-[#F8F3EC]
                      pl-11
                      pr-4
                      text-[13px]
                      font-medium
                      text-espresso
                      outline-none
                      transition
                      focus:border-caramel
                      focus:ring-2
                      focus:ring-caramel/10
                    "
                  />

                </div>

              </div>

              {/* =================================================
                  GUESTS
              ================================================= */}

              <div className="mb-5">

                <label
                  className="
                    mb-2
                    block
                    text-[11px]
                    font-semibold
                    text-espresso
                  "
                >
                  {t.booking.guests}
                </label>

                <div
                  className="
                    grid
                    grid-cols-5
                    gap-2
                  "
                >

                  {[1, 2, 3, 4, 5].map(
                    (number) => {

                      const active =
                        guests === number;

                      return (
                        <button
                          key={number}
                          type="button"
                          onClick={() =>
                            setGuests(number)
                          }
                          className={`
                            h-11
                            rounded-xl
                            text-[12px]
                            font-medium
                            transition-all
                            ${active
                              ? "bg-caramel text-cream shadow-sm"
                              : "bg-[#F8F3EC] text-espresso hover:bg-latte"
                            }
                          `}
                        >
                          {number === 5
                            ? "5+"
                            : number}
                        </button>
                      );
                    }
                  )}

                </div>

                <p className="mt-2 text-[10px] text-[#89786B]">
                  {t.booking.groupHelp}
                </p>

              </div>

              {/* =================================================
                  TIME
              ================================================= */}

              <div className="mb-6">

                <div className="mb-2 flex items-center justify-between">

                  <label
                    className="
                      text-[11px]
                      font-semibold
                      text-espresso
                    "
                  >
                    {t.booking.preferredTime}
                  </label>

                  <span className="text-[9px] text-[#89786B]">
                    {t.booking.dinner}
                  </span>

                </div>

                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">

                  {timeSlots.map((slot) => {

                    const active =
                      formatTimeForInput(slot) ===
                      time;

                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() =>
                          setTime(
                            formatTimeForInput(
                              slot
                            )
                          )
                        }
                        className={`
                          rounded-xl
                          border
                          px-2
                          py-2.5
                          text-[10px]
                          font-medium
                          transition-all
                          ${active
                            ? "border-caramel bg-caramel text-cream"
                            : "border-[#E5D9CA] bg-white text-espresso hover:border-caramel hover:bg-[#FAF3EA]"
                          }
                        `}
                      >
                        {slot.replace("PM", t.booking.periodPM)}
                      </button>
                    );
                  })}

                </div>

              </div>

              {/* =================================================
                  SEARCH SUMMARY
              ================================================= */}

              <div
                className="
                  mb-5
                  rounded-xl
                  bg-[#F5EFE7]
                  p-4
                "
              >

                <p
                  className="
                    text-[8px]
                    font-bold
                    uppercase
                    tracking-[0.12em]
                    text-caramel
                  "
                >
                  {t.booking.search}
                </p>

                <div className="mt-2 grid grid-cols-3 gap-2">

                  <SummaryItem
                    label="Date"
                    value={formatDate(date)}
                  />

                  <SummaryItem
                    label="Guests"
                    value={`${guests} ${guests === 1
                        ? "Guest"
                        : "Guests"
                      }`}
                  />

                  <SummaryItem
                    label="Time"
                    value={formatTimeDisplay(
                      time
                    )}
                  />

                </div>

              </div>

              {/* =================================================
                  CTA
              ================================================= */}

              <button
                type="button"
                onClick={
                  handleCheckAvailability
                }
                className="
                  flex
                  h-14
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-full
                  bg-caramel
                  px-6
                  py-3.5
                  text-sm
                  font-semibold
                  text-cream
                  shadow-[0_8px_20px_rgba(163,93,56,0.22)]
                  transition-all
                  hover:bg-caramelHover
                  hover:shadow-[0_10px_25px_rgba(163,93,56,0.28)]
                  active:scale-[0.99]
                "
              >
                {t.booking.checkAvailability}

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>

              </button>

              <p
                className="
                  mt-3
                  text-center
                  text-[9px]
                  text-[#89786B]
                "
              >
                You can modify or cancel your
                reservation later.
              </p>

            </div>

          </div>

        </section>

        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}

        <section className="mx-auto max-w-[1240px] px-4 py-7 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

          <div className="mb-8">

            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-caramel
              "
            >
              {t.booking.howItWorks}
            </p>

            <h2
              className="
                mt-1
                font-serif
                text-[30px]
                tracking-[-0.025em]
                text-espresso
                sm:text-[36px]
              "
            >
              {t.booking.easySteps}
            </h2>

          </div>

          <div className="grid gap-4 sm:grid-cols-3">

            <StepCard
              number="01"
              title={t.booking.findTime}
              text="Choose your preferred date, time and number of guests."
            />

            <StepCard
              number="02"
              title={t.booking.chooseTable}
              text="Browse available tables and select the spot you love."
            />

            <StepCard
              number="03"
              title={t.booking.confirmVisit}
              text="Enter your details and receive your reservation confirmation."
            />

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          border-t
          border-[#E8DED0]
          bg-[#F5F0E8]
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-[1240px]
            flex-col
            gap-3
            px-4
            py-6
            pb-28
            sm:px-6
            sm:pb-32
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-8
            lg:pb-8
          "
        >
        </div>

      </footer>

    </div>
  );
};


/* ===========================================================
   BENEFIT COMPONENT
=========================================================== */

const Benefit = ({
  icon,
  title,
  text,
}) => {
  return (
    <div
      className="
        flex
        items-center
        gap-2.5
        rounded-xl
        border
        border-[#E8DED0]
        bg-white/60
        px-3
        py-2.5
      "
    >

      <div
        className="
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-[#F3DDCE]
          text-xs
          text-caramel
        "
      >
        {icon}
      </div>

      <div className="min-w-0">

        <p className="text-[10px] font-semibold text-espresso">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[8px] text-[#806F61]">
          {text}
        </p>

      </div>

    </div>
  );
};


/* ===========================================================
   SUMMARY ITEM
=========================================================== */

const SummaryItem = ({
  label,
  value,
}) => {
  return (
    <div className="min-w-0">

      <p className="text-[8px] text-[#8A796C]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[10px] font-semibold text-espresso">
        {value}
      </p>

    </div>
  );
};


/* ===========================================================
   INFORMATION BLOCK
=========================================================== */

const InfoBlock = ({
  icon,
  title,
  text,
}) => {
  return (
    <div className="flex gap-3 px-3 py-4 sm:px-6 sm:py-6">

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#EAD8C0] text-sm text-caramel"
      >
        {icon}
      </div>

      <div>

        <h3 className="font-serif text-[15px] leading-tight text-espresso">
          {title}
        </h3>

        <p className="mt-1 text-[9px] leading-4 text-[#756357]">
          {text}
        </p>

      </div>

    </div>
  );
};


/* ===========================================================
   STEP CARD
=========================================================== */

const StepCard = ({
  number,
  title,
  text,
}) => {
  return (
    <div
      className="
        rounded-2xl
        border
        border-[#E6DBCD]
        bg-white
        p-5
        transition
        hover:-translate-y-0.5
        hover:shadow-[0_10px_25px_rgba(61,35,20,0.06)]
      "
    >

      <span
        className="
          text-[9px]
          font-bold
          tracking-[0.12em]
          text-caramel
        "
      >
        {number}
      </span>

      <h3
        className="
          mt-3
          font-serif
          text-[21px]
          text-espresso
        "
      >
        {title}
      </h3>

      <p className="mt-2 text-[11px] leading-5 text-[#756357]">
        {text}
      </p>

    </div>
  );
};


/* ===========================================================
   TIME HELPERS
=========================================================== */

const formatTimeForInput = (time) => {
  const [value, period] = time.split(" ");

  let [hours, minutes] =
    value.split(":").map(Number);

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}`;
};


const formatTimeDisplay = (time) => {
  if (!time) return "";

  let [hours, minutes] =
    time.split(":").map(Number);

  const period =
    hours >= 12 ? "PM" : "AM";

  hours =
    hours % 12 || 12;

  return `${hours}:${String(
    minutes
  ).padStart(2, "0")} ${period}`;
};


export default Booking;