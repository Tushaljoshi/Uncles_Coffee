import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import {
  API_BASE_URL,
  getOrderRouteId,
  requestJson,
  writeStoredValue,
} from "../services/orderApi";

const Welcome = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [selectedTableCode, setSelectedTableCode] = useState("");
  const [isLoadingTables, setIsLoadingTables] = useState(true);
  const [tableError, setTableError] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [guests, setGuests] = useState(0);
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const selectedTable = tables.find(
    (table) => table.tableCode === selectedTableCode && table.isActive === true
  );
  const selectedTableImage =
    selectedTable?.imageUrl || selectedTable?.image
      ? new URL(
          selectedTable.imageUrl || selectedTable.image,
          API_BASE_URL
        ).toString()
      : "";

  useEffect(() => {
    const controller = new AbortController();
    const loadTables = async () => {
      setIsLoadingTables(true);
      setTableError("");
      try {
        const result = await requestJson("/api/tables/all", {
          signal: controller.signal,
        });
        if (!Array.isArray(result.tables)) {
          throw new Error("The tables API returned an invalid response.");
        }

        const availableTables = result.tables.filter(
          (table) => table.isActive === true && table.tableCode
        );
        setTables(availableTables);
        setSelectedTableCode((current) =>
          availableTables.some((table) => table.tableCode === current)
            ? current
            : ""
        );
        if (availableTables.length === 0) {
          setTableError("No tables are currently available.");
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setTableError(requestError.message || "Unable to load available tables.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingTables(false);
      }
    };

    loadTables();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const handleDineInUpdate = (event) => {
      const nextTableCode = event.detail?.tableCode;
      if (tables.some((table) => table.tableCode === nextTableCode)) {
        setSelectedTableCode(nextTableCode);
        setFormError("");
      }
    };

    window.addEventListener("uncleCoffee:dine-in-updated", handleDineInUpdate);
    return () =>
      window.removeEventListener(
        "uncleCoffee:dine-in-updated",
        handleDineInUpdate
      );
  }, [tables]);

  useEffect(() => {
    if (!API_BASE_URL) {
      setMenuError("VITE_API_BASE_URL is not configured.");
      setMenuLoading(false);
      return undefined;
    }

    const controller = new AbortController();

    const loadMenuItems = async () => {
      try {
        const endpoint = new URL(`${API_BASE_URL}/api/menu`);
        endpoint.searchParams.set("available", "true");

        const response = await fetch(endpoint, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Menu request failed (${response.status}).`);
        }

        const result = await response.json();
        if (!result.success || !Array.isArray(result.items)) {
          throw new Error("The menu API returned an invalid response.");
        }

        setMenuItems(
          result.items.slice(0, 3).map((item) => {
            const image = item.imageUrl || item.image;
            const imageUrl = item.imageFileId
              ? `${API_BASE_URL}/api/menu/file/${encodeURIComponent(item.imageFileId)}`
              : image
                ? new URL(image, API_BASE_URL).toString()
                : "";
            const price = Number(item.SellingPrice ?? item.price ?? 0);
            const cutoffPrice = Number(item.CutoffPrice ?? item.cutoffPrice ?? 0);

            return {
              id: item.id || item._id,
              image: imageUrl,
              title: item.name,
              description: item.description,
              price,
              cutoffPrice,
              discountPercentage: Number(
                item.PercentageOff ??
                  item.percentageOff ??
                  (cutoffPrice > price
                    ? Math.round(((cutoffPrice - price) / cutoffPrice) * 100)
                    : 0)
              ),
              tag: Array.isArray(item.badges)
                ? item.badges[0] || ""
                : item.badge || "",
            };
          })
        );
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setMenuError(
            requestError.message || "Unable to load menu items."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setMenuLoading(false);
        }
      }
    };

    loadMenuItems();

    return () => controller.abort();
  }, []);

  const handleViewMenu = async () => {
    setFormError("");
    if (!selectedTable || selectedTable.isActive !== true) {
      setFormError("Select an available table to continue.");
      return;
    }
    if (!customerName.trim()) {
      setFormError("Enter your name to start the order.");
      return;
    }
    if (mobile.replace(/\D/g, "").length < 10) {
      setFormError("Enter a valid 10-digit mobile number.");
      return;
    }
    if (!Number.isInteger(Number(guests)) || Number(guests) < 1) {
      setFormError("Enter at least one guest.");
      return;
    }
    if (selectedTable.capacity && Number(guests) > selectedTable.capacity) {
      setFormError(
        `This table accommodates up to ${selectedTable.capacity} guests.`
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const dineIn = {
        tableCode: selectedTable.tableCode,
        enteredTable: selectedTable.tableCode,
        customer: {
          name: customerName.trim(),
          mobile: mobile.trim(),
        },
        guestCount: Number(guests),
        kitchenNote: note.trim(),
      };
      writeStoredValue("uncleCoffeeDineIn", dineIn);
      const result = await requestJson("/api/orders/cart/init", {
        method: "POST",
        body: JSON.stringify({
          tableId: selectedTable.tableCode,
          customer: dineIn.customer,
          guestCount: dineIn.guestCount,
          kitchenNote: dineIn.kitchenNote,
        }),
      });
      const order =
        result.order ||
        result.cart ||
        result.data?.order ||
        result.data?.cart ||
        result.data ||
        result;
      const cartId = getOrderRouteId(order);
      if (!cartId) {
        throw new Error("The cart API did not return an order ID.");
      }
      localStorage.setItem("uncleCoffeeCartOrderId", String(cartId));
      localStorage.removeItem("uncleCoffeeCart");
      navigate("/menu");
    } catch (requestError) {
      setFormError(requestError.message || "Unable to start your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream text-espresso">
      <Navbar />

      {/* ================= HERO ================= */}
      <main>
        <section className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">
          <div className="grid items-start gap-8 sm:gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-12">

            {/* ================= LEFT CONTENT ================= */}
            <div>
              {/* Small Tags */}
              <div className="mb-6 flex flex-wrap items-center gap-2 sm:mb-7">
                <span className="rounded-full bg-[#EFE9DF] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-caramel">
                  ● {t.welcome.badge}
                </span>

                <span className="text-xs text-[#B6A898]">
                  •
                </span>

                <span className="rounded-full bg-[#EFE9DF] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-caramel">
                  Dine-in ordering
                </span>
              </div>

              {/* Heading */}
              <h2 className="max-w-[650px] font-serif text-[40px] font-medium leading-[1] tracking-[-0.035em] text-espresso sm:text-[56px] lg:text-[60px]">
                  {t.welcome.title}
              </h2>

              {/* Description */}
              <p className="mt-5 max-w-[590px] text-[15px] leading-6 text-[#624B3D] sm:mt-6 sm:text-[17px] sm:leading-7">
                {t.welcome.description}
              </p>

              {/* ================= HERO IMAGE ================= */}
              <div className="relative mt-7 h-[280px] overflow-hidden rounded-[18px] bg-gradient-to-br from-[#E9D7C6] via-[#D4B89D] to-[#A97957] shadow-[0_14px_35px_rgba(61,35,20,0.12)] sm:h-[390px]">
                {selectedTableImage ? (
                  <img
                    src={selectedTableImage}
                    alt={selectedTable?.name || "Selected available table"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-6xl text-white/80">
                    ▱
                  </div>
                )}
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-4 sm:bottom-4 sm:gap-4">
                  <div className="max-w-[calc(100%-8px)] rounded-2xl bg-cream/95 p-3 shadow-lg backdrop-blur-sm sm:max-w-[310px] sm:p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-caramel">
                      {selectedTable ? "Available table" : "Choose a table"}
                    </p>
                    <h3 className="mt-1 font-serif text-lg leading-tight text-espresso sm:text-xl">
                      {selectedTable?.name || "Table details"}
                    </h3>
                    <p className="mt-1 text-[11px] leading-4 text-[#624B3D] sm:text-xs sm:leading-5">
                      {selectedTable
                        ? `${selectedTable.tableCode} · ${selectedTable.location || selectedTable.area || ""}${selectedTable.capacity ? ` · Seats ${selectedTable.capacity}` : ""}`
                        : "Available seating options will appear here."}
                    </p>
                  </div>
                  {selectedTable && (
                    <div className="hidden items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-espresso shadow-lg sm:flex">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Available
                    </div>
                  )}
                </div>
              </div>

              {/* ================= FEATURE CARDS ================= */}
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FeatureCard
                  icon="⌗"
                  title="Available tables"
                  description={`${tables.length} currently available`}
                />

                <FeatureCard
                  icon="☕"
                  title="Guest details"
                  description={
                    guests > 0
                      ? `${guests} ${guests === 1 ? "guest" : "guests"} selected`
                      : "Guest count required"
                  }
                />

                <FeatureCard
                  icon="▣"
                  title="Order setup"
                  description="Continue to the menu when ready"
                />
              </div>
            </div>

            {/* ================= RIGHT ORDER SETUP CARD ================= */}
            <div className="lg:pt-1">
              <div className="rounded-[22px] bg-[#F0ECE5] p-5 shadow-[0_15px_30px_rgba(61,35,20,0.10)] sm:p-7">

                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-caramel">
                      {selectedTable?.tableCode || "Select an available table"}
                    </p>

                    <h3 className="mt-1 font-serif text-[24px] leading-tight text-espresso">
                      Let's get your order started
                    </h3>
                  </div>

                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E7DCCE] text-caramel">
                    <span className="text-lg">⌂</span>
                  </div>
                </div>

                {/* No Login Message */}
                <div className="mt-5 flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs text-[#624B3D]">
                  <span className="text-sm text-success">♡</span>
                  <span>
                    {t.welcome.noLogin}
                  </span>
                </div>

                {/* Available table */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="available-table" className="text-xs font-medium text-espresso">
                      Available table
                    </label>

                    <span className="text-[10px] font-semibold text-caramel">
                      {tables.length} available
                    </span>
                  </div>

                  <select
                    id="available-table"
                    value={selectedTableCode}
                    onChange={(event) => {
                      setSelectedTableCode(event.target.value);
                      const nextTable = tables.find(
                        (table) => table.tableCode === event.target.value
                      );
                      if (nextTable?.capacity) {
                        setGuests((current) =>
                          Math.min(current, nextTable.capacity)
                        );
                      }
                      setFormError("");
                    }}
                    disabled={isLoadingTables || tables.length === 0}
                    className="h-12 w-full rounded-xl border border-transparent bg-white px-4 text-sm font-semibold text-espresso outline-none transition focus:border-caramel focus:ring-2 focus:ring-caramel/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {isLoadingTables ? "Loading available tables…" : "Select an available table"}
                    </option>
                    {tables.map((table) => (
                      <option key={table.id || table._id} value={table.tableCode}>
                        {table.tableCode} · {table.name} · {table.capacity} seats
                      </option>
                    ))}
                  </select>
                  {selectedTable && (
                    <p className="mt-2 text-[11px] text-[#715E50]">
                      {selectedTable.area} · {selectedTable.location}
                    </p>
                  )}
                  {tableError && (
                    <p role="alert" className="mt-2 text-xs text-red-700">
                      {tableError}
                    </p>
                  )}
                </div>

                {/* Customer Name */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="customerName"
                      className="text-xs font-medium text-espresso"
                    >
                      {t.welcome.customerName}
                    </label>

                    <span className="text-[11px] text-[#715E50]">
                      Required
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5">
                    <span className="text-lg text-caramel">♙</span>

                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent text-sm font-semibold text-espresso outline-none placeholder:text-[#A89788]"
                    />
                  </div>
                </div>

                {/* Customer mobile */}
                <div className="mt-5">
                  <label
                    htmlFor="customerMobile"
                    className="mb-2 block text-xs font-medium text-espresso"
                  >
                    Mobile number
                  </label>
                  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5">
                    <span className="text-lg text-caramel">☎</span>
                    <input
                      id="customerMobile"
                      type="tel"
                      value={mobile}
                      onChange={(event) => {
                        setMobile(event.target.value);
                        setFormError("");
                      }}
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="10-digit mobile number"
                      className="w-full bg-transparent text-sm font-semibold text-espresso outline-none placeholder:text-[#A89788]"
                    />
                  </div>
                </div>

                {/* Kitchen Note */}
                <div className="mt-5">
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="kitchenNote"
                      className="text-xs font-medium text-espresso"
                    >
                      {t.welcome.notes}
                    </label>

                    <span className="text-[11px] text-[#715E50]">
                      {t.welcome.optional}
                    </span>
                  </div>

                  <textarea
                    id="kitchenNote"
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Less spicy, extra hot, no onions..."
                    className="w-full resize-none rounded-xl bg-white px-4 py-3 text-sm leading-6 text-espresso outline-none placeholder:text-[#A89788] focus:ring-2 focus:ring-caramel/20"
                  />

                </div>

                {/* Guests */}
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-medium text-espresso">
                    {t.welcome.guests}
                  </label>

                  <div className="flex items-center justify-between rounded-xl bg-white p-2">
                    <span className="px-2 text-xs text-[#715E50]">
                      {guests > 0
                        ? `${guests} ${guests === 1 ? "guest" : "guests"}`
                        : "Choose guest count"}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        aria-label="Remove one guest"
                        disabled={guests <= 0}
                        onClick={() => setGuests((current) => Math.max(0, current - 1))}
                        className="h-9 w-9 rounded-lg bg-[#F0ECE5] text-lg text-espresso disabled:opacity-40"
                      >
                        −
                      </button>
                      <input
                        aria-label="Number of guests"
                        type="number"
                        min="1"
                        max={selectedTable?.capacity || undefined}
                        value={guests || ""}
                        onChange={(event) => {
                          if (!event.target.value) {
                            setGuests(0);
                            return;
                          }
                          const next = Number(event.target.value);
                          const validGuests =
                            Number.isFinite(next) && next >= 1
                              ? Math.floor(next)
                              : 1;
                          setGuests(
                            selectedTable?.capacity
                              ? Math.min(validGuests, selectedTable.capacity)
                              : validGuests
                          );
                        }}
                        className="w-14 bg-transparent text-center text-sm font-semibold outline-none"
                      />
                      <button
                        type="button"
                        aria-label="Add one guest"
                        disabled={
                          Boolean(selectedTable?.capacity) &&
                          guests >= selectedTable.capacity
                        }
                        onClick={() => setGuests((current) => current + 1)}
                        className="h-9 w-9 rounded-lg bg-[#F0ECE5] text-lg text-espresso disabled:opacity-40"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                {(!selectedTable ||
                  guests < 1 ||
                  !customerName.trim() ||
                  mobile.replace(/\D/g, "").length < 10) && (
                  <p className="mt-5 text-center text-xs text-[#715E50]">
                    Choose a table, set the guest count, and enter your name and mobile number to continue.
                  </p>
                )}
                {formError && (
                  <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800">
                    {formError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleViewMenu}
                  disabled={
                    isSubmitting ||
                    isLoadingTables ||
                    !selectedTable ||
                    guests < 1 ||
                    !customerName.trim() ||
                    mobile.replace(/\D/g, "").length < 10 ||
                    tables.length === 0
                  }
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-caramel px-6 py-4 text-sm font-semibold text-cream shadow-sm transition hover:bg-caramelHover hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isSubmitting ? "Starting order…" : t.welcome.viewMenu}

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

                {/* Help */}
                <p className="mt-6 text-center text-[11px] leading-5 text-[#715E50]">
                  Need assistance? Please contact a staff member at the cafe.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= MENU PREVIEW ================= */}
        <section className="border-t border-[#EEE5D9] bg-[#FBF8F2]">
          <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-caramel">
                  From our menu
                </p>

                <h2 className="mt-1 font-serif text-[26px] text-espresso sm:text-[30px]">
                  Menu items
                </h2>
              </div>

              <a
                href="/menu"
                className="text-xs font-semibold text-caramel transition hover:text-caramelHover"
              >
                Browse full menu →
              </a>
            </div>

            {menuError && (
              <p role="alert" className="mt-6 text-sm text-red-800">
                {menuError}
              </p>
            )}

            {menuLoading ? (
              <p className="mt-6 text-sm text-[#715E50]">
                Loading menu items…
              </p>
            ) : menuItems.length > 0 ? (
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {menuItems.map((item) => (
                  <MenuItemCard key={item.id} {...item} />
                ))}
              </div>
            ) : !menuError ? (
              <p className="mt-6 text-sm text-[#715E50]">
                No menu items are available right now.
              </p>
            ) : null}
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#E8DED0] bg-[#F5F0E8]">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-4 py-6 pb-28 text-xs text-[#624B3D] sm:px-6 sm:py-7 sm:pb-32 lg:flex-row lg:items-center lg:px-8 lg:pb-7">
          <p className="font-serif text-sm">
            Uncle's Coffee
          </p>

          <div className="flex items-center gap-5">
            <span>Dine-in ordering</span>

            <span className="font-medium text-caramel">
              {selectedTable
                ? `${selectedTable.tableCode} · Available`
                : "Select an available table"}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* =========================================================
   FEATURE CARD
========================================================= */

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-[#F6F1E9] px-3 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F4D8CA] text-base text-caramel">
        {icon}
      </div>

      <div className="min-w-0">
        <h4 className="text-xs font-semibold text-espresso">
          {title}
        </h4>

        <p className="mt-0.5 truncate text-[10px] text-[#715E50]">
          {description}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   MENU ITEM CARD
========================================================= */

const MenuItemCard = ({
  image,
  title,
  description,
  price,
  cutoffPrice,
  discountPercentage,
  tag,
}) => {
  return (
    <article className="group overflow-hidden rounded-[20px] border border-[#EEE5D9] bg-white shadow-[0_6px_18px_rgba(61,35,20,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(61,35,20,0.12)]">
      <div className="relative h-40 overflow-hidden bg-[#F0ECE5]">
        {image && (
          <img
            src={image}
            alt={title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        )}
        {tag && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-semibold text-espresso shadow-sm backdrop-blur">
            {tag}
          </span>
        )}
        {discountPercentage > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-[#91431F] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm">
            {discountPercentage}% OFF
          </span>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-serif text-[19px] leading-tight text-espresso">
            {title}
          </h3>

          <div className="shrink-0 text-right">
            <p className="text-base font-semibold text-caramel">
              ₹{price}
            </p>
            {cutoffPrice > price && (
              <p className="text-[10px] text-[#9D8C7E] line-through">
                ₹{cutoffPrice}
              </p>
            )}
          </div>
        </div>

        <p className="mt-2 h-9 overflow-hidden text-xs leading-[18px] text-[#715E50]">
          {description}
        </p>

      </div>
    </article>
  );
};

export default Welcome;