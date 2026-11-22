import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import FoodDetailModal from "../components/FoodDetailModal";
import { useLanguage } from "../context/LanguageContext";
import {
  readStoredValue,
  requestJson,
  writeStoredValue,
} from "../services/orderApi";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

const getCategoryLabel = (category = "") => {
  const labels = {
    "cold-brew": "Cold Brews & Teas",
    "artisanal-coffee": "Artisanal Coffee",
    "sourdough-kitchen-plates": "Sourdough & Mains",
    "bakehouse-desserts": "Bakehouse & Desserts",
  };
  const normalizedCategory = category.toLowerCase();

  return (
    labels[normalizedCategory] ||
    normalizedCategory
      .split(/[-_]/)
      .filter(Boolean)
      .map((word) => word[0].toUpperCase() + word.slice(1))
      .join(" ")
  );
};

const getExtrasTotal = (item, selectedExtras = []) =>
  (item.options?.extras || []).reduce((total, extra) => {
    const extraId = extra.id || extra._id || extra.name;
    return total + (
      selectedExtras.includes(extraId) ? Number(extra.price) || 0 : 0
    );
  }, 0);

/* =========================================================
   MENU PAGE
========================================================= */

const Menu = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [vegOnly, setVegOnly] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [orderSetup, setOrderSetup] = useState({
    loading: true,
    canSelectItems: false,
    message: "",
  });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedMilk, setSelectedMilk] = useState("Regular");
  const [selectedTemperature, setSelectedTemperature] = useState("Hot");
  const [selectedExtras, setSelectedExtras] = useState([]);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNote, setItemNote] = useState("");
  const [savedCart, setSavedCart] = useState(() =>
    readStoredValue("uncleCoffeeCart", {})
  );
  const [cart, setCart] = useState(() =>
    Object.fromEntries(
      Object.entries(readStoredValue("uncleCoffeeCart", {})).map(
        ([id, item]) => [id, item.quantity]
      )
    )
  );
  const [cartExtras, setCartExtras] = useState(() =>
    Object.fromEntries(
      Object.entries(readStoredValue("uncleCoffeeCart", {})).map(
        ([id, item]) => [
          id,
          (item.options?.extras || []).map((extra) => extra.id || extra._id || extra.name),
        ]
      )
    )
  );

  useEffect(() => {
    writeStoredValue("uncleCoffeeCart", savedCart);
  }, [savedCart]);

  useEffect(() => {
    const controller = new AbortController();
    const validateOrderSetup = async () => {
      const dineIn = readStoredValue("uncleCoffeeDineIn", {});
      const tableCode = dineIn.tableCode || dineIn.enteredTable || "";
      const guestCount = Number(dineIn.guestCount);
      const customer = dineIn.customer || {};
      const hasCartOrder = Boolean(
        localStorage.getItem("uncleCoffeeCartOrderId")
      );
      const hasRequiredDetails =
        tableCode &&
        String(customer.name || "").trim() &&
        String(customer.mobile || "").replace(/\D/g, "").length >= 10 &&
        Number.isInteger(guestCount) &&
        guestCount >= 1;

      if (!hasRequiredDetails || !hasCartOrder) {
        setOrderSetup({
          loading: false,
          canSelectItems: false,
          message:
            "Choose an available table and enter your name, mobile number, and guest count before selecting menu items.",
        });
        return;
      }

      try {
        const result = await requestJson("/api/tables/all", {
          signal: controller.signal,
        });
        if (!Array.isArray(result.tables)) {
          throw new Error("The tables API returned an invalid response.");
        }

        const selectedTable = result.tables.find(
          (table) =>
            table.isActive === true && table.tableCode === tableCode
        );
        if (!selectedTable) {
          setOrderSetup({
            loading: false,
            canSelectItems: false,
            message:
              "Your selected table is no longer available. Return to Welcome and choose another table.",
          });
          return;
        }
        if (selectedTable.capacity && guestCount > selectedTable.capacity) {
          setOrderSetup({
            loading: false,
            canSelectItems: false,
            message:
              "The guest count exceeds this table's capacity. Return to Welcome and update your details.",
          });
          return;
        }

        setOrderSetup({
          loading: false,
          canSelectItems: true,
          message: "",
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setOrderSetup({
            loading: false,
            canSelectItems: false,
            message:
              requestError.message ||
              "Unable to verify your table. Return to Welcome and try again.",
          });
        }
      }
    };

    validateOrderSetup();
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!API_BASE_URL) {
      setError("VITE_API_BASE_URL is not configured.");
      setIsLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");

      const endpoint = new URL(`${API_BASE_URL}/api/menu`);
      endpoint.searchParams.set("available", "true");
      if (activeCategory !== "All") {
        endpoint.searchParams.set("category", activeCategory);
      }
      if (search.trim()) {
        endpoint.searchParams.set("search", search.trim());
      }

      try {
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

        const items = result.items.map((item) => {
          const image = item.imageUrl || item.image;
          const imageUrl = item.imageFileId
            ? `${API_BASE_URL}/api/menu/file/${encodeURIComponent(item.imageFileId)}`
            : image
              ? new URL(image, API_BASE_URL).toString()
              : "";
          const price = Number(item.SellingPrice ?? item.price ?? 0);
          const cutoffPrice = Number(item.CutoffPrice ?? item.cutoffPrice ?? 0);

          return {
            ...item,
            id: item.id || item._id,
            price,
            cutoffPrice,
            discountPercentage: Number(
              item.PercentageOff ??
                item.percentageOff ??
                (cutoffPrice > price
                  ? Math.round(((cutoffPrice - price) / cutoffPrice) * 100)
                  : 0)
            ),
            image: imageUrl,
            badge: Array.isArray(item.badges)
              ? item.badges.join(" · ")
              : item.badge,
            category: item.category || "other",
            meta: item.meta || getCategoryLabel(item.category || "other"),
          };
        });

        setMenuItems(items);
        setCategoryOptions((previous) => {
          const categories = new Map(
            previous.map((category) => [category.value, category])
          );
          items.forEach((item) => {
            categories.set(item.category, {
              value: item.category,
              label: getCategoryLabel(item.category),
            });
          });
          return Array.from(categories.values());
        });
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setError(requestError.message || "Unable to load the menu.");
          setMenuItems([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, search.trim() ? 300 : 0);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [activeCategory, search]);

  /* =========================================================
     CART COUNT
  ========================================================= */

  const cartItemsCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );
  const cartSummary = Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([id]) => menuItems.find((item) => String(item.id) === id)?.name)
    .filter(Boolean)
    .join(", ");

  /* =========================================================
     CART TOTAL
  ========================================================= */

  const cartTotal = Object.entries(cart).reduce(
    (total, [id, quantity]) => {
      const item = menuItems.find(
        (menuItem) => String(menuItem.id) === id
      );
      if (!item) return total;
      return total + (
        item.price + getExtrasTotal(item, cartExtras[id])
      ) * quantity;
    },

    0
  );

  /* =========================================================
     UPDATE CART
  ========================================================= */

  const updateCart = (item, amount) => {
    if (!orderSetup.canSelectItems) return;

    if ((cart[item.id] || 0) + amount <= 0) {
      setCartExtras((previousExtras) => {
        const updatedExtras = { ...previousExtras };
        delete updatedExtras[item.id];
        return updatedExtras;
      });
    }

    setCart((previous) => {

      const currentQuantity =
        previous[item.id] || 0;

      const newQuantity =
        currentQuantity + amount;

      if (newQuantity <= 0) {
        const updated = {
          ...previous,
        };

        delete updated[item.id];

        return updated;
      }

      return {
        ...previous,
        [item.id]: newQuantity,
      };
    });

    setSavedCart((previous) => {
      const currentItem = previous[item.id];
      const newQuantity = (currentItem?.quantity || 0) + amount;
      if (newQuantity <= 0) {
        const updated = { ...previous };
        delete updated[item.id];
        return updated;
      }
      return {
        ...previous,
        [item.id]: {
          ...(currentItem || {
            id: item.id,
            menuItemId: item.id,
            name: item.name,
            price: item.price,
            image: item.image,
            options: {
              ...(item.options?.milk?.length
                ? { milk: item.options.milk[0] }
                : {}),
              ...(item.options?.temperature?.length
                ? { temperature: item.options.temperature[0] }
                : {}),
              extras: [],
            },
            note: "",
          }),
          quantity: newQuantity,
        },
      };
    });
  };

  /* =========================================================
     OPEN MODAL
  ========================================================= */

  const openItemModal = (item) => {
    if (!orderSetup.canSelectItems) return;

    setSelectedItem(item);
    setSelectedMilk(item.options?.milk?.[0] || "Regular");
    setSelectedTemperature(item.options?.temperature?.[0] || "Hot");
    setSelectedExtras(cartExtras[item.id] || []);
    setItemQuantity(cart[item.id] || 1);
    setItemNote("");
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeItemModal = () => {
    setSelectedItem(null);
  };

  /* =========================================================
     MODAL TOTAL
  ========================================================= */

  const modalTotal = selectedItem
    ? (selectedItem.price + getExtrasTotal(selectedItem, selectedExtras)) *
      itemQuantity
    : 0;

  /* =========================================================
     ADD MODAL ITEM TO CART
  ========================================================= */

  const handleAddToCartFromModal = () => {

    if (!orderSetup.canSelectItems) return;
    if (!selectedItem) return;

    const options = {};
    if (selectedItem.options?.milk?.length) {
      options.milk = selectedMilk;
    }
    if (selectedItem.options?.temperature?.length) {
      options.temperature = selectedTemperature;
    }
    const extras = (selectedItem.options?.extras || [])
      .filter((extra) =>
        selectedExtras.includes(extra.id || extra._id || extra.name)
      )
      .map(({ name, price }) => ({ name, price: Number(price) || 0 }));
    if (extras.length) options.extras = extras;

    setCart((previous) => ({
      ...previous,
      [selectedItem.id]: itemQuantity,
    }));
    setCartExtras((previous) => ({
      ...previous,
      [selectedItem.id]: selectedExtras,
    }));
    setSavedCart((previous) => ({
      ...previous,
      [selectedItem.id]: {
        id: selectedItem.id,
        menuItemId: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        image: selectedItem.image,
        badge: selectedItem.badge,
        meta: selectedItem.meta,
        quantity: itemQuantity,
        options,
        note: itemNote.trim(),
      },
    }));

    closeItemModal();
  };

  /* =========================================================
     FILTER MENU
  ========================================================= */

  const filteredSections = useMemo(() => {
    const sections = new Map();
    menuItems
      .filter((item) =>
        vegOnly
          ? item.veg === true || item.isVeg === true ||
            (item.veg === undefined && item.isVeg === undefined)
          : true
      )
      .forEach((item) => {
        if (!sections.has(item.category)) {
          sections.set(item.category, {
            category: getCategoryLabel(item.category),
            description: item.categoryDescription || "",
            items: [],
          });
        }
        sections.get(item.category).items.push(item);
      });

    return Array.from(sections.values());
  }, [menuItems, vegOnly]);

  return (
    <div className="min-h-screen bg-cream text-espresso">

      <Navbar />

      <main>

        <section className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 lg:px-8 lg:pb-28">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">

            <div>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-caramel">
                Slow Bar & Kitchen
              </p>

              <h1 className="mt-1 font-serif text-[32px] leading-tight tracking-[-0.025em] text-espresso sm:text-[38px]">
                {t.menu.title}
              </h1>

            </div>

            <p className="max-w-[330px] text-sm leading-5 text-[#624B3D] md:text-right">
              {t.menu.description}
            </p>

          </div>

          {!orderSetup.canSelectItems && (
            <div
              role={orderSetup.loading ? "status" : "alert"}
              className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#E8DED0] bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm leading-5 text-[#624B3D]">
                {orderSetup.loading
                  ? "Verifying your table and order details…"
                  : orderSetup.message}
              </p>
              {!orderSetup.loading && (
                <Link
                  to="/"
                  className="shrink-0 rounded-full bg-caramel px-4 py-2.5 text-center text-xs font-semibold text-cream transition hover:bg-caramelHover"
                >
                  Complete details
                </Link>
              )}
            </div>
          )}

          {/* =================================================
              SEARCH + FILTER
          ================================================= */}

          <div className="mt-5 flex flex-col gap-3 sm:flex-row">

            {/* Search */}
            <div className="relative min-w-0 flex-1">

              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8D7A6B]"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
              >
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 5 5" />
              </svg>

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder={t.menu.search}
                className="h-10 w-full rounded-full border border-[#EEE6DC] bg-white pl-11 pr-4 text-xs text-espresso outline-none placeholder:text-[#9D8C7E] focus:border-caramel"
              />

            </div>

            {/* Veg */}
            <button
              type="button"
              onClick={() =>
                setVegOnly(!vegOnly)
              }
              className={`flex h-10 items-center justify-center gap-2 rounded-full border px-4 text-[10px] font-medium transition ${
                vegOnly
                  ? "border-caramel bg-caramel text-cream"
                  : "border-[#EEE6DC] bg-white text-espresso hover:bg-latte"
              }`}
            >
              <span>●</span>
              {t.menu.vegOnly}
            </button>

            {/* Table */}
            <div className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#F0ECE5] px-4 text-[10px] text-espresso">
              <span className="text-caramel">
                ▱
              </span>

              Dine-in service
            </div>

          </div>

          {/* =================================================
              CATEGORY TABS
          ================================================= */}

          <div className="mt-5 overflow-x-auto pb-1">

            <div className="flex min-w-max gap-2">

              {[
                { value: "All", label: t.menu.all },
                ...categoryOptions,
              ].map((category) => {
                const isActive = activeCategory === category.value;

                return (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => setActiveCategory(category.value)}
                    className={`rounded-full px-4 py-2 text-[10px] font-medium transition ${
                      isActive
                        ? "bg-caramel text-cream"
                        : "bg-[#F0ECE5] text-[#624B3D] hover:bg-latte"
                    }`}
                  >
                    {category.label}
                  </button>
                );
              })}

            </div>

          </div>

          {/* =================================================
              MENU SECTIONS
          ================================================= */}

          {error && (
            <p role="alert" className="mt-8 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </p>
          )}

          <div className="mt-8 space-y-6 sm:space-y-10">

            {filteredSections.map(
              (section) => (
                <MenuSection
                  key={section.category}
                  section={section}
                  cart={cart}
                  canSelectItems={orderSetup.canSelectItems}
                  updateCart={updateCart}
                  openItemModal={
                    openItemModal
                  }
                />
              )
            )}

          </div>

          {/* =================================================
              NO RESULTS
          ================================================= */}

          {filteredSections.length === 0 && (
            <div className="py-24 text-center">

              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-latte text-xl">
                ☕
              </div>

              <h2 className="mt-4 font-serif text-2xl">
                {isLoading ? "Loading menu…" : "Nothing on the menu"}
              </h2>

              <p className="mt-2 text-sm text-[#715E50]">
                {isLoading
                  ? "Please wait while we fetch today’s menu."
                  : "Try another search or category."}
              </p>

              {!isLoading && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setVegOnly(false);
                    setActiveCategory("All");
                  }}
                  className="mt-5 rounded-full bg-caramel px-5 py-2.5 text-xs font-semibold text-cream"
                >
                  {t.menu.all} Items
                </button>
              )}

            </div>
          )}

        </section>

      </main>

      {/* =====================================================
          FLOATING CART
      ===================================================== */}

      {orderSetup.canSelectItems && cartItemsCount > 0 && (
        <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-24px)] max-w-[460px] -translate-x-1/2 sm:left-auto sm:right-8 sm:translate-x-0 lg:bottom-4">

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#91431F] p-2 pl-3 text-cream shadow-[0_12px_30px_rgba(61,35,20,0.25)]">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta text-xs font-bold">
                {cartItemsCount}
              </div>

              <div className="min-w-0">

                <p className="text-[9px] font-semibold">
                  Cart total · ₹{cartTotal}
                </p>

                <p className="truncate text-[9px] text-[#F0DCD0]">
                  {cartSummary || "Your selected menu items"}
                </p>

              </div>

            </div>

            <Link
              to="/cart"
              className="flex shrink-0 items-center gap-2 rounded-full bg-cream px-4 py-2.5 text-[10px] font-semibold text-espresso transition hover:bg-white"
            >
              View Cart
              <span>→</span>
            </Link>

          </div>

        </div>
      )}

      {/* =====================================================
          FOOD MODAL
      ===================================================== */}

      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          quantity={itemQuantity}
          setQuantity={setItemQuantity}
          selectedMilk={selectedMilk}
          setSelectedMilk={setSelectedMilk}
          selectedExtras={selectedExtras}
          setSelectedExtras={setSelectedExtras}
          selectedTemperature={
            selectedTemperature
          }
          setSelectedTemperature={
            setSelectedTemperature
          }
          itemNote={itemNote}
          setItemNote={setItemNote}
          total={modalTotal}
          onClose={closeItemModal}
          onAddToCart={
            handleAddToCartFromModal
          }
        />
      )}

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-[#E8DED0] bg-[#F5F0E8]">

        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-4 py-6 pb-28 text-[10px] text-[#624B3D] sm:px-6 sm:py-7 sm:pb-32 lg:flex-row lg:items-center lg:px-8 lg:pb-7">

          <p className="font-serif text-sm">
            Uncle&apos;s Coffee — Artisanal roastery
            & slow bar.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-1">

            <span>
              Table-side ordering service
            </span>

            <span className="font-medium text-caramel">
              Table-side ordering service
            </span>

          </div>

        </div>

      </footer>

    </div>
  );
};

