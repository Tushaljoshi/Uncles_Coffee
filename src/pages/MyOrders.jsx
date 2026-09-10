import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

/* =========================================================
   DEMO ORDER HISTORY
   Later this will come from your backend/database.
========================================================= */

const ordersData = [
  {
    id: "1042",
    table: "12",
    date: "Today",
    time: "05:42 PM",
    status: "Preparing",
    statusType: "active",
    total: 777,
    paymentStatus: "Paid via UPI",
    receiptId: "#REC-1042",

    items: [
      {
        id: 1,
        quantity: 2,
        name: "Cappuccino",
        description: "Extra Hot, light cinnamon",
        price: 440,
        image:
          "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=400&q=85",
      },
      {
        id: 2,
        quantity: 1,
        name: "Veg Sandwich",
        description: "Grilled bell peppers & pesto",
        price: 220,
        image:
          "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=400&q=85",
      },
    ],

    additionalItem:
      "Hand-Cut Herb Fries (Crisp Rosemary)",

    additionalPrice: 117,
  },

  {
    id: "1035",
    table: "8",
    date: "Yesterday",
    time: "08:15 PM",
    status: "Completed",
    statusType: "completed",
    total: 540,
    paymentStatus: "Paid via UPI",
    receiptId: "#REC-9821",

    items: [
      {
        id: 3,
        quantity: 1,
        name: "Sea Salt Brownie",
        description: "Single origin chocolate",
        price: 180,
        image:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=85",
      },
      {
        id: 4,
        quantity: 2,
        name: "Café Latte",
        description: "Whole milk, medium roast",
        price: 360,
        image:
          "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=400&q=85",
      },
    ],
  },

  {
    id: "998",
    table: "4",
    date: "06 Sep",
    time: "07:30 PM",
    status: "Completed",
    statusType: "completed",
    total: 410,
    paymentStatus: "Paid Cash at counter",
    receiptId: "#REC-9412",

    items: [
      {
        id: 5,
        quantity: 1,
        name: "Flat White",
        description: "Cinnamon Knot",
        price: 410,
        image:
          "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=400&q=85",
      },
    ],
  },
];

/* =========================================================
   MAIN PAGE
========================================================= */

