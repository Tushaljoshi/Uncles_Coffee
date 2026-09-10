import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

/* =========================================================
   DEMO CART DATA
   ========================================================= */

const initialCartItems = [
  {
    id: 1,
    name: "Cappuccino",
    price: 180,
    quantity: 2,
    image:
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=85",
    customization: "Extra Hot • Regular Whole Milk",
    note: 'Note: "Less sugar"',
  },

  {
    id: 7,
    name: "Veg Grilled Sandwich",
    price: 220,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=85",
    customization: "Fresh Farm Veggies • Extra Pesto",
    badge: "CHEF'S SPECIAL",
  },

  {
    id: 9,
    name: "French Fries",
    price: 160,
    quantity: 1,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=500&q=85",
    customization: "Hand-cut • Herb Salt • Roasted Garlic Dip",
    meta: "Sides & Quick Bites",
  },
];

/* =========================================================
   CART PAGE
   ========================================================= */

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [cartItems, setCartItems] =
    useState(initialCartItems);

  const [kitchenNote, setKitchenNote] = useState(
    "Please make the cappuccino extra hot and bring food together."
  );

  const [paymentMethod, setPaymentMethod] =
    useState("online");

  /* =========================================================
     QUANTITY
     ========================================================= */

  const updateQuantity = (id, amount) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            quantity: item.quantity + amount,
          };
        })
        .filter((item) => item.quantity > 0)
    );
  };

  /* =========================================================
     DELETE ITEM
     ========================================================= */

  const removeItem = (id) => {
    setCartItems((previousItems) =>
      previousItems.filter(
        (item) => item.id !== id
      )
    );
  };

  /* =========================================================
     TOTAL ITEMS
     ========================================================= */

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cartItems]);

  /* =========================================================
     SUBTOTAL
     ========================================================= */

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        item.price * item.quantity,
      0
    );
  }, [cartItems]);

  /* =========================================================
     GST + CAFE SERVICE
     
     Screenshot shows 5% = ₹37 on ₹740.
     ========================================================= */

  const gstAndService = Math.round(
    subtotal * 0.05
  );

  /* =========================================================
     ROUND OFF
     ========================================================= */

  const roundOff = 0;

  /* =========================================================
     FINAL TOTAL
     ========================================================= */

  const totalPayable =
    subtotal +
    gstAndService +
    roundOff;

  /* =========================================================
     PLACE ORDER
     ========================================================= */

  const handlePlaceOrder = () => {
    const orderData = {
      tableNumber: "12",
      customerName: "Tushal",
      items: cartItems,
      kitchenNote,
      paymentMethod,
      subtotal,
      gstAndService,
      totalPayable,
    };

    console.log("Order placed:", orderData);

    /*
      Later:
      API call will be made here.

      Example:

      await fetch("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData)
      });
    */

    navigate("/tracking");
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
        <section className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8 lg:pb-28">

          {/* =================================================
              TOP HEADING
          ================================================= */}

          <div className="mb-6">

            <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em]">

              <span className="text-caramel">
                Table-side Service
              </span>

              <span className="text-[#C7B7A8]">
                •
              </span>

              <span className="text-espresso">
                Cart Review
              </span>

            </div>

            <h1 className="mt-3 font-serif text-[34px] leading-tight tracking-[-0.03em] sm:text-[40px]">
              {t.cart.title}
            </h1>

          </div>

          {/* =================================================
              TABLE INFO
          ================================================= */}

          <div className="mb-6 flex justify-start lg:justify-end">

            <div className="flex max-w-full flex-wrap items-center gap-2 rounded-full bg-[#EFE9DF] px-4 py-2.5 sm:gap-3 sm:px-5">

              <span className="text-caramel">
                ▱
              </span>

              <span className="text-xs font-semibold text-espresso">
                Table 12 • Tushal
              </span>

              <span className="text-xs text-[#C9B9AA]">
                #CC-894
              </span>

            </div>

          </div>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.6fr_1fr]">

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div>

              {/* Selected Items Header */}

              <div className="mb-5 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <h2 className="font-serif text-[20px]">
                    {t.cart.selectedItems}
                  </h2>

                  <span className="rounded-full bg-[#E9E2D9] px-3 py-1 text-[10px] font-semibold text-caramel">
                    {totalItems} items
                  </span>

                </div>

                <span className="text-xs text-[#624B3D]">
                  {t.cart.dineIn}
                </span>

              </div>

              {/* =================================================
                  CART ITEMS
              ================================================= */}

              <div className="space-y-3">

                {cartItems.length === 0 ? (

                  <EmptyCart />

                ) : (

                  cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      item={item}
                      onIncrease={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                      onDecrease={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                      onRemove={() =>
                        removeItem(item.id)
                      }
                    />
                  ))

                )}

              </div>

              {/* =================================================
                  KITCHEN INSTRUCTIONS
              ================================================= */}

              {cartItems.length > 0 && (
                <section className="mt-6 rounded-2xl bg-[#F2EDE5] p-5 sm:p-6">

                  <div className="flex items-center gap-3">

                    <span className="text-lg text-caramel">
                      ♨
                    </span>

                    <h2 className="font-serif text-[20px]">
                      {t.cart.kitchenInstructions}
                    </h2>

                  </div>

                  <p className="mt-2 text-xs text-[#624B3D]">
                    Anything else for the kitchen? Let our
                    slow-bar baristas and culinary team know.
                  </p>

                  <div className="relative mt-4">

                    <textarea
                      value={kitchenNote}
                      onChange={(event) =>
                        setKitchenNote(
                          event.target.value
                        )
                      }
                      rows={3}
                      placeholder="Add instructions for the kitchen..."
                      className="w-full resize-none rounded-xl border border-[#EAE1D6] bg-white px-3 py-3 text-sm text-espresso outline-none placeholder:text-[#A9998C] focus:border-caramel"
                    />

                    <span className="pointer-events-none absolute bottom-2 right-3 text-[9px] text-[#C9B9AA]">
                      Note shared with Table 12
                    </span>

                  </div>

                </section>
              )}

              {/* =================================================
                  CONTINUE ORDERING
              ================================================= */}

              <div className="mt-7 flex items-center justify-between">

                <Link
                  to="/menu"
                  className="flex items-center gap-2 text-sm font-semibold text-caramel transition hover:text-caramelHover"
                >
                  <span className="text-lg">
                    ←
                  </span>

                  {t.cart.continueOrdering}
                </Link>

                <span className="hidden text-xs text-[#624B3D] sm:block">
                  Order #98124
                </span>

              </div>

              {/* =================================================
                  FRESHLY MADE
              ================================================= */}

              <div className="mt-6 flex items-center gap-4 rounded-2xl bg-[#F2EDE5] p-4 sm:p-5">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#E9DCCE] text-lg text-caramel">
                  ♨
                </div>

                <div>

                  <h3 className="font-serif text-[16px]">
                    Freshly Made to Order
                  </h3>

                  <p className="mt-0.5 text-xs text-[#624B3D]">
                    Your items are prepared right now in our
                    slow bar & stone bakery.
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div>

              <div className="lg:sticky lg:top-24">

                <div className="rounded-2xl bg-white p-5 shadow-[0_8px_25px_rgba(61,35,20,0.08)] sm:p-6">

                  {/* =================================================
                      BILL HEADER
                  ================================================= */}

                  <div className="flex items-start justify-between">

                    <div>

                      <h2 className="font-serif text-[20px]">
                        {t.cart.billBreakdown}
                      </h2>

                      <p className="mt-0.5 text-xs text-[#715E50]">
                        Table 12 • Instant Table Checkout
                      </p>

                    </div>

                    <span className="text-xl text-[#806F61]">
                      ▤
                    </span>

                  </div>

                  {/* =================================================
                      BILL
                  ================================================= */}

                  <div className="mt-7 space-y-4">

                    <BillRow
                      label={t.cart.subtotal}
                      value={`₹${subtotal}`}
                    />

                    <BillRow
                      label={
                        <span className="flex items-center gap-2">
                          {t.cart.gst}

                          <span className="rounded bg-[#E9E4DC] px-2 py-1 text-[9px] text-[#806F61]">
                            5%
                          </span>
                        </span>
                      }
                      value={`₹${gstAndService}`}
                    />

                    <BillRow
                      label={t.cart.roundOff}
                      value={`₹${roundOff}`}
                    />

                  </div>

                  {/* =================================================
                      TOTAL
                  ================================================= */}

                  <div className="mt-5 rounded-xl bg-[#F4F0E8] p-4">

                    <div className="flex items-start justify-between gap-4">

                      <div>

                        <h3 className="font-serif text-[18px]">
                          {t.cart.totalPayable}
                        </h3>

                        <p className="mt-1 text-[10px] text-[#715E50]">
                          Includes taxes & charges
                        </p>

                      </div>

                      <span className="font-serif text-[27px] font-semibold text-caramel">
                        ₹{totalPayable}
                      </span>

                    </div>

                  </div>

                  {/* =================================================
                      PAYMENT METHOD
                  ================================================= */}

                  <div className="mt-6">

                    <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-espresso">
                      {t.cart.paymentMethod}
                    </h3>

                    <div className="mt-3 space-y-3">

                      {/* Online */}

                      <PaymentOption
                        value="online"
                        selected={
                          paymentMethod ===
                          "online"
                        }
                        onClick={() =>
                          setPaymentMethod(
                            "online"
                          )
                        }
                        title={t.cart.payOnline}
                        description="UPI (GPay / PhonePe), Credit/Debit Card, NetBanking"
                        badge="Fastest"
                        footer="⚡ Instant digital receipt to your phone"
                      />

                      {/* Counter */}

                      <PaymentOption
                        value="counter"
                        selected={
                          paymentMethod ===
                          "counter"
                        }
                        onClick={() =>
                          setPaymentMethod(
                            "counter"
                          )
                        }
                        title={t.cart.payCounter}
                        description="Pay with cash or card terminal directly to our cafe captain"
                      />

                    </div>

                  </div>

                  {/* =================================================
                      PLACE ORDER
                  ================================================= */}

                  <button
                    type="button"
                    disabled={
                      cartItems.length === 0
                    }
                    onClick={
                      handlePlaceOrder
                    }
                    className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#91431F] text-sm font-semibold text-cream shadow-[0_5px_12px_rgba(145,67,31,0.18)] transition hover:bg-caramelHover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {t.cart.placeOrder} — ₹{totalPayable}

                    <span className="text-lg">
                      →
                    </span>
                  </button>

                  {/* =================================================
                      TRACKING MESSAGE
                  ================================================= */}

                  <div className="mt-5 flex gap-3">

                    <span className="mt-0.5 text-caramel">
                      ⓘ
                    </span>

                    <p className="text-[11px] leading-5 text-[#624B3D]">
                      You can track live preparation updates
                      right after placing your order. Table
                      delivery is automatic.
                    </p>

                  </div>

                  {/* =================================================
                      BRAND PROMISE
                  ================================================= */}

                  <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#EEE6DC] pt-5 text-[10px] text-[#806F61]">

                    <span className="text-caramel">
                      ♧
                    </span>

                    The Coffee Collective slow bar
                    hospitality promise

                  </div>

                </div>

                {/* =================================================
                    WIFI CARD
                ================================================= */}

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#F2EDE5] p-4">

                  <div className="flex items-center gap-3">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-lg text-caramel">
                      ◔
                    </div>

                    <div>

                      <h3 className="font-serif text-[16px]">
                        Guest High-Speed WiFi
                      </h3>

                      <p className="text-[10px] text-[#624B3D]">
                        Network:{" "}
                        <span className="font-semibold">
                          Collective-Roastery
                        </span>
                      </p>

                    </div>

                  </div>

                  <span className="rounded-full bg-[#E8E3DB] px-3 py-1.5 text-[9px] font-medium text-[#624B3D]">
                    Connected
                  </span>

                </div>

              </div>

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
   CART ITEM
