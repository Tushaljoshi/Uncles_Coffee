import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const Tracking = () => {
  const { t } = useLanguage();
  const order = {
    id: "1042",
    table: "12",
    customer: "Tushal",
    ticketId: "#1042",
    status: "Preparing in Kitchen",
    estimatedTime: "15–20 min",
    readyTime: "06:00 PM",
    placedTime: "05:42 PM",
    acceptedTime: "05:43 PM",
    preparingTime: "05:45 PM",
    total: 777,
    payment: "Paid",
    paymentMethod: "UPI",
    transactionId: "TXN88920",
    kitchenNote: "Extra hot cappuccino, less sugar",
  };

  const orderItems = [
    {
      id: 1,
      quantity: 2,
      name: "Cappuccino",
      description: "Extra Hot • Colombian Roast",
      price: 440,
    },
    {
      id: 2,
      quantity: 1,
      name: "Veg Grilled Sandwich",
      description: "Sourdough • Smoked Gouda",
      price: 210,
    },
    {
      id: 3,
      quantity: 1,
      name: "French Fries",
      description: "Herbed Sea Salt & Garlic Aioli",
      price: 127,
    },
  ];

  const steps = [
    {
      number: 1,
      title: t.tracking.orderReceived,
      description:
        "Sent through table terminal by Tushal",
      time: order.placedTime,
      status: "completed",
    },
    {
      number: 2,
      title: t.tracking.accepted,
      description:
        "Roastery kitchen verified tickets & milk specs",
      time: order.acceptedTime,
      status: "completed",
    },
    {
      number: 3,
      title: t.tracking.preparing,
      description:
        "Barista is steaming milk & crafting latte art; grill station is toasting your sourdough sandwiches.",
      time: order.preparingTime,
      status: "current",
    },
    {
      number: 4,
      title: t.tracking.ready,
      description:
        "Quality check at pass counter",
      time: "approx 06:00 PM",
      status: "upcoming",
    },
    {
      number: 5,
      title: t.tracking.served,
      description:
        "Runner brings warm ceramics directly to you",
      time: "Upcoming",
      status: "upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-cream text-espresso">

      {/* =====================================================
          NAVBAR
      ===================================================== */}

      <Navbar />

      {/* =====================================================
          PAGE
      ===================================================== */}

      <main>
        <section className="mx-auto max-w-[1240px] px-4 pb-8 pt-5 sm:px-6 sm:pb-10 lg:px-8 lg:pb-28">

          {/* =================================================
              TOP BAR
          ================================================= */}

          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div className="flex items-center gap-2 text-xs">

              <span className="text-caramel">
                ▤
              </span>

              <span className="text-[#624B3D]">
                Main Roastery Floor
              </span>

              <span className="text-[#C9B9AA]">
                •
              </span>

              <span className="font-semibold text-caramel">
                Table 12 Active
              </span>

            </div>

            <div className="flex w-fit items-center gap-2 rounded-full bg-[#EFE9DF] px-4 py-2">

              <span className="h-2 w-2 rounded-full bg-caramel" />

              <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-espresso">
                {t.tracking.autoRefreshing}
              </span>

            </div>

          </div>

          {/* =================================================
              ORDER RECEIVED HERO
          ================================================= */}

          <section className="relative mt-5 overflow-hidden rounded-2xl bg-[#F3EEE6] sm:mt-6">

            {/* Decorative gradient */}

            <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-[#F8DED0]/80 to-transparent" />

            <div className="relative flex flex-col justify-between gap-8 px-6 py-8 sm:px-10 sm:py-10 lg:flex-row lg:items-center">

              {/* Left */}

              <div className="flex items-center gap-4 sm:gap-5">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-caramel text-2xl text-cream shadow-md sm:h-16 sm:w-16">
                  ☕
                </div>

                <div>

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="rounded-full bg-[#FFD9CA] px-2.5 py-1 text-[9px] font-bold text-caramel">
                      Dine-In Confirmed
                    </span>

                    <span className="text-[11px] text-[#624B3D]">
                      Order #{order.id}
                    </span>

                  </div>

                  <h1 className="mt-2 font-serif text-[28px] leading-tight sm:text-[34px]">
                    {t.tracking.orderReceived} ☕{" "}
                    <span className="text-[#715E50]">
                      #{order.id}
                    </span>
                  </h1>

                  <p className="mt-1 text-sm text-[#624B3D] sm:text-base">
                    The kitchen has accepted your order
                    for{" "}
                    <span className="font-semibold text-espresso">
                      Table {order.table}.
                    </span>
                  </p>

                </div>

              </div>

              {/* Estimated Time */}

              <div className="relative flex items-center gap-4 rounded-xl bg-white px-5 py-4 shadow-sm sm:min-w-[270px]">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-caramel text-caramel">
                  ⏱
                </div>

                <div>

                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#624B3D]">
                    {t.tracking.estimatedPrep}
                  </p>

                  <p className="mt-1 font-serif text-lg font-semibold text-espresso">
                    {order.estimatedTime}
                  </p>

                  <p className="text-[10px] font-medium text-caramel">
                    • Ready by approx {order.readyTime}
                  </p>

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="mt-5 grid gap-5 sm:mt-7 sm:gap-7 lg:grid-cols-[1.55fr_1fr]">

            {/* =================================================
                LEFT - LIVE PROGRESS
            ================================================= */}

            <div>

              <section className="overflow-hidden rounded-2xl border border-[#EEE6DC] bg-white">

                {/* Header */}

                <div className="flex items-center justify-between border-b border-[#F0EAE2] px-5 py-5 sm:px-7">

                  <div>

                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-caramel">
                      {t.tracking.liveProgress}
                    </p>

                    <h2 className="mt-1 font-serif text-[21px]">
                      {t.tracking.kitchenStatus}
                    </h2>

                  </div>

                  <div className="flex items-center gap-1.5 text-[9px] font-medium text-[#624B3D]">

                    <span className="text-caramel">
                      ◉
                    </span>

                    {t.tracking.autoRefreshing}

                  </div>

                </div>

                {/* Timeline */}

                <div className="px-5 py-6 sm:px-7">

                  <div className="relative">

                    {/* Vertical Line */}

                    <div className="absolute left-[15px] top-4 bottom-5 w-px bg-[#E5DDD3]" />

                    <div className="space-y-1">

                      {steps.map((step) => (
                        <TrackingStep
                          key={step.number}
                          step={step}
                        />
                      ))}

                    </div>

                  </div>

                </div>

              </section>

              {/* =================================================
                  AMBIANCE CARD
              ================================================= */}

              <section className="mt-5 overflow-hidden rounded-2xl bg-[#F0ECE5] sm:mt-7">

                <div className="flex flex-col gap-5 p-5 sm:flex-row sm:p-6">

                  <img
                    src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&q=85"
                    alt="Coffee being prepared"
                    className="h-[150px] w-full rounded-xl object-cover sm:h-[135px] sm:w-[150px]"
                  />

                  <div className="flex-1">

                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-caramel">
                      ♡ Slow Living at the Collective
                    </p>

                    <h2 className="mt-2 font-serif text-[22px] leading-tight">
                      Relax and enjoy the ambience.
                    </h2>

                    <p className="mt-2 max-w-[500px] text-xs leading-5 text-[#624B3D]">
                      Our staff will serve everything right at
                      your table. Take in the freshly ground
                      aromas, connect to cafe Wi-Fi, or flip
                      through the curated art journals on the
                      credenza.
                    </p>

                  </div>

                </div>

              </section>

            </div>

            {/* =================================================
                RIGHT - ORDER SUMMARY
            ================================================= */}

            <div>

              <section className="overflow-hidden rounded-2xl bg-white shadow-[0_6px_20px_rgba(61,35,20,0.06)]">

                {/* Summary Header */}

                <div className="bg-[#EDE8E0] px-5 py-6 sm:px-6">

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#624B3D]">
                        Dine-In Receipt
                      </p>

                      <h2 className="mt-1 font-serif text-[21px]">
                        Order Summary
                      </h2>

                    </div>

                    <span className="shrink-0 rounded-full bg-white px-3 py-1.5 text-[10px] font-semibold text-caramel">
                      Paid • ₹{order.total}
                    </span>

                  </div>

                </div>

                {/* Summary Body */}

                <div className="p-5 sm:p-6">

                  {/* Table Details */}

                  <div className="grid grid-cols-3 rounded-xl bg-[#F5F0E8] px-3 py-4 text-center">

                    <SummaryInfo
                      label="Table"
                      value={order.table}
                    />

                    <SummaryInfo
                      label="Customer"
                      value={order.customer}
                    />

                    <SummaryInfo
                      label="Ticket ID"
                      value={order.ticketId}
                      accent
                    />

                  </div>

                  {/* Items */}

                  <div className="mt-6 space-y-5">

                    {orderItems.map((item) => (
                      <OrderSummaryItem
                        key={item.id}
                        item={item}
                      />
                    ))}

                  </div>

                  {/* Kitchen Note */}

                  <div className="mt-6 rounded-xl bg-[#EDE8E0] p-4">

                    <div className="flex items-center gap-2">

                      <span className="text-caramel">
                        ▤
                      </span>

                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-caramel">
                        Kitchen Note
                      </span>

                    </div>

                    <p className="mt-1 text-[11px] italic text-[#624B3D]">
                      &quot;{order.kitchenNote}&quot;
                    </p>

                  </div>

                  {/* Payment */}

                  <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F5F0E8] p-4">

                    <div>

                      <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#624B3D]">
                        Settlement via {order.paymentMethod}
                      </p>

                      <p className="mt-1 text-[10px] text-[#624B3D]">
                        ◇ Transaction #{order.transactionId}
                      </p>

                    </div>

                    <div className="text-right">

                      <p className="text-[9px] font-medium text-[#624B3D]">
                        Total Paid
                      </p>

                      <p className="font-serif text-xl font-semibold text-caramel">
                        ₹{order.total}
                      </p>

                    </div>

                  </div>

                  {/* Add More */}

                  <Link
                    to="/menu"
                    className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-caramel text-sm font-semibold text-cream shadow-sm transition hover:bg-caramelHover"
                  >
                    <span>⊕</span>
                    {t.tracking.addMore} to Table 12
                  </Link>

                  {/* Orders */}

                  <Link
                    to="/orders"
                    className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#ECE7DF] text-sm font-semibold text-espresso transition hover:bg-latte"
                  >
                    ▤
                    {t.tracking.viewOrders}
                  </Link>

                  {/* Bottom Links */}

                  <div className="mt-6 flex flex-col justify-between gap-3 border-t border-[#EEE6DC] pt-5 sm:flex-row sm:items-center">

                    <button
                      type="button"
                      className="flex items-center gap-2 text-xs font-medium text-caramel"
                    >
                      ♧
                      Call Staff to Table 12
                    </button>

                    <span className="text-[10px] text-[#C9B9AA]">
                      WiFi: Collective_5G
                    </span>

                  </div>

                </div>

              </section>

            </div>

          </div>

        </section>
      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#E8DED0] bg-[#F5F0E8]">

        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-4 py-6 pb-28 text-[10px] text-[#624B3D] sm:px-6 sm:py-7 sm:pb-32 lg:flex-row lg:items-center lg:px-8 lg:pb-7">

          <p className="font-serif text-sm">
            Uncle&apos;s Coffee — Artisanal roastery &
            slow bar.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">

            <span>
              Table-side ordering service
            </span>

            <span className="font-medium text-caramel">
              Table 12 Active
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
};

/* =========================================================
   TRACKING STEP
========================================================= */

const TrackingStep = ({ step }) => {

  const completed =
    step.status === "completed";

  const current =
    step.status === "current";

  return (
    <div
      className={`relative flex gap-4 ${
        current
          ? "rounded-xl bg-[#F4F0E8] p-4"
          : "px-0 py-4"
      }`}
    >

      {/* Circle */}

      <div className="relative z-10 shrink-0">

        {completed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-sm text-cream">
            ✓
          </div>
        )}

        {current && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-4 border-[#F7DED2] bg-caramel text-[10px] text-cream">
            ●
          </div>
        )}

        {!completed && !current && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EDE9E3] text-xs text-[#9A8E84]">
            {step.number === 5 ? "♧" : ""}
          </div>
        )}

      </div>

      {/* Content */}

      <div className="min-w-0 flex-1">

        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3
                className={`text-sm font-semibold ${
                  current
                    ? "text-espresso"
                    : completed
                    ? "text-espresso"
                    : "text-[#6F6258]"
                }`}
              >
                Step {step.number}: {step.title}
              </h3>

              {current && (
                <span className="rounded-full bg-caramel px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.06em] text-cream">
                  In Progress
                </span>
              )}

            </div>

            <p
              className={`mt-1 text-[11px] leading-4 ${
                current
                  ? "text-[#624B3D]"
                  : "text-[#806F61]"
              }`}
            >
              {step.description}
            </p>

          </div>

          <span
            className={`shrink-0 rounded bg-[#F0ECE6] px-2 py-1 text-[9px] font-medium ${
              current
                ? "text-caramel"
                : "text-[#806F61]"
            }`}
          >
            {step.time}
          </span>

        </div>

        {/* Current Station */}

        {current && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-[#E8E2D9] px-3 py-2.5">

            <span className="text-caramel">
              ▣
            </span>

            <span className="text-[10px] font-medium text-espresso">
              Station 02: Colombian Supremo Roast
              (Slow Bar)
            </span>

          </div>
        )}

      </div>

    </div>
  );
};

/* =========================================================
   SUMMARY INFO
========================================================= */

const SummaryInfo = ({
  label,
  value,
  accent = false,
}) => {
  return (
    <div>

      <p className="text-[8px] font-medium text-[#806F61]">
        {label}
      </p>

      <p
        className={`mt-1 text-sm font-semibold ${
          accent
            ? "text-caramel"
            : "text-espresso"
        }`}
      >
        {value}
      </p>

    </div>
  );
};

/* =========================================================
   ORDER SUMMARY ITEM
========================================================= */

const OrderSummaryItem = ({ item }) => {
  return (
    <div className="flex items-start gap-3">

      {/* Quantity */}

      <div className="flex h-6 min-w-[25px] items-center justify-center rounded-full bg-[#FFD9CA] text-[9px] font-bold text-caramel">
        {item.quantity}×
      </div>

      {/* Details */}

      <div className="min-w-0 flex-1">

        <div className="flex items-start justify-between gap-3">

          <h3 className="min-w-0 text-sm font-semibold text-espresso">
            {item.name}
          </h3>

          <span className="shrink-0 text-xs font-semibold text-espresso">
            ₹{item.price}
          </span>

        </div>

        <p className="mt-1 text-[10px] text-caramel">
          {item.description}
        </p>

      </div>

    </div>
  );
};

export default Tracking;