const MyOrders = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] =
    useState("All Orders");

  const filters = [
    "All Orders",
    "Active",
    "Completed",
  ];

  /* =======================================================
     FILTER ORDERS
  ======================================================= */

  const filteredOrders = useMemo(() => {
    if (activeFilter === "All Orders") {
      return ordersData;
    }

    if (activeFilter === "Active") {
      return ordersData.filter(
        (order) =>
          order.statusType === "active"
      );
    }

    return ordersData.filter(
      (order) =>
        order.statusType === "completed"
    );
  }, [activeFilter]);

  /* =======================================================
     ACTIVE ORDERS
  ======================================================= */

  const activeOrders = ordersData.filter(
    (order) => order.statusType === "active"
  );

  /* =======================================================
     TOTAL VISITS
  ======================================================= */

  const totalVisits = ordersData.length;

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
        <section className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 lg:px-8 lg:pb-28">

          {/* =================================================
              SESSION INFO
          ================================================= */}

          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">

            <div className="flex items-center gap-2">

              <span className="text-caramel">
                ▣
              </span>

              <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-caramel">
                {t.orders.title}
              </span>

            </div>

            <div className="flex max-w-full flex-wrap items-center gap-2 rounded-full bg-[#EFE9DF] px-3 py-2 sm:px-4">

              <span className="h-2 w-2 rounded-full bg-caramel" />

              <span className="text-[9px] font-semibold text-espresso">
                Table 12 Connected
              </span>

              <Link
                to="/menu"
                className="ml-1 text-[9px] font-semibold text-caramel underline underline-offset-2"
              >
                {t.orders.exploreMenu}
              </Link>

            </div>

          </div>

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-[#806F61]">
                {t.orders.visits}
              </p>

              <h1 className="mt-1 font-serif text-[32px] leading-tight tracking-[-0.03em] sm:text-[38px]">
                {t.orders.title}
              </h1>

              <p className="mt-1 text-xs text-[#624B3D]">
                {t.orders.subtitle}
              </p>

            </div>

            {/* Filter */}

            <div className="flex w-fit items-center gap-1 rounded-full bg-[#F0ECE5] p-1">

              {filters.map((filter) => {

                const active =
                  activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() =>
                      setActiveFilter(filter)
                    }
                    className={`rounded-full px-4 py-2 text-[9px] font-medium transition ${
                      active
                        ? "bg-caramel text-cream"
                        : "text-[#715E50] hover:bg-latte"
                    }`}
                  >
                    {filter === "All Orders"
                      ? t.orders.all
                      : filter === "Active"
                      ? t.orders.active
                      : t.orders.completed}

                    {filter === "All Orders" && (
                      <span className="ml-1">
                        ({ordersData.length})
                      </span>
                    )}

                    {filter === "Active" && (
                      <span className="ml-1">
                        ({activeOrders.length})
                      </span>
                    )}

                    {filter === "Completed" && (
                      <span className="ml-1">
                        (
                        {
                          ordersData.filter(
                            (order) =>
                              order.statusType ===
                              "completed"
                          ).length
                        }
                        )
                      </span>
                    )}

                  </button>
                );
              })}

            </div>

          </div>

          {/* =================================================
              CONTENT GRID
          ================================================= */}

          <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-7 lg:grid-cols-[1.7fr_1fr]">

            {/* =================================================
                LEFT - ORDERS
            ================================================= */}

            <div className="space-y-4">

              {filteredOrders.map((order) => (
                <OrderHistoryCard
                  key={order.id}
                  order={order}
                />
              ))}

              {filteredOrders.length === 0 && (
                <EmptyOrders />
              )}

            </div>

            {/* =================================================
                RIGHT SIDEBAR
            ================================================= */}

            <aside className="space-y-5">

              {/* =================================================
                  VISITS CARD
              ================================================= */}

              <div className="rounded-2xl bg-[#F0ECE5] p-5">

                <div className="flex items-start justify-between">

                  <div>

                    <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-caramel">
                      Table Loyalty • Device
                    </p>

                    <h2 className="mt-2 font-serif text-[20px]">
                      {totalVisits} {t.orders.visits}
                    </h2>

                  </div>

                  <span className="text-caramel">
                    ▤
                  </span>

                </div>

                <p className="mt-1 text-[10px] leading-4 text-[#624B3D]">
                  You&apos;ve visited us from a complimentary
                  single-origin pour tasting.
                </p>

                {/* Progress */}

                <div className="mt-5">

                  <div className="h-1.5 overflow-hidden rounded-full bg-[#DED5CA]">

                    <div
                      className="h-full rounded-full bg-caramel"
                      style={{
                        width: "60%",
                      }}
                    />

                  </div>

                  <div className="mt-2 flex justify-between text-[9px] text-[#715E50]">

                    <span>
                      {ordersData.length} Orders
                    </span>

                    <span>
                      {t.orders.reward}
                    </span>

                  </div>

                </div>

                <button
                  type="button"
                  className="mt-5 w-full rounded-full bg-caramel py-2.5 text-[9px] font-semibold text-cream transition hover:bg-caramelHover"
                >
                  {t.cart.addMore} for Table 12
                </button>

                <p className="mt-2 text-center text-[8px] text-[#806F61]">
                  Clear device order history
                </p>

              </div>

              {/* =================================================
                  LIVE KITCHEN PROGRESS
              ================================================= */}

              {activeOrders.length > 0 && (
                <div className="rounded-2xl bg-white p-5 shadow-[0_5px_20px_rgba(61,35,20,0.05)]">

                  <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-caramel">
                    ♨ Live Kitchen Progress
                  </p>

                  <h3 className="mt-2 font-serif text-[17px]">
                    Order #{activeOrders[0].id}
                  </h3>

                  <p className="mt-1 text-[10px] leading-4 text-[#624B3D]">
                    Barista is foaming your milk
                    cappuccino right now.
                  </p>

                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F2EDE5] p-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-xs text-cream">
                      ☕
                    </div>

                    <span className="text-[9px] text-[#624B3D]">
                      Est. delivery to Table 12
                      in ~4 min
                    </span>

                  </div>

                  <Link
                    to="/tracking"
                    className="mt-3 block text-center text-[9px] font-semibold text-caramel underline underline-offset-2"
                  >
                    View full sensory tracker →
                  </Link>

                </div>
              )}

            </aside>

          </div>

          {/* =================================================
              FINAL CTA
          ================================================= */}

          <div className="mt-4 flex flex-col items-start justify-between gap-3 rounded-xl bg-[#EFE9DF] p-4 sm:mt-5 sm:flex-row sm:items-center sm:gap-4">

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-caramel text-cream">
                ♨
              </div>

              <div>

                <h3 className="font-serif text-[14px]">
                  Ready to try something new today?
                </h3>

                <p className="text-[9px] text-[#624B3D]">
                  Our seasonal single-origin pour over and
                  warm bakery items are freshly prepped.
                </p>

              </div>

            </div>

            <Link
              to="/menu"
              className="shrink-0 rounded-full bg-caramel px-5 py-2 text-[9px] font-semibold text-cream transition hover:bg-caramelHover"
            >
                    {t.orders.exploreMenu}
            </Link>

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
   ORDER HISTORY CARD
