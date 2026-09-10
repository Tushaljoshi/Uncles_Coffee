import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const BookingDetails = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // GET DATA FROM TABLE AVAILABILITY PAGE
  // =========================================================

  const booking = location.state || {};

  const {
    date = "2026-09-12",
    guests = 2,
    time = "19:30",
    table = {
      id: 12,
      name: "Table 12",
      capacity: 3,
      area: "Window View",
      location: "Window Side",
      description: "Warm Sunlight Alcove",
      features: [
        "Natural Light",
        "Quiet Corner",
        "Street View",
      ],
      amenities: ["Power Outlet"],
    },
  } = booking;

  // =========================================================
  // FORM STATE
  // =========================================================

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [agreed, setAgreed] = useState(false);

  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState(null);

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formattedDate = formatDate(date);

  // =========================================================
  // TIME FORMAT
  // =========================================================

  const formattedTime = formatTime(time);

  // =========================================================
  // CONFIRM RESERVATION
  // =========================================================

  const handleConfirmReservation = () => {
    setError("");

    if (!name.trim()) {
      setError(t.details.invalidName);
      return;
    }

    if (!mobile.trim()) {
      setError(t.details.invalidMobile);
      return;
    }

    if (mobile.replace(/\D/g, "").length < 10) {
      setError(t.details.invalidNumber);
      return;
    }

    if (!agreed) {
      setError(
        t.details.agreePolicy
      );
      return;
    }

    // Generate temporary booking ID.
    // Later this should come from your backend/database.
    const bookingId =
      "#BK-" +
      Math.floor(1000 + Math.random() * 9000);

    const confirmedBooking = {
      bookingId,
      customer: {
        name: name.trim(),
        mobile: mobile.trim(),
        email: email.trim(),
        notes: notes.trim(),
      },
      reservation: {
        date,
        guests,
        time,
        table,
      },
    };

    localStorage.setItem(
      "uncleCoffeeBooking",
      JSON.stringify(confirmedBooking)
    );

    setConfirmation(confirmedBooking);
  };

  // =========================================================
  // CHANGE TABLE
  // =========================================================

  const handleChangeTable = () => {
    navigate("/booking/tables", {
      state: {
        date,
        guests,
        time,
      },
    });
  };

  // =========================================================
  // QUICK TAG
  // =========================================================

  const addQuickTag = (text) => {
    setNotes((current) => {
      if (!current.trim()) {
        return text;
      }

      return `${current}, ${text}`;
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

      <main className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 lg:px-8 lg:pb-16">

        {/* ===================================================
            BREADCRUMB
        =================================================== */}

        <div className="mb-5 flex flex-wrap items-center gap-2 text-[10px] sm:mb-8">

          <button
            type="button"
            onClick={() => navigate("/booking")}
            className="text-[#6D5B4D] hover:text-caramel"
          >
            {t.details.reserveTable}
          </button>

          <span className="text-[#B9A99A]">
            ›
          </span>

          <span className="font-semibold text-espresso">
            {t.details.title}
          </span>

        </div>

        {/* ===================================================
            TOP HOLDING BAR
        =================================================== */}

        <div className="mb-5 flex justify-start sm:mb-7 sm:justify-end">

          <div
            className="
              flex
              max-w-full
              flex-wrap
              items-center
              gap-2
              rounded-full
              bg-[#F5EFE7]
              px-4
              py-2.5
              text-[9px]
              font-medium
              text-espresso
            "
          >
            <span className="h-2 w-2 rounded-full bg-caramel" />

            {t.details.holding} {table.id}

            <span className="text-[#8A796B]">
              •
            </span>

            <span className="font-semibold text-caramel">
              09:42 {t.details.remaining}
            </span>
          </div>

        </div>

        {/* ===================================================
            CONTENT GRID
        =================================================== */}

        <div className="grid gap-5 sm:gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <section>

            {/* Heading */}

            <div className="mb-7">

              <p
                className="
                  mb-2
                  text-[9px]
                  font-semibold
                  uppercase
                  tracking-[0.16em]
                  text-caramel
                "
              >
                {t.details.guestInfo}
              </p>

              <h1
                className="
                  font-serif
                  text-[38px]
                  leading-none
                  tracking-[-0.035em]
                  text-espresso
                  sm:text-[48px]
                "
              >
                {t.details.almostThere}
              </h1>

              <p className="mt-3 text-[14px] text-[#654F41]">
                {t.details.intro}
              </p>

            </div>

            {/* =================================================
                SELECTED TABLE
            ================================================= */}

            <div
              className="
                mb-4
                flex
                flex-col
                gap-3
                rounded-2xl
                bg-[#F0EBE4]
                p-4
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:gap-4
                sm:p-5
              "
            >

              <div className="flex min-w-0 items-center gap-4">

                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#E5DED4]
                    text-caramel
                  "
                >
                  <TableIcon />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-2">

                    <h2 className="break-words font-serif text-[21px] text-espresso">
                      {table.name}
                    </h2>

                    <span
                      className="
                        rounded-full
                        bg-[#F4E3D4]
                        px-2.5
                        py-1
                        text-[8px]
                        font-semibold
                        text-[#674738]
                      "
                    >
                      {table.location}
                    </span>

                  </div>

                  <p className="break-words text-[10px] text-[#705F52]">
                    {guests}{" "}
                    {guests === 1
                      ? "Guest"
                      : "Guests"}{" "}
                    • {formattedDate} •{" "}
                    {formattedTime}
                  </p>

                </div>

              </div>

              <button
                type="button"
                onClick={handleChangeTable}
                className="
                  flex
                  items-center
                  gap-2
                  text-left
                  text-[10px]
                  font-semibold
                  text-caramel
                  hover:underline
                "
              >
                {t.details.changeTable}

                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                </svg>

              </button>

            </div>

            {/* =================================================
                FORM CARD
            ================================================= */}

            <div
              className="
                rounded-2xl
                border
                border-[#E6DBCE]
                bg-white
                p-5
                shadow-[0_8px_25px_rgba(61,35,20,0.06)]
                sm:p-7
              "
            >

              {/* Full Name */}

              <div className="mb-5">

                <div className="mb-2 flex justify-between">

                  <label
                    htmlFor="name"
                    className="text-[11px] font-medium text-espresso"
                  >
                    {t.details.fullName}
                  </label>

                  <span className="text-[10px] text-error">
                    *Required
                  </span>

                </div>

                <div className="relative">

                  <div
                    className="
                      pointer-events-none
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-[#806F61]
                    "
                  >
                    <UserIcon />
                  </div>

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) =>
                      setName(e.target.value)
                    }
                    placeholder="Enter your full name"
                    className="
                      h-12
                      w-full
                      rounded-xl
                      border
                      border-transparent
                      bg-[#F6F1E9]
                      pl-11
                      pr-4
                      text-[13px]
                      text-espresso
                      outline-none
                      placeholder:text-[#9A8B7E]
                      focus:border-caramel
                      focus:bg-white
                      focus:ring-2
                      focus:ring-caramel/10
                    "
                  />

                </div>

              </div>

              {/* Mobile + Email */}

              <div className="mb-5 grid gap-4 sm:grid-cols-2">

                {/* Mobile */}

                <div>

                  <label
                    htmlFor="mobile"
                    className="mb-2 block text-[11px] font-medium text-espresso"
                  >
                    {t.details.mobile}
                  </label>

                  <div className="relative">

                    <span
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[12px]
                        font-medium
                        text-caramel
                      "
                    >
                      +91
                    </span>

                    <input
                      id="mobile"
                      type="tel"
                      value={mobile}
                      onChange={(e) =>
                        setMobile(
                          e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 10)
                        )
                      }
                      placeholder="98765 43210"
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-transparent
                        bg-[#F6F1E9]
                        pl-14
                        pr-4
                        text-[13px]
                        text-espresso
                        outline-none
                        placeholder:text-[#9A8B7E]
                        focus:border-caramel
                        focus:bg-white
                        focus:ring-2
                        focus:ring-caramel/10
                      "
                    />

                  </div>

                </div>

                {/* Email */}

                <div>

                  <label
                    htmlFor="email"
                    className="mb-2 block text-[11px] font-medium text-espresso"
                  >
                    {t.details.email}
                    <span className="ml-1 font-normal text-[#8D7D70]">
                      ({t.details.optional})
                    </span>
                  </label>

                  <div className="relative">

                    <div
                      className="
                        pointer-events-none
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#806F61]
                      "
                    >
                      <MailIcon />
                    </div>

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      className="
                        h-12
                        w-full
                        rounded-xl
                        border
                        border-transparent
                        bg-[#F6F1E9]
                        pl-11
                        pr-4
                        text-[13px]
                        text-espresso
                        outline-none
                        placeholder:text-[#9A8B7E]
                        focus:border-caramel
                        focus:bg-white
                        focus:ring-2
                        focus:ring-caramel/10
                      "
                    />

                  </div>

                </div>

              </div>

              {/* Special Requests */}

              <div className="mb-4">

                <div className="mb-2 flex justify-between">

                  <label
                    htmlFor="notes"
                    className="text-[11px] font-medium text-espresso"
                  >
                    {t.details.notes}
                  </label>

                  <span className="text-[10px] text-[#817166]">
                    {t.details.optional}
                  </span>

                </div>

                <textarea
                  id="notes"
                  rows={4}
                  value={notes}
                  onChange={(e) =>
                    setNotes(e.target.value)
                  }
                  placeholder="Birthday, anniversary, accessibility needs, seating preference..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-transparent
                    bg-[#F6F1E9]
                    p-4
                    text-[12px]
                    leading-5
                    text-espresso
                    outline-none
                    placeholder:text-[#9A8B7E]
                    focus:border-caramel
                    focus:bg-white
                    focus:ring-2
                    focus:ring-caramel/10
                  "
                />

              </div>

              {/* Quick Tags */}

              <div className="mb-6">

                <p className="mb-2 text-[9px] font-semibold text-[#68574B]">
                  {t.details.quickTags}
                </p>

                <div className="flex flex-wrap gap-2">

                  <QuickTag
                    icon="✣"
                    text="Anniversary"
                    onClick={() =>
                      addQuickTag(
                        "Anniversary"
                      )
                    }
                  />

                  <QuickTag
                    icon="☕"
                    text="Filter Bar View"
                    onClick={() =>
                      addQuickTag(
                        "Filter Bar View"
                      )
                    }
                  />

                  <QuickTag
                    icon="ϟ"
                    text="Power Outlet"
                    onClick={() =>
                      addQuickTag(
                        "Power Outlet"
                      )
                    }
                  />

                </div>

              </div>

              {/* Policy */}

              <label className="mb-5 flex cursor-pointer items-start gap-3">

                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) =>
                    setAgreed(
                      e.target.checked
                    )
                  }
                  className="
                    mt-0.5
                    h-4
                    w-4
                    accent-[#A35D38]
                  "
                />

                <span className="text-[10px] leading-5 text-[#68584D]">
                  {t.details.agree}
                </span>

              </label>

              {/* Error */}

              {error && (
                <div
                  className="
                    mb-4
                    rounded-xl
                    border
                    border-[#E5BDB5]
                    bg-[#FFF1EE]
                    px-4
                    py-3
                    text-[10px]
                    text-error
                  "
                >
                  {error}
                </div>
              )}

              {/* Confirm */}

              <button
                type="button"
                onClick={handleConfirmReservation}
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
                  shadow-[0_7px_18px_rgba(163,93,56,0.22)]
                  transition
                  hover:bg-caramelHover
                  active:scale-[0.99]
                "
              >
                {t.details.confirm}

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

            </div>

            {/* Ambiance note */}

            <div
              className="
                mt-5
                flex
                gap-3
                rounded-xl
                bg-[#F7ECDC]
                p-4
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EAD8C0]
                  text-caramel
                "
              >
                ☕
              </div>

              <p className="text-[10px] leading-5 text-[#624F42]">
                Table {table.id} enjoys warm natural
                afternoon sunlight and is ideal for
                a relaxed cafe experience.
              </p>

            </div>

          </section>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <aside>

            <div
              className="
                rounded-2xl
                border
                border-[#E5DBCF]
                bg-white
                shadow-[0_12px_35px_rgba(61,35,20,0.08)]
              "
            >

              {/* Confirmation Header */}

              <div
                className="
                  rounded-t-2xl
                  bg-[#F2EDE5]
                  p-6
                "
              >

                  <div className="flex items-start gap-4">

                  <div
                    className="
                      flex
                      h-12
                      w-12
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      bg-[#5F7654]
                      text-cream
                    "
                  >
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </div>

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-caramel">
                        {t.details.instantPass}
                      </p>

                      <span className="text-[#9B8A7C]">
                        •
                      </span>

                      <span className="text-[9px] text-[#5F7654]">
                        {t.details.confirmed}
                      </span>

                    </div>

                    <h2 className="break-words font-serif text-[26px] leading-tight text-espresso">
                      {t.details.reserved}
                    </h2>

                    <p className="mt-1 text-[11px] leading-5 text-[#67564A]">
                      We&apos;re looking forward to
                      welcoming you at Uncle&apos;s
                      Coffee.
                    </p>

                  </div>

                </div>

              </div>

              {/* Details */}

              <div className="p-5 sm:p-6">

                {/* Reservation Code */}

                <div
                  className="
                    flex
                    flex-wrap
                    items-center
                    justify-between
                    rounded-xl
                    bg-[#F0EBE4]
                    p-4
                  "
                >

                  <div className="min-w-0">

                    <p
                      className="
                        text-[8px]
                        font-bold
                        uppercase
                        tracking-[0.12em]
                        text-[#89786B]
                      "
                    >
                      {t.details.reservationCode}
                    </p>

                    <p className="mt-1 font-serif text-[21px] text-espresso">
                      #BK-1042
                    </p>

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigator.clipboard?.writeText(
                        "#BK-1042"
                      )
                    }
                    className="
                      flex
                      items-center
                      gap-2
                      rounded-full
                      bg-white
                      px-3
                      py-2
                      text-[9px]
                      font-medium
                      text-espresso
                      shadow-sm
                    "
                  >
                    <CopyIcon />
                    {t.details.copy}
                  </button>

                </div>

                {/* Customer / Table */}

                <div className="mt-6 grid grid-cols-2 gap-5">

                  <Detail
                    label={t.details.customer}
                    value={
                      name || "Your Name"
                    }
                    serif
                  />

                  <Detail
                    label={t.details.table}
                    value={
                      <>
                        Table {table.id}
                        <span className="text-caramel">
                          {" "}
                          ({table.location})
                        </span>
                      </>
                    }
                    serif
                  />

                  <Detail
                    label={t.details.partySize}
                    value={`${guests} ${
                      guests === 1
                        ? "Guest"
                        : "Guests"
                    }`}
                    serif
                  />

                  <Detail
                    label={t.details.floorZone}
                    value="Main Roastery Floor"
                  />

                </div>

                {/* Date */}

                <div
                  className="
                    mt-6
                    flex
                    flex-wrap
                    items-center
                    gap-3
                    rounded-xl
                    bg-[#F6F0E7]
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-[#F8D7C8]
                      text-caramel
                    "
                  >
                    <CalendarIcon />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#8A796B]">
                      {t.details.dateArrival}
                    </p>

                    <p className="mt-1 font-serif text-[16px] text-espresso">
                      {formattedDate} •{" "}
                      {formattedTime}
                    </p>

                  </div>

                </div>

                {/* QR */}

                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    items-center
                    gap-4
                    rounded-xl
                    bg-[#F0EBE4]
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      h-[76px]
                      w-[76px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-lg
                      bg-white
                    "
                  >
                    <FakeQR />
                  </div>

                  <div className="min-w-0">

                    <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-caramel">
                      {t.details.arrivalPass}
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-[#68574B]">
                      Show this digital pass to
                      the barista or host on arrival
                      for touchless table seating.
                    </p>

                  </div>

                </div>

                {/* Track */}

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      "/bookings/tracking",
                      {
                        state: {
                          bookingId:
                            "#BK-1042",
                          customer: {
                            name,
                            mobile,
                            email,
                            notes,
                          },
                          reservation: {
                            date,
                            guests,
                            time,
                            table,
                          },
                        },
                      }
                    )
                  }
                  className="
                    mt-5
                    flex
                    h-12
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-caramel
                    text-[12px]
                    font-semibold
                    text-cream
                    transition
                    hover:bg-caramelHover
                  "
                >
                  <span>◷</span>
                  {t.details.track}
                </button>

                {/* Calendar */}

                <button
                  type="button"
                  className="
                    mt-2
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[#EFEAE3]
                    text-[10px]
                    font-medium
                    text-espresso
                    transition
                    hover:bg-latte
                  "
                >
                  <CalendarIcon />
                  {t.details.addCalendar}
                </button>

                {/* Book another */}

                <button
                  type="button"
                  onClick={() =>
                    navigate("/booking")
                  }
                  className="
                    mt-4
                    block
                    w-full
                    text-center
                    text-[9px]
                    font-medium
                    text-espresso
                    underline
                    underline-offset-4
                  "
                >
                  {t.details.bookAnother}
                </button>

                {/* Policy */}

                <div
                  className="
                    mt-6
                    rounded-xl
                    bg-[#F7F1E8]
                    p-4
                    text-[10px]
                    leading-5
                    text-[#68574B]
                  "
                >
                  ⓘ Please arrive 10 minutes prior.
                  Your table is held for 15 minutes
                  after reserved time.
                </div>

              </div>

            </div>

            {/* Table ambience */}

            <div
              className="
                mt-4
                flex
                flex-wrap
                gap-3
                rounded-xl
                bg-[#F5F0E8]
                p-3
              "
            >

              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-[#E4D8CA]">

                <img
                  src="/table12.jpg"
                  alt="Table ambience"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display =
                      "none";
                  }}
                />

              </div>

              <div>

                <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-caramel">
                  TABLE {table.id} AMBIANCE
                </p>

                <p className="mt-1 text-[10px] leading-4 text-[#624F42]">
                  Sunlit seating, ideal for couples
                  and relaxed cafe conversations.
                </p>

              </div>

            </div>

          </aside>

        </div>

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

          <div>

            <p className="font-serif text-[18px] text-espresso">
              Uncle&apos;s Coffee
              <span className="ml-2 text-[10px] font-sans text-[#806F61]">
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
              max-w-full
              w-fit
              flex-wrap
              items-center
              gap-2
              rounded-full
              bg-[#F0EBE4]
              px-4
              py-2
              text-[9px]
              font-medium
              text-espresso
            "
          >
            <span className="h-2 w-2 rounded-full bg-caramel" />
            Service Live • Table 12 Active
          </div>

        </div>

      </footer>

      {confirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2314]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmation-title"
        >
              <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E5DBCF] bg-white p-6 shadow-[0_20px_60px_rgba(61,35,20,0.2)] sm:max-h-none sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.12em] text-caramel">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5F7654] text-cream">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m5 12 4 4L19 6" />
                    </svg>
                  </span>
                  {t.details.confirmed}
                </div>
                <h2 id="confirmation-title" className="mt-4 font-serif text-[30px] leading-tight text-espresso">
                  {t.details.reserved}
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-[#67564A]">
                  We&apos;re looking forward to welcoming you at Uncle&apos;s Coffee.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setConfirmation(null)}
                aria-label="Close confirmation"
                className="text-2xl leading-none text-[#806F61] hover:text-espresso"
              >
                &times;
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 rounded-xl bg-[#F0EBE4] p-4 text-[10px]">
              <div>
                <p className="text-[#89786B]">{t.details.reservationCode}</p>
                <p className="mt-1 font-serif text-[19px] text-espresso">
                  {confirmation.bookingId}
                </p>
              </div>
              <div>
                <p className="text-[#89786B]">{t.details.table}</p>
                <p className="mt-1 font-serif text-[19px] text-espresso">
                  Table {confirmation.reservation.table.id}
                </p>
              </div>
              <div>
                <p className="text-[#89786B]">DATE</p>
                <p className="mt-1 font-serif text-[15px] text-espresso">
                  {formatDate(confirmation.reservation.date)}
                </p>
              </div>
              <div>
                <p className="text-[#89786B]">ARRIVAL</p>
                <p className="mt-1 font-serif text-[15px] text-espresso">
                  {formatTime(confirmation.reservation.time)}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 sm:flex-row-reverse">
              <button
                type="button"
                onClick={() =>
                  navigate("/bookings/tracking", {
                    state: confirmation,
                  })
                }
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-caramel px-5 text-[11px] font-semibold text-cream transition hover:bg-caramelHover"
              >
                Track My Booking
              </button>
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="flex h-11 flex-1 items-center justify-center rounded-full bg-[#EFEAE3] px-5 text-[11px] font-medium text-espresso transition hover:bg-latte"
              >
                {t.details.close}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


/* ===========================================================
   DETAIL
=========================================================== */

const Detail = ({
  label,
  value,
  serif = false,
}) => {
  return (
    <div>

      <p className="text-[8px] font-semibold text-[#806F61]">
        {label}
      </p>

      <p
        className={`
          mt-1
          text-[12px]
          text-espresso
          ${
            serif
              ? "font-serif text-[16px]"
              : ""
          }
        `}
      >
        {value}
      </p>

    </div>
  );
};


/* ===========================================================
   QUICK TAG
=========================================================== */

const QuickTag = ({
  icon,
  text,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        items-center
        gap-1.5
        rounded-full
        bg-[#EEE9E2]
        px-3
        py-1.5
        text-[9px]
        font-medium
        text-[#68574B]
        transition
        hover:bg-latte
      "
    >
      <span>{icon}</span>
      {text}
    </button>
  );
};


/* ===========================================================
   ICONS
=========================================================== */

const TableIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 10h16" />
    <path d="M5 10v5" />
    <path d="M19 10v5" />
    <path d="M7 15h10" />
    <path d="M8 15v5" />
    <path d="M16 15v5" />
    <path d="M3 20h18" />
  </svg>
);


const UserIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="8" r="3.5" />
    <path d="M5 20c.8-3.3 3.2-5 7-5s6.2 1.7 7 5" />
  </svg>
);


const MailIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.6"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="3"
      y="5"
      width="18"
      height="14"
      rx="2"
    />
    <path d="m3 7 9 6 9-6" />
  </svg>
);


const CalendarIcon = () => (
  <svg
    width="18"
    height="18"
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
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <path d="M3 10h18" />
  </svg>
);


const CopyIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.7"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect
      x="9"
      y="9"
      width="11"
      height="11"
      rx="2"
    />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);


/* ===========================================================
   SIMPLE QR PLACEHOLDER
=========================================================== */

const FakeQR = () => {
  return (
    <div className="grid grid-cols-5 gap-[2px] p-1">

      {[
        1, 1, 1, 0, 1,
        1, 0, 1, 0, 1,
        1, 1, 1, 1, 0,
        0, 1, 0, 1, 1,
        1, 1, 1, 0, 1,
      ].map((value, index) => (
        <span
          key={index}
          className={`
            h-[7px]
            w-[7px]
            ${
              value
                ? "bg-espresso"
                : "bg-transparent"
            }
          `}
        />
      ))}

    </div>
  );
};


/* ===========================================================
   FORMATTERS
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


export default BookingDetails;