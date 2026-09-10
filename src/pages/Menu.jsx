import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import FoodDetailModal from "../components/FoodDetailModal";
import { useLanguage } from "../context/LanguageContext";

/* =========================================================
   MENU DATA
========================================================= */

const menuData = [
  {
    category: "Artisanal Coffee & Brews",
    description: "Craft roasted in small batches",

    items: [
      {
        id: 1,
        name: "Cappuccino",
        price: 180,
        description:
          "Rich double espresso shot with silky microfoam milk, finished with light organic Ceylon cinnamon dust.",
        meta: "Hot · 220ml",
        badge: "POPULAR",
        image:
          "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=800&q=85",
        veg: true,
      },

      {
        id: 2,
        name: "Café Latte",
        price: 190,
        description:
          "Double shot espresso folded gently into velvety textured whole milk. Gentle sweetness with nutty undertones.",
        meta: "Hot / Iced · 280ml",
        veg: true,
      },

      {
        id: 3,
        name: "Long Black / Americano",
        price: 150,
        description:
          "Clean dial-origin extraction over hot filtered mineral water, preserving the delicate, intact golden crema.",
        meta: "Black · 200ml",
        veg: true,
      },

      {
        id: 4,
        name: "Cold Brew Tonic",
        price: 210,
        description:
          "18-hour slow steeped single origin coffee, botanical citrus zest infusion, finished with crisp sparkling Indian tonic water.",
        meta: "Chilled · 300ml",
        badge: "CHEF SELECTION",
        veg: true,
      },

      {
        id: 5,
        name: "Mocha Velvet",
        price: 220,
        description:
          "Single-origin espresso melted into 70% dark single-estate Belgian chocolate, steamed organic whole milk and shaved cacao.",
        meta: "Decaf · 240ml",
        veg: true,
      },

      {
        id: 6,
        name: "Custom Pour",
        price: 240,
        description:
          "We craft house-made oat milk and California almond milk upon request. Mention it to your barista in table special requests.",
        meta: "+₹40 for plant milk",
        badge: "MILK ALTERNATIVES",
        special: true,
        veg: true,
      },
    ],
  },

  {
    category: "Sourdough & Kitchen Plates",
    description: "Baked fresh every morning",

    items: [
      {
        id: 7,
        name: "Veg Grilled Sandwich",
        price: 220,
        description:
          "Farm fresh seasonal vegetables, mature aged cheddar, aromatic herbs and vegetables on toasted wild yeast sourdough.",
        meta: "Served with house dip",
        badge: "CHEF SELECTION",
        veg: true,
        image:
          "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=85",
      },

      {
        id: 8,
        name: "Sourdough Avocado Tartine",
        price: 260,
        description:
          "Crushed Hass avocado, toasted Aleppo chili flakes, Danish feta crumbles, pickled watermelon radish and lemon olive drizzle.",
        meta: "Open Tartine · Artisan",
        veg: true,
      },

      {
        id: 9,
        name: "Hand-cut Herb Fries",
        price: 160,
        description:
          "Crisp mountain potato fries tossed with fresh rosemary salt and thyme, served alongside roasted garlic black pepper aioli.",
        meta: "Sharing Portion",
        badge: "BEST SELLER",
        veg: true,
      },

      {
        id: 10,
        name: "Truffle Mushroom Melt",
        price: 280,
        description:
          "Pan-roasted wild and shiitake mushrooms, gruyère cheese melt and black truffle oil on toasted house-baked brioche.",
        meta: "Gourmet Sandwich",
        veg: true,
      },
    ],
  },

  {
    category: "Bakehouse & Desserts",
    description: "Handcrafted sweet treats",

    items: [
      {
        id: 11,
        name: "Sea Salt Chocolate Brownie",
        price: 180,
        description:
          "Fudgy dark chocolate brownie with crackly top, finished with Maldon sea salt flakes and raw cacao dusting.",
        meta: "Warm bake · Gluten option",
        badge: "POPULAR",
        image:
          "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=85",
        veg: true,
      },

      {
        id: 12,
        name: "Classic Tiramisu Cup",
        price: 240,
        description:
          "Savoiardi ladyfingers soaked in our fresh house espresso roast, layered with whipped mascarpone cream and Valrhona cocoa.",
        meta: "Chilled cup",
        veg: true,
      },

      {
        id: 13,
        name: "Warm Almond Croissant",
        price: 190,
        description:
          "Twice-baked butter croissant filled with fragrant vanilla bean frangipane, topped with toasted sliced almonds and powdered sugar.",
        meta: "Freshly Toasted",
        veg: true,
      },
    ],
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories = [
  {
    name: "All",
    count: 27,
  },
  {
    name: "Artisanal Coffee",
    count: 12,
  },
  {
    name: "Sourdough & Mains",
    count: 9,
  },
  {
    name: "Bakehouse & Desserts",
    count: 6,
  },
  {
    name: "Cold Brews & Teas",
    count: 7,
  },
];

/* =========================================================
   MENU PAGE
========================================================= */

const Menu = () => {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("All");

  const [search, setSearch] = useState("");

  const [vegOnly, setVegOnly] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);

  const [selectedMilk, setSelectedMilk] = useState("regular");

  const [selectedTemperature, setSelectedTemperature] =
    useState("hot");

  const [itemQuantity, setItemQuantity] = useState(1);

  const [itemNote, setItemNote] = useState("");

  const [cart, setCart] = useState({
    1: 1,
    7: 1,
    11: 1,
  });

  /* =========================================================
     CART COUNT
  ========================================================= */

  const cartItemsCount = Object.values(cart).reduce(
    (total, quantity) => total + quantity,
    0
  );

  /* =========================================================
     CART TOTAL
  ========================================================= */

  const cartTotal = Object.entries(cart).reduce(
    (total, [id, quantity]) => {

      const item = menuData
        .flatMap((section) => section.items)
        .find((menuItem) => menuItem.id === Number(id));

      return total + (item?.price || 0) * quantity;
    },

    0
  );

  /* =========================================================
     UPDATE CART
  ========================================================= */

  const updateCart = (item, amount) => {
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
  };

  /* =========================================================
     OPEN MODAL
  ========================================================= */

  const openItemModal = (item) => {
    setSelectedItem(item);

    setSelectedMilk("regular");

    setSelectedTemperature("hot");

    setItemQuantity(
      cart[item.id] || 1
    );

    setItemNote("");
  };

  /* =========================================================
     CLOSE MODAL
  ========================================================= */

  const closeItemModal = () => {
    setSelectedItem(null);
  };

  /* =========================================================
     MILK PRICE
  ========================================================= */

  const getMilkPrice = () => {

    if (
      selectedMilk === "oat" ||
      selectedMilk === "almond"
    ) {
      return 30;
    }

    return 0;
  };

  /* =========================================================
     MODAL TOTAL
  ========================================================= */

  const modalTotal = selectedItem
    ? (selectedItem.price + getMilkPrice()) *
      itemQuantity
    : 0;

  /* =========================================================
     ADD MODAL ITEM TO CART
  ========================================================= */

  const handleAddToCartFromModal = () => {

    if (!selectedItem) return;

    setCart((previous) => ({
      ...previous,
      [selectedItem.id]: itemQuantity,
    }));

    closeItemModal();
  };

  /* =========================================================
     FILTER MENU
  ========================================================= */

  const filteredSections = useMemo(() => {

    return menuData

      .map((section) => {

        const filteredItems =
          section.items.filter((item) => {

            const searchText =
              search.toLowerCase().trim();

            const matchesSearch =
              !searchText ||
              item.name
                .toLowerCase()
                .includes(searchText) ||
              item.description
                .toLowerCase()
                .includes(searchText);

            const matchesVeg =
              vegOnly ? item.veg : true;

            const matchesCategory =
              activeCategory === "All" ||
              section.category
                .toLowerCase()
                .includes(
                  activeCategory.toLowerCase()
                );

            return (
              matchesSearch &&
              matchesVeg &&
              matchesCategory
            );
          });

        return {
          ...section,
          items: filteredItems,
        };
      })

      .filter(
        (section) =>
          section.items.length > 0
      );

  }, [
    search,
    vegOnly,
    activeCategory,
  ]);

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

          {/* =================================================
              ROASTER SPOTLIGHT
          ================================================= */}

          <div className="mt-5 flex flex-col gap-3 rounded-xl bg-[#F0ECE5] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-3">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-caramel text-cream">
                ☕
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-caramel">
                    Roaster&apos;s Spotlight
                  </span>

                  <span className="text-[10px] text-[#A69787]">
                    •
                  </span>

                  <span className="text-xs font-medium text-espresso">
                    Ethiopia Yirgacheffe
                  </span>

                </div>

                <p className="text-[10px] text-[#715E50]">
                  Notes of bergamot blossom, Meyer lemon
                  & wild forest honey
                </p>

              </div>

            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-end">

              <span className="font-serif text-sm text-caramel">
                ₹210
              </span>

              <button
                type="button"
                className="rounded-full bg-caramel px-4 py-2 text-[10px] font-semibold text-cream transition hover:bg-caramelHover"
              >
                + Add
              </button>

            </div>

          </div>

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

              Table 12
            </div>

          </div>

          {/* =================================================
              CATEGORY TABS
          ================================================= */}

          <div className="mt-5 overflow-x-auto pb-1">

            <div className="flex min-w-max gap-2">

              {categories.map((category) => {

                const isActive =
                  activeCategory === category.name;

                return (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() =>
                      setActiveCategory(
                        category.name
                      )
                    }
                    className={`rounded-full px-4 py-2 text-[10px] font-medium transition ${
                      isActive
                        ? "bg-caramel text-cream"
                        : "bg-[#F0ECE5] text-[#624B3D] hover:bg-latte"
                    }`}
                  >
                    {category.name === "All"
                      ? t.menu.all
                      : category.name}

                    <span
                      className={`ml-1 ${
                        isActive
                          ? "text-[#F6DCCB]"
                          : "text-[#9D8C7E]"
                      }`}
                    >
                      {category.count}
                    </span>
                  </button>
                );

              })}

            </div>

          </div>

          {/* =================================================
              MENU SECTIONS
          ================================================= */}

          <div className="mt-8 space-y-6 sm:space-y-10">

            {filteredSections.map(
              (section) => (
                <MenuSection
                  key={section.category}
                  section={section}
                  cart={cart}
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
                Nothing on the menu
              </h2>

              <p className="mt-2 text-sm text-[#715E50]">
                Try another search or category.
              </p>

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

            </div>
          )}

          {/* =================================================
              INGREDIENT MESSAGE
          ================================================= */}

          <div className="mt-10 rounded-2xl bg-[#F1ECE3] px-6 py-8 text-center sm:px-10">

            <div className="text-lg text-caramel">
              ♧
            </div>

            <h2 className="mt-2 font-serif text-xl text-espresso">
              Purity of Ingredients
            </h2>

            <p className="mx-auto mt-2 max-w-[520px] text-xs leading-5 text-[#715E50]">
              We source beans directly from micro-lot estates
              in Chikmagalur and Yirgacheffe. Our bread is
              fermented for 36 hours using natural levain.
            </p>

          </div>

        </section>

      </main>

      {/* =====================================================
          FLOATING CART
      ===================================================== */}

      {cartItemsCount > 0 && (
        <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-24px)] max-w-[460px] -translate-x-1/2 sm:left-auto sm:right-8 sm:translate-x-0 lg:bottom-4">

          <div className="flex items-center justify-between gap-3 rounded-2xl bg-[#91431F] p-2 pl-3 text-cream shadow-[0_12px_30px_rgba(61,35,20,0.25)]">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-terracotta text-xs font-bold">
                {cartItemsCount}
              </div>

              <div className="min-w-0">

                <p className="text-[9px] font-semibold">
                  Table 12 Active · ₹{cartTotal}
                </p>

                <p className="truncate text-[9px] text-[#F0DCD0]">
                  Cappuccino, Veg Sandwich, Brownie
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
              Table 12 Active
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
  updateCart,
  openItemModal,
}) => {
  const { t } = useLanguage();

  return (
    <article
      onClick={() =>
        openItemModal(item)
      }
      className={`group relative cursor-pointer overflow-hidden rounded-xl border border-[#EFE8DE] bg-white transition hover:-translate-y-0.5 hover:border-[#E4D8CA] hover:shadow-[0_8px_20px_rgba(61,35,20,0.07)] ${
        item.special
          ? "bg-[#F4EEE6]"
          : ""
      }`}
    >

      {/* Image */}
      {item.image && (
        <div className="relative h-[210px] overflow-hidden">

          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />

          {item.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-[#91431F] px-2.5 py-1 text-[8px] font-bold tracking-[0.08em] text-cream">
              {item.badge}
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
      <div className="flex min-h-[225px] flex-col p-3">

        <div className="flex items-start justify-between gap-3">

          <div>

            <h3 className="font-serif text-[17px] leading-tight text-espresso">
              {item.name}
            </h3>

            {item.badge && !item.image && (
              <span className="mt-1 inline-block text-[7px] font-bold uppercase tracking-[0.08em] text-caramel">
                {item.badge}
              </span>
            )}

          </div>

          <span className="shrink-0 font-serif text-sm text-caramel">
            ₹{item.price}
          </span>

        </div>

        {/* Description */}
        <p className="mt-2 text-[10px] leading-[1.55] text-[#715E50]">
          {item.description}
        </p>

        {/* Bottom */}
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">

          <span className="text-[8px] tracking-[0.04em] text-[#806F61]">
            {item.meta}
          </span>

          {quantity > 0 ? (

            <QuantityControl
              quantity={quantity}
              onDecrease={(event) => {
                event.stopPropagation();
                updateCart(item, -1);
              }}
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
              className="flex items-center gap-1.5 rounded-full bg-[#F0ECE5] px-4 py-2 text-[9px] font-semibold text-espresso transition hover:bg-caramel hover:text-cream"
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
        className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs text-espresso transition hover:bg-latte"
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
        className="flex h-6 w-6 items-center justify-center rounded-full bg-caramel text-xs text-cream transition hover:bg-caramelHover"
      >
        +
      </button>

    </div>
  );
};

export default Menu;