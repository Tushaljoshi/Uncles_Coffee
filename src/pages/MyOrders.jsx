import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import { API_BASE_URL, requestJson } from "../services/orderApi";

const formatOrder = (order) => {
  const date = order.createdAt ? new Date(order.createdAt) : null;
  const table = order.tableId;
  return {
    id: order.orderId || order._id,
    apiId: order._id || order.id || order.orderId,
    table:
      typeof table === "object"
        ? table?.tableNumber || table?.tableCode || "—"
        : table || "—",
    date: date && !Number.isNaN(date.valueOf())
      ? date.toLocaleDateString()
      : "—",
    time: date && !Number.isNaN(date.valueOf())
      ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : "",
    status: (order.status || "cart").replace(/^\w/, (letter) => letter.toUpperCase()),
    statusType: ["served", "cancelled"].includes(order.status)
      ? "completed"
      : "active",
    total: Number(order.total || 0),
    paymentStatus: `${order.paymentStatus || "pending"} · ${order.paymentMethod || "counter"}`,
    receiptId: order.paymentId || "",
    items: (order.items || []).map((item, index) => {
      const menuItem = typeof item.menuItemId === "object" ? item.menuItemId : {};
      const image = menuItem.imageUrl || menuItem.image;
      return {
        id: menuItem._id || menuItem.id || item.menuItemId || index,
        quantity: item.quantity,
        name: item.name || menuItem.name || "Menu item",
        description: [
          item.options?.temperature,
          item.options?.milk,
          ...(item.options?.extras || []).map((extra) => extra.name),
          item.note,
        ].filter(Boolean).join(" · "),
        price: Number(item.lineTotal || Number(item.unitPrice || 0) * item.quantity),
        image: image
          ? new URL(image, API_BASE_URL).toString()
          : "",
      };
    }),
  };
};

/* =========================================================
   MAIN PAGE
========================================================= */

const MyOrders = () => {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] =
    useState("All Orders");
  const [ordersData, setOrdersData] = useState([]);
  const [mobile, setMobile] = useState(
    localStorage.getItem("uncleCoffeeOrderMobile") || ""
  );
  const [mobileQuery, setMobileQuery] = useState(
    localStorage.getItem("uncleCoffeeOrderMobile") || ""
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!mobileQuery) {
      setOrdersData([]);
      return undefined;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError("");
    requestJson(
      `/api/orders/history?mobile=${encodeURIComponent(mobileQuery)}`,
      { signal: controller.signal }
    )
      .then((result) => {
        if (!Array.isArray(result.orders)) {
          throw new Error("The order history API returned an invalid response.");
        }
        setOrdersData(
          result.orders
            .filter((order) => order.status !== "cart")
            .map(formatOrder)
        );
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load order history.");
          setOrdersData([]);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [mobileQuery]);

  const searchOrders = (event) => {
    event.preventDefault();
    const normalizedMobile = mobile.replace(/\D/g, "");
    if (normalizedMobile.length < 10) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    localStorage.setItem("uncleCoffeeOrderMobile", normalizedMobile);
    setMobileQuery(normalizedMobile);
  };

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
                {mobileQuery ? `Orders for ${mobileQuery}` : "Order history"}
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

          <form
            onSubmit={searchOrders}
            className="mt-5 flex flex-col gap-3 rounded-xl bg-white p-4 shadow-sm sm:flex-row sm:items-end"
          >
            <label className="flex-1 text-xs font-semibold text-espresso">
              Find orders by mobile number
              <input
                type="tel"
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                className="mt-1 h-10 w-full rounded-lg border border-[#EAE1D6] px-3 text-sm"
                placeholder="10-digit mobile number"
              />
            </label>
            <button
              type="submit"
              className="h-10 rounded-full bg-caramel px-5 text-xs font-semibold text-cream"
            >
              Find Orders
            </button>
          </form>

          {error && (
            <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          {/* =================================================
              CONTENT GRID
          ================================================= */}

          <div className="mt-5 grid gap-5 sm:mt-6 sm:gap-7 lg:grid-cols-[1.7fr_1fr]">

            {/* =================================================
                LEFT - ORDERS
            ================================================= */}

            <div className="space-y-4">

              {isLoading && (
                <p className="rounded-xl bg-white p-5 text-sm text-[#624B3D]">
                  Loading orders…
                </p>
              )}

              {!isLoading && !mobileQuery && (
                <EmptyOrders message="Enter your mobile number to view order history." />
              )}

              {!isLoading && mobileQuery && filteredOrders.map((order) => (
                <OrderHistoryCard
                  key={order.id}
                  order={order}
                />
              ))}

              {!isLoading && mobileQuery && filteredOrders.length === 0 && (
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
                  {t.cart.addMore}
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
                    Your order is {activeOrders[0].status.toLowerCase()}.
                  </p>

                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-[#F2EDE5] p-3">

                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-caramel text-xs text-cream">
                      ☕
                    </div>

                    <span className="text-[9px] text-[#624B3D]">
                      Table {activeOrders[0].table}
                    </span>

                  </div>

                  <Link
                    to="/tracking"
                    state={{ orderId: activeOrders[0].apiId }}
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
              Order history
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
              state={{ orderId: order.apiId }}
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

const EmptyOrders = ({ message }) => {

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
        {message || "Your order history will appear here."}
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