========================================================= */

const OrderHistoryCard = ({ order }) => {

  const { t } = useLanguage();

  const isActive =
    order.statusType === "active";

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white ${
        isActive
          ? "border-caramel/40"
          : "border-[#EEE6DC]"
      }`}
    >

      {/* =====================================================
          ORDER HEADER
      ===================================================== */}

      <div className="flex flex-col justify-between gap-3 border-b border-[#F0EAE2] px-4 py-3 sm:flex-row sm:items-center sm:px-5">

        <div className="flex flex-wrap items-center gap-2">

          <span className="text-xs font-semibold text-espresso">
            Order #{order.id}
          </span>

          <span className="rounded-full bg-[#F0ECE5] px-2 py-1 text-[8px] font-semibold text-caramel">
            TABLE {order.table}
          </span>

        </div>

        <div className="flex flex-wrap items-center gap-3">

          <span className="text-[9px] text-[#715E50]">
            ◷ {order.date} • {order.time}
          </span>

          <StatusBadge
            status={order.status}
            active={isActive}
          />

        </div>

      </div>

      {/* =====================================================
          ITEMS
      ===================================================== */}

      <div className="px-4 py-4 sm:px-5">

        <div className="grid gap-2 sm:grid-cols-2">

          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 rounded-lg bg-[#F4F0E8] p-2.5"
            >

              <img
                src={item.image}
                alt={item.name}
                className="h-10 w-10 shrink-0 rounded-md object-cover"
              />

              <div className="min-w-0 flex-1">

                <p className="truncate text-[10px] font-medium text-espresso">
                  {item.quantity}× {item.name}
                </p>

                <p className="truncate text-[8px] text-[#715E50]">
                  {item.description}
                </p>

                <p className="text-[8px] font-medium text-caramel">
                  ₹{item.price}
                </p>

              </div>

            </div>
          ))}

        </div>

        {/* Additional item */}

        {order.additionalItem && (
          <div className="mt-3 flex items-start justify-between gap-3">

            <p className="min-w-0 truncate text-[8px] text-[#715E50]">
              Additional: {order.additionalItem}
            </p>

            <span className="text-[9px] font-medium text-espresso">
              ₹{order.additionalPrice}
            </span>

          </div>
        )}

      </div>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <div className="flex flex-col justify-between gap-3 border-t border-[#F0EAE2] bg-[#FAF7F1] px-4 py-3 sm:flex-row sm:items-center sm:px-5">

        <div>

          <p className="text-[8px] text-[#715E50]">
            {order.paymentStatus}
            {order.receiptId &&
              ` • Receipt ID: ${order.receiptId}`}
          </p>

          <p className="mt-1 font-serif text-base font-semibold text-espresso">
            ₹{order.total}
          </p>

        </div>

        <div className="flex flex-wrap items-center gap-2">

          {isActive ? (

            <Link
              to="/tracking"
              className="rounded-full bg-caramel px-4 py-2 text-[9px] font-semibold text-cream transition hover:bg-caramelHover"
            >
              {t.orders.track} →
            </Link>

          ) : (

            <button
              type="button"
              onClick={() =>
                console.log(
                  "Reorder:",
                  order.id
                )
              }
              className="rounded-full bg-[#E9E4DC] px-4 py-2 text-[9px] font-semibold text-[#624B3D] transition hover:bg-latte"
            >
              ↻ {t.orders.orderAgain} (1-Click)
            </button>

          )}

        </div>

      </div>

    </article>
  );
};

/* =========================================================
   STATUS BADGE
========================================================= */

const StatusBadge = ({
  status,
  active,
}) => {

  const { t } = useLanguage();

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[8px] font-semibold ${
        active
          ? "bg-[#FFD9CA] text-caramel"
          : "bg-[#ECE8E2] text-[#715E50]"
      }`}
    >
      ◷ {status === "Preparing" ? t.orders.preparing : status}
    </span>
  );
};

/* =========================================================
   EMPTY ORDERS
========================================================= */

const EmptyOrders = () => {

  const { t } = useLanguage();

  return (
    <div className="rounded-xl bg-white px-5 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F0ECE5] text-xl text-caramel">
        ☕
      </div>

      <h2 className="mt-4 font-serif text-xl">
        {t.orders.noOrders}
      </h2>

      <p className="mt-1 text-xs text-[#715E50]">
        Your orders from Table 12 will appear here.
      </p>

      <Link
        to="/menu"
        className="mt-5 inline-flex rounded-full bg-caramel px-5 py-2.5 text-[10px] font-semibold text-cream"
      >
        {t.orders.exploreMenu}
      </Link>

    </div>
  );
};

export default MyOrders;