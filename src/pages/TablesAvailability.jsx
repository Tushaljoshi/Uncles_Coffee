import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const TablesAvailability = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // GET BOOKING DATA FROM BOOKING PAGE
  // =========================================================

  const bookingData = location.state || {
    date: "2026-09-12",
    guests: 2,
    time: "19:30",
  };

  const [selectedTable, setSelectedTable] =
    useState(null);

  const [activeArea, setActiveArea] =
    useState("All Areas");

  // =========================================================
  // TABLE DATA
  // =========================================================

  const tables = [
    {
      id: 12,
      name: "Table 12",
      capacity: 3,
      area: "Window View",
      location: "Window Side",
      description:
        "Warm Sunlight Alcove",
      image: "/table12.jpg",
      features: [
        "Natural Light",
        "Quiet Corner",
        "Street View",
      ],
      amenities: [
        "Power Outlet",
      ],
      badge: "GUEST FAVORITE",
      selected: true,
    },

    {
      id: 4,
      name: "Table 04",
      capacity: 2,
      area: "Outdoor",
      location: "Courtyard Patio",
      description:
        "Garden Breezeway",
      image: "/table4.jpg",
      features: [
        "Fresh Air",
        "Bistro Table",
        "Heated Patio",
      ],
      amenities: [
        "Covered Canopy",
      ],
      badge: "OPEN AIR",
    },

    {
      id: 8,
      name: "Table 08",
      capacity: 4,
      area: "Quiet Booth",
      location:
        "Bookshelf Mezzanine Booth",
      description:
        "Quiet & cozy seating",
      image: "/table8.jpg",
      features: [
        "Padded Banquette",
        "Power Plugs",
        "High Ceiling",
      ],
      amenities: [
        "Reading Nook",
      ],
      badge: "SPACIOUS",
    },

    {
      id: 2,
      name: "Table 02",
      capacity: 2,
      area: "Near Espresso Bar",
      location: "Roastery Slow Bar",
      description:
        "Brew interaction seating",
      image: "/table2.jpg",
      features: [
        "Bar View",
        "Coffee Interaction",
      ],
      amenities: [
        "Brew Interaction",
      ],
      badge: "COFFEE LOVERS",
    },

    {
      id: 5,
      name: "Table 05",
      capacity: 2,
      area: "Main Floor",
      location: "Main Floor Center",
      description:
        "Reserved until 08:30 PM",
      image: "/table5.jpg",
      features: [
        "Central Seating",
      ],
      amenities: [],
      badge: "OCCUPIED",
      unavailable: true,
    },

    {
      id: 9,
      name: "Table 09",
      capacity: 4,
      area: "Main Floor",
      location: "Garden Side",
      description:
        "Comfortable group seating",
      image: "/table9.jpg",
      features: [
        "Group Seating",
        "Natural Light",
      ],
      amenities: [
        "Power Outlet",
      ],
      badge: "GROUP TABLE",
    },
  ];

  // =========================================================
  // FORMAT DATE
  // =========================================================

  const formattedDate = useMemo(() => {
    if (!bookingData.date) return "";

    const date = new Date(
      `${bookingData.date}T00:00:00`
    );

    return date.toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
      }
    );
  }, [bookingData.date]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formattedTime = useMemo(() => {
    if (!bookingData.time) return "";

    const [hoursString, minutes] =
      bookingData.time.split(":");

    let hours = Number(hoursString);

    const period =
      hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${period}`;
  }, [bookingData.time]);

  // =========================================================
  // FILTER TABLES
  // =========================================================

  const filteredTables = tables.filter(
    (table) => {
      if (table.unavailable) {
        return true;
      }

      if (
        activeArea !== "All Areas" &&
        table.area !== activeArea
      ) {
        return false;
      }

      return (
        table.capacity >= bookingData.guests
      );
    }
  );

  // =========================================================
  // AVAILABLE COUNT
  // =========================================================

  const availableCount = tables.filter(
    (table) =>
      !table.unavailable &&
      table.capacity >= bookingData.guests
  ).length;

  // =========================================================
  // SELECT TABLE
  // =========================================================

  const handleSelectTable = (table) => {
    if (table.unavailable) return;

    setSelectedTable(table);
  };

  // =========================================================
  // EDIT SEARCH
  // =========================================================

  const handleEditSearch = () => {
    navigate("/bookings", {
      state: {
        date: bookingData.date,
        guests: bookingData.guests,
        time: bookingData.time,
      },
    });
  };

  // =========================================================
  // PROCEED
  // =========================================================

  const handleProceed = () => {
    if (!selectedTable) return;

    navigate("/bookings/details", {
      state: {
        date: bookingData.date,
        guests: bookingData.guests,
        time: bookingData.time,
        table: selectedTable,
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

      <main>

        <section className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">

          {/* Step */}

          <div className="mb-3 flex items-center gap-2">

            <span
              className={`
                rounded-full
                bg-[#F4D7C8]
                px-3
                py-1.5
                text-[9px]
                font-bold
                uppercase
                tracking-[0.08em]
                text-[#7E321C]
              `}
            >
              {t.tables.step}
            </span>

            <span className="text-[10px] text-[#8B796A]">
              •
            </span>

            <span className="text-[10px] text-[#6E5C4F]">
              {t.tables.reserve}
            </span>

          </div>

          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>

              <h1
                className="
                  font-serif
                  text-[35px]
                  leading-tight
                  tracking-[-0.035em]
                  text-espresso
                  sm:text-[44px]
                  lg:text-[48px]
                "
              >
                {t.tables.title}
              </h1>

              <p className="mt-2 text-[13px] text-[#695649] sm:text-[15px]">

                {t.tables.description}{" "}

                <strong className="font-semibold text-espresso">
                  {formattedDate}
                </strong>

                {" • "}

                <strong className="font-semibold text-espresso">
                  {bookingData.guests}{" "}
                  {bookingData.guests === 1
                    ? "Guest"
                    : "Guests"}
                </strong>

                {" • "}

                <strong className="font-semibold text-espresso">
                  {formattedTime}
                </strong>

              </p>

            </div>

            {/* Availability */}

            <div
              className={`
                flex
                max-w-full
                w-fit
                flex-wrap
                items-center
                gap-2
                rounded-full
                bg-[#F5EFE7]
                px-4
                py-2.5
                text-[10px]
                text-espresso
              `}
            >

              <span className="h-2 w-2 rounded-full bg-caramel" />

              <strong>
                  {availableCount} {t.tables.available}
              </strong>

              <span>
                {t.tables.for} {formattedTime}
              </span>

            </div>

          </div>

        </section>


        <section
          className="
            mx-auto
            mt-4
            w-full
            max-w-[1240px]
            px-4
            flex
            flex-col
            gap-3
            rounded-2xl
            border
            border-[#E8DED0]
            bg-white
            p-3
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:p-4
          "
        >

          <div className="flex min-w-0 flex-wrap gap-2">

            {/* Date */}

            <SummaryPill
              icon="calendar"
              text={formatDateShort(
                bookingData.date
              )}
            />

            {/* Guests */}

            <SummaryPill
              icon="users"
              text={`${bookingData.guests} ${
                bookingData.guests === 1
                  ? "Guest"
                  : "Guests"
              }`}
            />

            {/* Time */}

            <SummaryPill
              icon="clock"
              text={`${formattedTime} (Dinner)`}
            />

          </div>

          <button
            type="button"
            onClick={handleEditSearch}
            className="
              flex
              w-full
              items-center
              gap-2
              rounded-full
              bg-[#F1ECE5]
              px-4
              py-2.5
              text-[10px]
              font-medium
              text-espresso
              transition
              hover:bg-latte
              sm:w-fit
            "
          >

            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <path d="M4 7h16" />
              <path d="M7 12h10" />
              <path d="M10 17h4" />
            </svg>

            {t.tables.editSearch}

          </button>

        </section>
        
        <section className="mx-auto mt-5 grid min-w-0 max-w-[1240px] gap-5 px-4 sm:mt-7 sm:gap-6 sm:px-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)] lg:px-8">
          <div className="min-w-0">
            <div className="mb-4 flex min-w-0 gap-2 overflow-x-auto pb-1 sm:mb-5">

              {[
                "All Areas",
                "Window View",
                "Quiet Booth",
                "Near Espresso Bar",
                "Outdoor",
                "Main Floor",
              ].map((area) => {

                const count =
                  area === "All Areas"
                    ? availableCount
                    : tables.filter(
                        (table) =>
                          table.area === area &&
                          !table.unavailable &&
                          table.capacity >=
                            bookingData.guests
                      ).length;

                return (
                  <button
                    key={area}
                    type="button"
                    onClick={() =>
                      setActiveArea(area)
                    }
                    className={`
                      flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-full
                      px-4
                      py-2
                      text-[10px]
                      font-medium
                      transition
                      ${
                        activeArea === area
                          ? "bg-caramel text-cream"
                          : "bg-white text-espresso hover:bg-latte"
                      }
                    `}
                  >
                    {area === "All Areas"
                      ? t.tables.allAreas
                      : area}

                    <span
                      className={`
                        text-[8px]
                        ${
                          activeArea === area
                            ? "text-cream/80"
                            : "text-[#88776A]"
                        }
                      `}
                    >
                      ({count})
                    </span>

                  </button>
                );
              })}

            </div>

            {/* Table cards */}

            <div className="space-y-4">

              {filteredTables.map(
                (table) => (
                  <TableCard
                    key={table.id}
                    table={table}
                    selected={
                      selectedTable?.id ===
                      table.id
                    }
                    onSelect={() =>
                      handleSelectTable(
                        table
                      )
                    }
                  />
                )
              )}

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE FLOOR MAP
          ================================================= */}

          <aside className="hidden lg:block">

            <div
              className="
                sticky
                top-[90px]
                rounded-2xl
                border
                border-[#E7DCCF]
                bg-white
                p-5
                shadow-[0_8px_25px_rgba(61,35,20,0.05)]
              "
            >

              <div className="flex items-start justify-between">

                <div>

                  <p
                    className="
                      text-[9px]
                      font-semibold
                      uppercase
                      tracking-[0.13em]
                      text-caramel
                    "
                  >
                    {t.tables.floorLayout}
                  </p>

                  <h2
                    className="
                      mt-1
                      font-serif
                      text-[23px]
                      text-espresso
                    "
                  >
                    {t.tables.chooseFloor}
                  </h2>

                </div>

                <span className="text-[9px] text-[#76665A]">
                  {t.tables.tapToSelect}
                </span>

              </div>

              {/* Legend */}

              <div
                className="
                  mt-4
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  bg-[#F7F1E9]
                  px-3
                  py-2.5
                  text-[9px]
                "
              >

                <Legend
                  color="bg-caramel"
                  text={
                    selectedTable
                      ? `Selected (T-${selectedTable.id})`
                      : t.tables.selected
                  }
                />

                <Legend
                  color="bg-[#EFDCC2]"
                    text={t.tables.availableLabel}
                />

                <Legend
                  color="bg-[#D9D5CE]"
                    text={t.tables.reserved}
                />

              </div>

              {/* Floor Map */}

              <div
                className="
                  relative
                  mt-4
                  h-[310px]
                  overflow-hidden
                  rounded-2xl
                  border
                  border-[#E6DCCF]
                  bg-[#FBF7F0]
                "
              >

                {/* Roastery */}

                <div
                  className="
                    absolute
                    right-5
                    top-7
                    h-[96px]
                    w-[55%]
                    rounded-xl
                    bg-[#E7E1D6]
                    p-3
                  "
                >

                  <p className="font-serif text-[10px] text-[#705E50]">
                    Roastery & Slow Bar
                  </p>

                  <p className="mt-1 text-[7px] text-[#918173]">
                    Espresso • Brew Bar
                  </p>

                </div>

                {/* Courtyard */}

                <div
                  className="
                    absolute
                    left-5
                    top-7
                    h-[100px]
                    w-[30%]
                    rounded-xl
                    border
                    border-dashed
                    border-[#DDD2C4]
                    bg-[#F5EFE5]
                    p-2
                  "
                >

                  <p className="text-[7px] uppercase tracking-wide text-[#8A796B]">
                    Courtyard Patio
                  </p>

                </div>

                {/* Table 04 */}

                <MapTable
                  id={4}
                  top="18%"
                  left="19%"
                  selected={
                    selectedTable?.id === 4
                  }
                  onClick={() =>
                    handleSelectTable(
                      tables.find(
                        (t) => t.id === 4
                      )
                    )
                  }
                />

                {/* Table 02 */}

                <MapTable
                  id={2}
                  top="48%"
                  left="49%"
                  selected={
                    selectedTable?.id === 2
                  }
                  onClick={() =>
                    handleSelectTable(
                      tables.find(
                        (t) => t.id === 2
                      )
                    )
                  }
                />

                {/* Table 05 */}

                <MapTable
                  id={5}
                  top="49%"
                  left="28%"
                  unavailable
                />

                {/* Table 12 */}

                <MapTable
                  id={12}
                  top="67%"
                  left="18%"
                  selected={
                    selectedTable?.id === 12
                  }
                  onClick={() =>
                    handleSelectTable(
                      tables.find(
                        (t) => t.id === 12
                      )
                    )
                  }
                />

                {/* Table 08 */}

                <MapTable
                  id={8}
                  top="67%"
                  left="78%"
                  selected={
                    selectedTable?.id === 8
                  }
                  onClick={() =>
                    handleSelectTable(
                      tables.find(
                        (t) => t.id === 8
                      )
                    )
                  }
                />

                {/* Main entrance */}

                <div
                  className="
                    absolute
                    bottom-3
                    left-1/2
                    -translate-x-1/2
                    rounded
                    bg-[#E5DFD5]
                    px-4
                    py-1
                    text-[6px]
                    uppercase
                    tracking-wide
                    text-[#89796B]
                  "
                >
                  Main Entrance
                </div>

              </div>

              {/* Selected table summary */}

              <div
                className="
                  mt-4
                  rounded-xl
                  bg-[#F0EAE1]
                  p-3
                "
              >

                {selectedTable ? (
                  <div className="flex items-center gap-3">

                    <div
                      className="
                        flex
                        h-10
                        w-10
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-caramel
                        font-serif
                        text-sm
                        text-cream
                      "
                    >
                      {selectedTable.id}
                    </div>

                    <div className="min-w-0">

                      <p className="text-[10px] font-semibold text-espresso">
                        Selected: {selectedTable.name}
                      </p>

                      <p className="mt-0.5 truncate text-[9px] text-[#756357]">
                        {selectedTable.location} •{" "}
                        {selectedTable.description}
                      </p>

                    </div>

                  </div>
                ) : (
                  <div>

                    <p className="text-[10px] font-semibold text-espresso">
                      {t.tables.selectTable}
                    </p>

                    <p className="mt-1 text-[9px] text-[#756357]">
                      {t.tables.chooseAvailable}
                    </p>

                  </div>
                )}

              </div>

            </div>

          </aside>

        </section>

      </main>

      {/* =====================================================
          STICKY BOTTOM BOOKING BAR
      ===================================================== */}

      <div
        className="
          fixed
          bottom-[76px]
          left-0
          right-0
          z-40
          border-t
          border-[#E5D9CA]
          bg-cream/95
          shadow-[0_-10px_30px_rgba(61,35,20,0.08)]
          backdrop-blur-xl
          lg:bottom-0
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-[1240px]
            flex-col
            gap-2
            px-4
            py-3
            sm:flex-row
            sm:items-center
            sm:justify-between
            sm:px-6
            lg:px-8
          "
        >

          {/* Selected info */}

          <div className="flex min-w-0 items-center gap-3">

            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-caramel
                font-serif
                text-sm
                text-cream
              "
            >
              {selectedTable?.id || "—"}
            </div>

            <div className="min-w-0">

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-[13px] font-semibold text-espresso">
                  {selectedTable
                    ? `${selectedTable.name} Selected`
                    : "Select a Table"}
                </h3>

                {selectedTable && (
                  <span className="rounded-full bg-[#F4D7C8] px-2 py-0.5 text-[8px] font-semibold text-[#7E321C]">
                    {bookingData.guests} Guests
                  </span>
                )}

              </div>

              <p className="mt-0.5 truncate text-[9px] text-[#756357]">

                {selectedTable
                  ? `${selectedTable.location} • ${formatDateShort(
                      bookingData.date
                    )} at ${formattedTime}`
                  : "Choose an available table to continue"}

              </p>

            </div>

          </div>

          {/* Actions */}

          <div className="flex items-center gap-2 sm:shrink-0">

            <button
              type="button"
              onClick={handleEditSearch}
              className="
                hidden
                rounded-full
                bg-[#F0EBE4]
                px-5
                py-3
                text-[10px]
                font-medium
                text-espresso
                transition
                hover:bg-latte
                sm:block
              "
            >
              {t.tables.changeTime}
            </button>

            <button
              type="button"
              disabled={!selectedTable}
              onClick={handleProceed}
              className={`
                flex
                flex-1
                items-center
                justify-center
                gap-2
                rounded-full
                px-6
                py-3
                text-[11px]
                font-semibold
                transition
                sm:flex-none
                sm:min-w-[250px]
                ${
                  selectedTable
                    ? "bg-caramel text-cream shadow-[0_6px_16px_rgba(163,93,56,0.22)] hover:bg-caramelHover"
                    : "cursor-not-allowed bg-[#DED8D0] text-[#94877B]"
                }
              `}
            >
              {t.tables.proceed}

              <svg
                width="16"
                height="16"
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

        </div>

      </div>

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
            pb-36
            sm:px-6
            sm:pb-40
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-8
            lg:pb-8
          "
        >

          <div>

            <p className="font-serif text-[17px] text-espresso">
              Uncle&apos;s Coffee
            </p>

            <p className="mt-1 text-[10px] text-[#6F5D50]">
              Artisanal roastery & slow bar.
            </p>

          </div>

          <p className="text-[10px] text-[#6F5D50]">
            Table-side service • Reservations •
            Contact • Privacy • Terms
          </p>

        </div>

      </footer>

    </div>
  );
};


/* ===========================================================
   TABLE CARD
=========================================================== */

const TableCard = ({
  table,
  selected,
  onSelect,
}) => {
  const { t } = useLanguage();
  return (
    <div
      className={`
        group
        flex
        flex-col
        gap-4
        rounded-2xl
        border
        p-4
        transition-all
        sm:flex-row
        sm:items-center
        ${
          table.unavailable
            ? "border-[#E5DED5] bg-[#F5F1EB] opacity-55"
            : selected
            ? "border-caramel bg-[#F3ECE3] shadow-[0_8px_22px_rgba(163,93,56,0.10)]"
            : "border-[#E8DED0] bg-white hover:-translate-y-0.5 hover:border-caramel/50 hover:shadow-[0_8px_22px_rgba(61,35,20,0.06)]"
        }
      `}
    >

      {/* Image */}

      <div
        className="
          relative
          h-[150px]
          w-full
          shrink-0
          overflow-hidden
          rounded-xl
          bg-[#E8DED0]
          sm:h-[120px]
          sm:w-[120px]
        "
      >

        <img
          src={table.image}
          alt={table.name}
          className={`
            h-full
            w-full
            object-cover
            transition
            duration-300
            group-hover:scale-[1.03]
            ${
              table.unavailable
                ? "grayscale"
                : ""
            }
          `}
          onError={(e) => {
            e.currentTarget.style.display =
              "none";
          }}
        />

        <span
          className="
            absolute
            left-2
            top-2
            rounded-md
            bg-white/90
            px-2
            py-1
            text-[8px]
            font-bold
            text-espresso
            backdrop-blur-sm
          "
        >
          T-{String(table.id).padStart(2, "0")}
        </span>

      </div>

      {/* Details */}

          <div className="min-w-0 flex-1">

        <div className="flex flex-wrap items-center gap-2">

          <h2 className="break-words font-serif text-[21px] text-espresso">
            {table.name}
          </h2>

          <span
            className={`
              rounded-full
              px-2
              py-1
              text-[7px]
              font-bold
              uppercase
              tracking-wide
              ${
                table.unavailable
                  ? "bg-[#DDD8D0] text-[#776C63]"
                  : selected
                  ? "bg-[#F6CDBB] text-[#80391F]"
                  : "bg-[#F3E9DC] text-[#634D3E]"
              }
            `}
          >
            {selected
              ? "CURRENT PICK"
              : table.badge}
          </span>

        </div>

        <p className="break-words text-[11px] font-medium text-caramel">
          {table.location} •{" "}
          {table.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-[#66564A]">

          <span>
            ♙ {table.capacity} Guests
          </span>

          {table.amenities.map(
            (amenity) => (
              <span key={amenity}>
                • {amenity}
              </span>
            )
          )}

        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">

          {table.features.map(
            (feature) => (
              <span
                key={feature}
                className="
                  rounded-full
                  bg-[#F4EEE6]
                  px-2.5
                  py-1
                  text-[8px]
                  text-[#67574B]
                "
              >
                {feature}
              </span>
            )
          )}

        </div>

      </div>

      {/* Action */}

      <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-right">

        <div className="hidden text-[8px] font-semibold uppercase tracking-[0.12em] text-[#806F61] sm:block">
          {table.unavailable
            ? t.tables.occupied
            : selected
            ? t.tables.currentPick
            : t.tables.availableLabelUpper}
        </div>

        <button
          type="button"
          disabled={table.unavailable}
          onClick={onSelect}
          className={`
            rounded-full
            w-full
            px-5
            py-2.5
            text-[10px]
            font-medium
            transition-all
            sm:w-auto
            ${
              table.unavailable
                ? "cursor-not-allowed bg-[#E5E0D9] text-[#9C9289]"
                : selected
                ? "bg-caramel text-cream shadow-sm"
                : "bg-[#F0ECE6] text-espresso hover:bg-caramel hover:text-cream"
            }
          `}
        >
          {table.unavailable
            ? t.tables.unavailable
            : selected
            ? `✓ ${t.tables.selectedButton}`
            : t.tables.selectButton}
        </button>

      </div>

    </div>
  );
};


/* ===========================================================
   SUMMARY PILL
=========================================================== */

const SummaryPill = ({
  icon,
  text,
}) => {
  return (
    <div
      className="
        flex
        items-center
        gap-2
        rounded-full
        bg-[#F6F0E8]
        px-3.5
        py-2.5
        text-[10px]
        font-medium
        text-espresso
      "
    >

      {icon === "calendar" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
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
      )}

      {icon === "users" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle
            cx="9"
            cy="8"
            r="3"
          />
          <path d="M3 20c.5-3.2 2.5-5 6-5s5.5 1.8 6 5" />
          <path d="M16 5.5a3 3 0 0 1 0 5.5" />
          <path d="M17 15c2.3.4 3.5 2 4 5" />
        </svg>
      )}

      {icon === "clock" && (
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
        >
          <circle
            cx="12"
            cy="12"
            r="9"
          />
          <path d="M12 7v5l3 2" />
        </svg>
      )}

      <span>{text}</span>

    </div>
  );
};


/* ===========================================================
   LEGEND
=========================================================== */

const Legend = ({
  color,
  text,
}) => {
  return (
    <div className="flex items-center gap-1.5">

      <span
        className={`h-2.5 w-2.5 rounded-full ${color}`}
      />

      <span>
        {text}
      </span>

    </div>
  );
};


/* ===========================================================
   MAP TABLE
=========================================================== */

const MapTable = ({
  id,
  top,
  left,
  selected,
  unavailable,
  onClick,
}) => {
  return (
    <button
      type="button"
      disabled={unavailable}
      onClick={onClick}
      style={{
        top,
        left,
      }}
      className={`
        absolute
        flex
        h-10
        w-10
        -translate-x-1/2
        -translate-y-1/2
        items-center
        justify-center
        rounded-full
        border-2
        text-[7px]
        font-bold
        transition-all
        ${
          unavailable
            ? "cursor-not-allowed border-[#D8D2C9] bg-[#E3DFD8] text-[#9B9288]"
            : selected
            ? "border-caramel bg-caramel text-cream shadow-[0_0_0_7px_rgba(163,93,56,0.12)]"
            : "border-[#EBDCC7] bg-[#F2E0C5] text-espresso hover:scale-110"
        }
      `}
    >
      T-{String(id).padStart(2, "0")}
    </button>
  );
};


/* ===========================================================
   DATE HELPERS
=========================================================== */

const formatDateShort = (
  dateValue
) => {
  if (!dateValue) return "";

  const date = new Date(
    `${dateValue}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};


export default TablesAvailability;