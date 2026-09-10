import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const BookingTracking = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // GET BOOKING DATA
  // =========================================================

  const stateBooking = location.state;

  const savedBooking = localStorage.getItem(
    "uncleCoffeeBooking"
  );

  const storedBooking = savedBooking
    ? JSON.parse(savedBooking)
    : null;

  const bookingData =
    stateBooking || storedBooking || {};

  // =========================================================
  // DEFAULT DATA

  const reservation =
    bookingData.reservation || {
      date: "2026-09-12",
      guests: 2,
      time: "19:30",
      table: {
        id: 12,
        name: "Table 12",
        location: "Window View",
      },
    };

  const customer =
    bookingData.customer || {
      name: "Tushal",
      mobile: "9876543210",
    };

  const bookingId =
    bookingData.bookingId || "#BK-1042";

  // =========================================================
  // CURRENT STATUS
  // =========================================================

  const [currentStep, setCurrentStep] =
    useState(2);

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [showCancelPopup, setShowCancelPopup] =
    useState(false);

  // =========================================================
  // SIMULATE LIVE BOOKING STATUS
  // =========================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentStep(2);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  // =========================================================
  // SAVE BOOKING
  // =========================================================

  useEffect(() => {
    if (bookingData && Object.keys(bookingData).length) {
      localStorage.setItem(
        "uncleCoffeeBooking",
        JSON.stringify(bookingData)
      );
    }
  }, []);

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formattedDate = formatDate(
    reservation.date
  );

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formattedTime = formatTime(
    reservation.time
  );

  // =========================================================
  // HISTORY DATA
  // =========================================================

  const history = [
    {
      id: bookingId,
      date: "Today",
      table: `Table ${reservation.table?.id || 12}`,
      guests: reservation.guests || 2,
      area:
        reservation.table?.location ||
        "Window View",
      time: formattedTime,
      status: "Confirmed",
      statusType: "upcoming",
      action: "View Tracking",
      description:
        "Host Maya preparing table",
    },
    {
      id: "#BK-1035",
      date: "Yesterday",
      table: "Table 08",
      area: "Roaster Booth",
      time: "08:15 PM",
      status: "Completed",
      statusType: "completed",
      action: "Book Again",
      description: "Paid • Bill ₹1,850",
    },
  ];

  const filteredHistory =
    activeFilter === "All"
      ? history
      : history.filter((item) => {
          if (
            activeFilter === "Upcoming"
          ) {
            return item.statusType === "upcoming";
          }
          if (
            activeFilter === "Completed"
          ) {
            return item.statusType === "completed";
          }

          if (
            activeFilter === "Cancelled"
          ) {
            return item.statusType === "cancelled";
          }

          return true;
        });

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancel = () => {
    localStorage.removeItem(
      "uncleCoffeeBooking"
    );

    navigate("/bookings");
  };

  // =========================================================
  // MODIFY BOOKING
  // =========================================================

  const handleModify = () => {
    navigate("/bookings/tables", {
      state: {
        date: reservation.date,
        guests: reservation.guests,
        time: reservation.time,
      },
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

      <main className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8 lg:pb-20">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="mb-6 sm:mb-10">

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-caramel" />

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-caramel
                  "
                >
                  SLOW BAR HOSPITALITY
                </p>

              </div>

              <h1
                className="
                  font-serif
                  text-[36px]
                  leading-none
                  tracking-[-0.04em]
                  text-espresso
                  sm:text-[46px]
                "
              >
                {t.bookingTracking.pageTitle}
              </h1>

              <p className="mt-3 max-w-[650px] text-[13px] text-[#67564A]">
                {t.bookingTracking.pageIntro}
              </p>

            </div>

            {/* Booking credentials */}

            <div
              className="
                flex
                flex-col
                gap-2
                rounded-2xl
                bg-[#F5F0E8]
                p-2
                sm:flex-row
              "
            >

              <div
                className="
                  flex
                  min-w-0
                  sm:min-w-[150px]
                  items-center
                  gap-3
                  rounded-xl
                  bg-white
                  px-4
                  py-3
                "
              >
                <span className="text-[16px] text-caramel">
                  #
                </span>

                <div>

                  <p className="text-[8px] uppercase tracking-wider text-[#8B7B6E]">
                    {t.bookingTracking.bookingId}
                  </p>

                  <p className="text-[11px] font-semibold text-espresso">
                    {bookingId}
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  min-w-0
                  sm:min-w-[175px]
                  items-center
                  gap-3
                  rounded-xl
                  bg-white
                  px-4
                  py-3
                "
              >
                <span className="text-[15px] text-caramel">
                  ♧
                </span>

                <div>

                  <p className="text-[8px] uppercase tracking-wider text-[#8B7B6E]">
                    {t.bookingTracking.phone}
                  </p>

                  <p className="text-[11px] font-semibold text-espresso">
                    +91{" "}
                    {formatPhone(
                      customer.mobile
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>

        {/* ===================================================
            ACTIVE BOOKING GRID
        =================================================== */}

        <section className="grid min-w-0 gap-5 sm:gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">

          {/* =================================================
              LEFT TRACKING CARD
          ================================================= */}

          <div
            className="
              rounded-[24px]
              border
              border-[#E8DED1]
              bg-[#F6F0E7]
              p-5
              shadow-[0_8px_25px_rgba(61,35,20,0.06)]
              sm:p-7
            "
          >

            {/* Active heading */}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-caramel
                  "
                >
                  {t.bookingTracking.activeBooking}
                </p>

                <div className="mt-2 flex flex-wrap items-baseline gap-2">

                  <h2 className="font-serif text-[27px] text-espresso">
                    {bookingId}
                  </h2>

                  <span className="text-[11px] text-[#79685C]">
                    • Slow Roast Lounge
                  </span>

                </div>

              </div>

              {/* Status */}

              <div
                className="
                  flex
                  w-fit
                  items-center
                  gap-2
                  rounded-full
                  bg-[#F1DCCF]
                  px-4
                  py-2
                  text-[9px]
                  font-semibold
                  text-caramel
                "
              >

                <span className="h-3 w-3 rounded-full bg-caramel" />

                {t.bookingTracking.preparing}

              </div>

            </div>

            {/* =================================================
                READY TIME
            ================================================= */}

            <div
              className="
                mb-5
                flex
                items-start
                gap-4
                rounded-2xl
                border
                border-[#E8DDD1]
                bg-white
                p-4
                sm:mb-7
                sm:p-5
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#F5E0CA]
                  text-[21px]
                  text-caramel
                "
              >
                ◷
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <p className="text-[11px] font-semibold text-espresso">
                    {t.bookingTracking.readyBy} 07:20 PM
                  </p>

                  <span
                    className="
                      rounded-full
                      bg-[#FAD9CC]
                      px-2
                      py-1
                      text-[7px]
                      font-semibold
                      text-caramel
                    "
                  >
                    {t.bookingTracking.early}
                  </span>

                </div>

                <p className="mt-1 text-[10px] leading-4 text-[#705E51]">
                  Host Maya is hand-arranging fresh
                  water carafes and botanical linens
                  for you.
                </p>

              </div>

            </div>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="relative">

              {/* Vertical line */}

              <div
                className="
                  absolute
                  left-[15px]
                  top-4
                  h-[290px]
                  w-px
                  bg-[#D9CEC2]
                "
              />

              <TimelineItem
                number="✓"
                title={t.bookingTracking.bookingRequested}
                description="Online dine-in request submitted"
                time="04:15 PM"
                completed
              />

              <TimelineItem
                number="✓"
                title={t.bookingTracking.reservationConfirmed}
                description="Seating allocated in slow bar zone"
                time="04:16 PM"
                completed
              />

              <TimelineItem
                number="✦"
                title={t.bookingTracking.preparing}
                description="Host setting artisan ceramic ware, brass cutlery, and chilled infused water."
                time="In Progress"
                active
              />

              <TimelineItem
                number=""
                title={t.bookingTracking.readyArrival}
                description="Priority escort waiting at front counter"
                time="Est. 07:20 PM"
              />

              <TimelineItem
                number=""
                title={t.bookingTracking.checkedIn}
                description="Enjoy your handcrafted slow roast session"
                time="Target 07:30 PM"
                last
              />

            </div>

            {/* =================================================
                BOOKING SUMMARY
            ================================================= */}

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-5
                rounded-2xl
                bg-white
                p-4
                sm:grid-cols-4
                sm:p-5
              "
            >

              <Summary
                label="SEATING"
                value={`Table ${
                  reservation.table?.id || 12
                }`}
              />

              <Summary
                label="PARTY SIZE"
                value={`${reservation.guests} Guests`}
              />

              <Summary
                label="SCHEDULE"
                value={formattedTime}
              />

              <Summary
                label="ATMOSPHERE"
                value={
                  reservation.table?.location ||
                  "Window View"
                }
              />

            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">

              <button
                type="button"
                onClick={handleModify}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#EAE5DE]
                  px-4
                  py-3
                  text-[10px]
                  font-medium
                  text-espresso
                  transition
                  hover:bg-latte
                "
              >
                <span>▣</span>
                {t.bookingTracking.modify}
              </button>

              <button
                type="button"
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#EAE5DE]
                  px-4
                  py-3
                  text-[10px]
                  font-medium
                  text-espresso
                  transition
                  hover:bg-latte
                "
              >
                <span>♧</span>
                {t.bookingTracking.callHost}
              </button>

              <button
                type="button"
                onClick={() => setShowCancelPopup(true)}
                className="
                  rounded-full
                  bg-[#FADAD5]
                  px-5
                  py-3
                  text-[10px]
                  font-medium
                  text-error
                  transition
                  hover:bg-[#F5C8C1]
                "
              >
                ⊗ {t.bookingTracking.cancel}
              </button>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <aside>

            {/* =================================================
                TABLE PREVIEW
            ================================================= */}

            <div
              className="
                overflow-hidden
                rounded-[24px]
                bg-white
                shadow-[0_8px_25px_rgba(61,35,20,0.06)]
              "
            >

              <div className="relative h-[230px] overflow-hidden bg-[#E4D8CA]">

                <img
                  src="/table12.jpg"
                  alt="Reserved table"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

                <span
                  className="
                    absolute
                    left-4
                    top-4
                    rounded-full
                    bg-white/95
                    px-3
                    py-2
                    text-[8px]
                    font-semibold
                    text-espresso
                    shadow-sm
                  "
                >
                  {t.bookingTracking.preview}
                </span>

              </div>

              <div className="p-5">

                <div className="flex items-start justify-between gap-3">

                  <h3 className="font-serif text-[23px] leading-tight text-espresso">
                    Window Slow Bar No.{" "}
                    {reservation.table?.id || 12}
                  </h3>

                  <span className="whitespace-nowrap text-[8px] font-bold uppercase text-caramel">
                    QUIET ZONE
                  </span>

                </div>

                <p className="mt-2 text-[10px] leading-5 text-[#69584C]">
                  Features natural garden view,
                  individual brass task lighting,
                  and proximity to the manual V60
                  slow drip station.
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-[8px] font-medium text-[#6C5A4D]">

                  <span>⌁ High-Speed WiFi</span>
                  <span>♧ AC Sockets</span>
                  <span>▱ Cushioned Bench</span>

                </div>

              </div>

            </div>

            {/* =================================================
                HOST NOTE
            ================================================= */}

            <div
              className="
                mt-5
                rounded-[24px]
                bg-[#F0EBE4]
                p-5
              "
            >

              <div className="flex gap-4">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-caramel
                    text-xl
                    text-cream
                  "
                >
                  ☕
                </div>

                <div>

                  <h3 className="font-serif text-[18px] text-espresso">
                    Host Courtesy Note
                  </h3>

                  <p className="mt-1 text-[10px] leading-5 text-[#67564A]">
                    We hold reserved tables for up
                    to 15 minutes past scheduled
                    arrival. If you&apos;re experiencing
                    unexpected traffic or delays,
                    simply call host Maya or tap
                    modify below.
                  </p>

                </div>

              </div>

            </div>

          </aside>

        </section>

        {/* ===================================================
            RESERVATION HISTORY
        =================================================== */}

        <section className="mt-10 sm:mt-20">

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h2
                className="
                  font-serif
                  text-[30px]
                  tracking-[-0.03em]
                  text-espresso
                  sm:text-[36px]
                "
              >
                {t.bookingTracking.history}
              </h2>

              <p className="mt-2 text-[11px] text-[#6F5E52]">
                {t.bookingTracking.historyIntro}
              </p>

            </div>

            {/* Filters */}

            <div
              className="
                flex
                w-fit
                flex-wrap
                rounded-full
                bg-[#F0EBE4]
                p-1
              "
            >

              {[
                "All",
                "Upcoming",
                "Completed",
                "Cancelled",
              ].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-[9px]
                    font-medium
                    transition
                    ${
                      activeFilter === filter
                        ? "bg-caramel text-cream"
                        : "text-[#68574B] hover:bg-white"
                    }
                  `}
                >
                  {filter === "All"
                    ? t.bookingTracking.all
                    : filter === "Upcoming"
                    ? t.bookingTracking.upcoming
                    : filter === "Completed"
                    ? t.bookingTracking.completed
                    : t.bookingTracking.cancelled}
                  {filter === "Upcoming" &&
                    " (1)"}
                  {filter === "Completed" &&
                    " (1)"}
                </button>
              ))}

            </div>

          </div>

          {/* History Cards */}

          <div className="grid gap-4 lg:grid-cols-2">

            {filteredHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onTrack={() =>
                  navigate(
                    "/bookings/tracking",
                    {
                      state: bookingData,
                    }
                  )
                }
                onBookAgain={() =>
                  navigate("/bookings")
                }
              />
            ))}

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
            gap-4
            px-4
            py-6
            pb-28
            sm:px-6
            sm:pb-32
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-8
            lg:pb-9
          "
        >

          <div>

            <p className="font-serif text-[18px] text-espresso">
              Uncle&apos;s Coffee
              <span className="ml-2 font-sans text-[10px] text-[#806F61]">
                — Artisanal roastery & slow bar.
              </span>
            </p>

            <p className="mt-2 text-[10px] text-[#6F5D50]">
              Table-side service • Reservations •
              Contact • Privacy • Terms
            </p>

          </div>

          <div
            className="
              flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-[#EFEAE3]
              px-4
              py-2
              text-[9px]
              font-medium
            "
          >
            <span className="h-2 w-2 rounded-full bg-caramel" />
            Service Live • Table 12 Active
          </div>

        </div>

      </footer>

      {showCancelPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2314]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E5DBCF] bg-white p-6 shadow-[0_20px_60px_rgba(61,35,20,0.2)] sm:max-h-none sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FADAD5] text-xl text-error">
                !
              </div>

              <div>
                <h2 id="cancel-booking-title" className="font-serif text-[25px] text-espresso">
                  {t.bookingTracking.cancelTitle}
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-[#67564A]">
                  Your reservation for Table {reservation.table?.id || 12} will be cancelled and the table will be released.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCancelPopup(false)}
                className="rounded-full bg-[#EFEAE3] px-5 py-3 text-[10px] font-medium text-espresso transition hover:bg-latte"
              >
                {t.bookingTracking.keepReservation}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="rounded-full bg-error px-5 py-3 text-[10px] font-semibold text-white transition hover:opacity-90"
              >
                {t.bookingTracking.yesCancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


/* ===========================================================
   TIMELINE ITEM
=========================================================== */

const TimelineItem = ({
  number,
  title,
  description,
  time,
  completed = false,
  active = false,
  last = false,
}) => {
  return (
    <div className="relative mb-5 flex gap-4">

      {/* Circle */}

      <div
        className={`
          relative
          z-10
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          text-[12px]
          font-semibold
          ${
            completed
              ? "bg-caramel text-cream"
              : active
              ? "bg-caramel text-cream ring-4 ring-[#F0DCCE]"
              : "bg-[#E3DDD6] text-[#A59A90]"
          }
        `}
      >
        {number}
      </div>

      {/* Content */}

      <div
        className={`
          min-w-0
          flex-1
          rounded-xl
          ${
            active
              ? "bg-[#F1EBE3] p-3"
              : "px-0 py-1"
          }
        `}
      >

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3
                className={`
                  font-serif
                  text-[16px]
                  ${
                    active
                      ? "text-caramel"
                      : completed
                      ? "text-espresso"
                      : "text-[#87796E]"
                  }
                `}
              >
                {title}
              </h3>

              {active && (
                <span
                  className="
                    rounded-full
                    bg-caramel
                    px-2
                    py-1
                    text-[7px]
                    font-bold
                    uppercase
                    text-cream
                  "
                >
                  In Progress
                </span>
              )}

            </div>

            <p
              className={`
                mt-1
                text-[10px]
                leading-4
                ${
                  active || completed
                    ? "text-[#68574A]"
                    : "text-[#A1958B]"
                }
              `}
            >
              {description}
            </p>

          </div>

          <span
            className={`
              shrink-0
              text-[8px]
              font-semibold
              ${
                active
                  ? "text-caramel"
                  : "text-[#8A7A6F]"
              }
            `}
          >
            {time}
          </span>

        </div>

      </div>

    </div>
  );
};


/* ===========================================================
   SUMMARY
=========================================================== */

const Summary = ({
  label,
  value,
}) => {
  return (
    <div>

      <p
        className="
          text-[7px]
          font-semibold
          uppercase
          tracking-[0.1em]
          text-[#88786B]
        "
      >
        {label}
      </p>

      <p className="mt-1 font-serif text-[14px] text-espresso">
        {value}
      </p>

    </div>
  );
};


/* ===========================================================
   HISTORY CARD
=========================================================== */

const HistoryCard = ({
  item,
  onTrack,
  onBookAgain,
}) => {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[#E8DED1]
        bg-white
        shadow-[0_4px_15px_rgba(61,35,20,0.04)]
      "
    >

      <div className="flex gap-4 p-5">

        {/* Icon */}

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${
              item.statusType ===
              "upcoming"
                ? "bg-[#F8D6C7] text-caramel"
                : "bg-[#ECE9E3] text-[#81766C]"
            }
          `}
        >
          {item.statusType ===
          "upcoming"
            ? "▱"
            : "✓"}
        </div>

        {/* Main */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>

              <div className="flex items-center gap-2">

                <h3 className="font-serif text-[17px] text-espresso">
                  {item.id}
                </h3>

                <span
                  className="
                    rounded-full
                    bg-[#F1ECE5]
                    px-2
                    py-1
                    text-[7px]
                    font-medium
                    text-[#77685C]
                  "
                >
                  {item.date}
                </span>

              </div>

              <p className="mt-1 text-[9px] text-[#6E5D51]">
                {item.table} •{" "}
                {item.guests} Guests •{" "}
                {item.area}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-caramel">
                {item.date} • {item.time}
              </p>

            </div>

            <span
              className={`
                rounded-full
                px-3
                py-1.5
                text-[8px]
                font-semibold
                ${
                  item.statusType ===
                  "upcoming"
                    ? "bg-caramel text-cream"
                    : "bg-[#EEEAE4] text-[#766A60]"
                }
              `}
            >
              {item.status}
            </span>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-[#EEE7DF]
          bg-[#FCFAF7]
          px-5
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <p className="text-[9px] text-[#77675B]">
          ◷ {item.description}
        </p>

        {item.statusType ===
        "upcoming" ? (
          <button
            type="button"
            onClick={onTrack}
            className="
              text-left
              text-[9px]
              font-semibold
              text-caramel
              hover:underline
            "
          >
            View Tracking →
          </button>
        ) : (
          <button
            type="button"
            onClick={onBookAgain}
            className="
              rounded-full
              bg-[#ECE8E1]
              px-4
              py-2
              text-[9px]
              font-medium
              text-espresso
              transition
              hover:bg-latte
            "
          >
            ↻ Book Again
          </button>
        )}

      </div>

    </div>
  );
};


/* ===========================================================
   HELPERS
=========================================================== */

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};


const formatTime = (value) => {
  if (!value) return "";

  const [hourString, minute] =
    value.split(":");

  let hour = Number(hourString);

  const period =
    hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
};


const formatPhone = (value) => {
  if (!value) return "98765 43210";

  const numbers = value
    .toString()
    .replace(/\D/g, "");

  if (numbers.length === 10) {
    return `${numbers.slice(
      0,
      5
    )} ${numbers.slice(5)}`;
  }

  return value;
};


export default BookingTracking;