========================================================= */

const CartItem = ({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) => {
  const itemTotal =
    item.price * item.quantity;

  return (
    <article className="rounded-2xl bg-[#F2EDE5] p-4 sm:p-5">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

        {/* Image */}

        <div className="relative h-[150px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[96px] sm:w-[96px]">

          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover"
          />

        </div>

        {/* Details */}

        <div className="min-w-0 flex-1">

          <div className="flex min-w-0 items-start justify-between gap-3">

            <div>

              <h3 className="break-words font-serif text-[19px] leading-tight text-espresso">
                {item.name}
              </h3>

              <p className="mt-1 text-xs text-[#624B3D]">
                {item.customization}
              </p>

              {item.badge && (
                <p className="mt-2 flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.06em] text-caramel">
                  ◇ {item.badge}
                </p>
              )}

              {item.note && (
                <p className="mt-2 text-[10px] italic text-[#806F61]">
                  ☷ {item.note}
                </p>
              )}

              {item.meta && (
                <p className="mt-2 text-[10px] text-[#806F61]">
                  {item.meta}
                </p>
              )}

            </div>

            {/* Delete */}

            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${item.name}`}
              className="shrink-0 text-[#806F61] transition hover:text-error"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 7h16" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M6 7l1 14h10l1-14" />
                <path d="M9 7V4h6v3" />
              </svg>
            </button>

          </div>

        </div>

        {/* Quantity + Price */}

        <div className="flex items-center justify-between gap-5 sm:flex-col sm:items-end">

          <div className="flex items-center gap-3 rounded-full bg-white px-2 py-1.5">

            <button
              type="button"
              onClick={onDecrease}
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-espresso transition hover:bg-latte"
            >
              −
            </button>

            <span className="w-4 text-center text-xs font-semibold">
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={onIncrease}
              className="flex h-7 w-7 items-center justify-center rounded-full text-sm text-espresso transition hover:bg-latte"
            >
              +
            </button>

          </div>

          <div className="text-right">

            <p className="font-serif text-base font-semibold text-caramel">
              ₹{itemTotal}
            </p>

            <p className="text-[9px] text-[#806F61]">
              ₹{item.price} each
            </p>

          </div>

        </div>

      </div>

    </article>
  );
};

/* =========================================================
   BILL ROW
========================================================= */

const BillRow = ({
  label,
  value,
}) => {
  return (
    <div className="flex items-center justify-between gap-5 text-sm">

      <span className="text-[#624B3D]">
        {label}
      </span>

      <span className="font-medium text-espresso">
        {value}
      </span>

    </div>
  );
};

/* =========================================================
   PAYMENT OPTION
========================================================= */

const PaymentOption = ({
  selected,
  onClick,
  title,
  description,
  badge,
  footer,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-xl p-4 text-left transition ${
        selected
          ? "bg-[#EFEAE2]"
          : "bg-[#F7F3ED] hover:bg-latte"
      }`}
    >

      <div className="flex items-start gap-3">

        {/* Radio */}

        <span
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
            selected
              ? "border-caramel"
              : "border-[#8D8177]"
          }`}
        >
          {selected && (
            <span className="h-2.5 w-2.5 rounded-full bg-caramel" />
          )}
        </span>

        {/* Content */}

        <div className="min-w-0 flex-1">

          <div className="flex items-start justify-between gap-3">

            <h4 className="min-w-0 text-sm font-semibold text-espresso">
              {title}
            </h4>

            {badge && (
              <span className="shrink-0 rounded-full bg-[#FF9A73] px-2.5 py-1 text-[8px] font-bold text-[#5C2715]">
                {badge}
              </span>
            )}

          </div>

          <p className="mt-1 text-[11px] leading-4 text-[#624B3D]">
            {description}
          </p>

          {footer && (
            <p className="mt-2 text-[9px] text-caramel">
              {footer}
            </p>
          )}

        </div>

      </div>

    </button>
  );
};

/* =========================================================
   EMPTY CART
========================================================= */

const EmptyCart = () => {
  return (
    <div className="rounded-2xl bg-[#F2EDE5] px-5 py-16 text-center">

      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-latte text-xl">
        ☕
      </div>

      <h2 className="mt-4 font-serif text-2xl">
        Your cart is empty
      </h2>

      <p className="mt-2 text-sm text-[#715E50]">
        Add something delicious from today's menu.
      </p>

      <Link
        to="/menu"
        className="mt-5 inline-flex rounded-full bg-caramel px-6 py-3 text-xs font-semibold text-cream transition hover:bg-caramelHover"
      >
        Browse Menu
      </Link>

    </div>
  );
};

export default Cart;