/* =========================================================
   MENU SECTION
========================================================= */

const MenuSection = ({
  section,
  cart,
  canSelectItems,
  updateCart,
  openItemModal,
}) => {
  return (
    <section>

      {/* Header */}
      <div className="mb-4 flex items-center justify-between gap-4">

        <div className="flex items-center gap-2">

          <span className="h-1.5 w-1.5 rounded-full bg-caramel" />

          <h2 className="font-serif text-[19px] text-espresso">
            {section.category}
          </h2>

        </div>

        <span className="hidden text-[9px] text-[#715E50] sm:block">
          {section.description}
        </span>

      </div>

      {/* Cards */}
      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">

        {section.items.map((item) => (
          <MenuCard
            key={item.id}
            item={item}
            quantity={cart[item.id] || 0}
            canSelectItems={canSelectItems}
            updateCart={updateCart}
            openItemModal={openItemModal}
          />
        ))}

      </div>

    </section>
  );
};

/* =========================================================
   MENU CARD
========================================================= */

const MenuCard = ({
  item,
  quantity,
  canSelectItems,
  updateCart,
  openItemModal,
}) => {
  const { t } = useLanguage();

  return (
    <article
      onClick={() =>
        openItemModal(item)
      }
      aria-disabled={!canSelectItems}
      className={`group relative overflow-hidden rounded-2xl border border-[#EFE8DE] bg-white transition duration-300 ${
        canSelectItems
          ? "cursor-pointer hover:-translate-y-1 hover:border-[#E4D8CA] hover:shadow-[0_14px_30px_rgba(61,35,20,0.10)]"
          : "cursor-not-allowed opacity-75"
      } ${
        item.special
          ? "bg-[#F4EEE6]"
          : ""
      }`}
    >

      {/* Image */}
      {item.image && (
        <div className="relative h-[190px] overflow-hidden">

          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />

          {item.badge && (
            <span className="absolute left-3 top-3 max-w-[70%] truncate rounded-full bg-white/95 px-3 py-1.5 text-[9px] font-bold tracking-[0.04em] text-espresso shadow-sm backdrop-blur">
              {item.badge}
            </span>
          )}

          {item.discountPercentage > 0 && (
            <span className="absolute right-3 top-3 rounded-full bg-[#91431F] px-3 py-1.5 text-[10px] font-bold text-white shadow-sm">
              {item.discountPercentage}% OFF
            </span>
          )}

          {item.veg && (
            <span className="absolute right-3 top-3 rounded-full bg-white/95 px-2 py-1 text-[8px] font-semibold text-success">
              ● Veg
            </span>
          )}

        </div>
      )}

      {/* Content */}
      <div className="flex min-h-[190px] flex-col p-4">

        <div className="flex items-start justify-between gap-3">

          <div>

            <h3 className="font-serif text-[18px] leading-tight text-espresso">
              {item.name}
            </h3>

            {item.badge && !item.image && (
              <span className="mt-1 inline-block text-[7px] font-bold uppercase tracking-[0.08em] text-caramel">
                {item.badge}
              </span>
            )}

          </div>

          <div className="shrink-0 text-right">
            <p className="font-serif text-base font-semibold text-caramel">
              ₹{item.price}
            </p>
            {item.cutoffPrice > item.price && (
              <p className="text-[10px] text-[#9D8C7E] line-through">
                ₹{item.cutoffPrice}
              </p>
            )}
            {!item.image && item.discountPercentage > 0 && (
              <p className="mt-1 text-[9px] font-bold text-[#91431F]">
                {item.discountPercentage}% OFF
              </p>
            )}
          </div>

        </div>

        {/* Description */}
        <p className="mt-2 min-h-8 overflow-hidden text-[11px] leading-4 text-[#715E50]">
          {item.description}
        </p>

        {/* Bottom */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">

          <span className="text-[9px] font-medium tracking-[0.04em] text-[#806F61]">
            {item.meta}
          </span>

          {quantity > 0 ? (

            <QuantityControl
              quantity={quantity}
              onDecrease={(event) => {
                event.stopPropagation();
                updateCart(item, -1);
              }}
              disabled={!canSelectItems}
              onIncrease={(event) => {
                event.stopPropagation();
                updateCart(item, 1);
              }}
            />

          ) : (

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                updateCart(item, 1);
              }}
              disabled={!canSelectItems}
              className="flex items-center gap-1.5 rounded-full bg-caramel px-4 py-2.5 text-[10px] font-semibold text-cream transition hover:bg-caramelHover disabled:cursor-not-allowed disabled:opacity-50"
            >
              + {t.menu.add}
            </button>

          )}

        </div>

        {/* Special decoration */}
        {item.special && (
          <div className="pointer-events-none absolute -bottom-8 -right-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#F8E7DC]">
            <span className="text-caramel">
              ♧
            </span>
          </div>
        )}

      </div>

    </article>
  );
};

/* =========================================================
   QUANTITY CONTROL
========================================================= */

const QuantityControl = ({
  quantity,
  onDecrease,
  onIncrease,
  disabled,
}) => {

  return (
    <div
      className="flex items-center gap-1 rounded-full bg-[#F0ECE5] p-1"
      onClick={(event) =>
        event.stopPropagation()
      }
    >

      <button
        type="button"
        onClick={onDecrease}
        aria-label="Decrease quantity"
        disabled={disabled}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-espresso transition hover:bg-latte disabled:cursor-not-allowed disabled:opacity-50"
      >
        −
      </button>

      <span className="min-w-[18px] text-center text-[9px] font-medium text-espresso">
        {quantity}
      </span>

      <button
        type="button"
        onClick={onIncrease}
        aria-label="Increase quantity"
        disabled={disabled}
        className="flex h-6 w-6 items-center justify-center rounded-full bg-caramel text-xs text-cream transition hover:bg-caramelHover disabled:cursor-not-allowed disabled:opacity-50"
      >
        +
      </button>

    </div>
  );
};

export default Menu;