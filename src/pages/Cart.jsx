import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";
import {
  getOrderRouteId,
  readStoredValue,
  requestJson,
  writeStoredValue,
} from "../services/orderApi";

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Unable to load Razorpay checkout."));
    document.body.appendChild(script);
  });

const getOrderFromResponse = (result) =>
  result.order ||
  result.cart ||
  result.data?.order ||
  result.data?.cart ||
  result.data ||
  result;

const getOrderItemId = (item) => {
  const menuItem = item.menuItemId;
  return String(
    typeof menuItem === "object"
      ? menuItem?._id || menuItem?.id
      : menuItem || item.id
  );
};

/* =========================================================
   CART PAGE
   ========================================================= */

const Cart = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [cartItems, setCartItems] = useState(() =>
    Object.values(readStoredValue("uncleCoffeeCart", {}))
  );
  const booking = readStoredValue("uncleCoffeeBooking", {});
  const dineIn = readStoredValue("uncleCoffeeDineIn", {});
  const reservation = booking.reservation || {};
  const bookedTable = reservation.table || {};
  const [tables, setTables] = useState([]);
  const [tableCode, setTableCode] = useState(
    dineIn.tableCode ||
      bookedTable.tableCode ||
      (typeof reservation.tableId === "string" ? reservation.tableId : "") ||
      ""
  );
  const [customerName, setCustomerName] = useState(
    dineIn.customer?.name || booking.customer?.name || ""
  );
  const [mobile, setMobile] = useState(
    dineIn.customer?.mobile || booking.customer?.mobile || ""
  );
  const [guestCount, setGuestCount] = useState(
    dineIn.guestCount || reservation.guests || 2
  );
  const [kitchenNote, setKitchenNote] = useState(
    dineIn.kitchenNote || reservation.notes || booking.customer?.notes || ""
  );
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draftOrderId, setDraftOrderId] = useState(
    localStorage.getItem("uncleCoffeeCartOrderId") || ""
  );

  useEffect(() => {
    let active = true;
    requestJson("/api/tables/all")
      .then((result) => {
        const availableTables = (result.tables || []).filter(
          (table) => table.isActive !== false
        );
        if (!active) return;
        setTables(availableTables);
        setTableCode((current) => {
          const currentTable = availableTables.find((table) =>
            [table.tableCode, table.id, table._id].includes(current)
          );
          if (currentTable) return currentTable.tableCode;
          const bookingCode = bookedTable.tableCode || reservation.tableId;
          if (
            typeof bookingCode === "string" &&
            availableTables.some((table) =>
              [table.tableCode, table.id, table._id].includes(bookingCode)
            )
          ) {
            return bookingCode;
          }
          return availableTables[0]?.tableCode || "";
        });
      })
      .catch((requestError) => {
        if (active) setError(requestError.message || "Unable to load tables.");
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeStoredValue(
      "uncleCoffeeCart",
      Object.fromEntries(
        cartItems.map((item) => [String(item.menuItemId || item.id), item])
      )
    );
  }, [cartItems]);

  useEffect(() => {
    if (customerName || mobile || tableCode) {
      writeStoredValue("uncleCoffeeDineIn", {
        tableCode,
        customer: { name: customerName, mobile },
        guestCount: Number(guestCount),
        kitchenNote,
      });
    }
  }, [customerName, mobile, tableCode, guestCount, kitchenNote]);

  /* =========================================================
     QUANTITY
     ========================================================= */

  const updateQuantity = (id, amount) => {
    setCartItems((previousItems) =>
      previousItems
        .map((item) => {
          if (String(item.menuItemId || item.id) !== String(id)) {
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
        (item) => String(item.menuItemId || item.id) !== String(id)
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
        (
          Number(item.price || 0) +
          (item.options?.extras || []).reduce(
            (extrasTotal, extra) => extrasTotal + Number(extra.price || 0),
            0
          )
        ) * item.quantity,
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

  const handlePlaceOrder = async () => {
    setError("");
    if (!cartItems.length) {
      setError("Add at least one menu item before checkout.");
      return;
    }
    if (
      !tableCode ||
      !customerName.trim() ||
      mobile.replace(/\D/g, "").length < 10
    ) {
      setError("Select a table and enter your name and valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);
    try {
      let order;
      let cartOrderId = draftOrderId;
      if (cartOrderId) {
        const existing = getOrderFromResponse(
          await requestJson(`/api/orders/cart/${encodeURIComponent(cartOrderId)}`)
        );
        order = existing;
      }

      if (!order || order.status === "cart") {
        if (!order) {
          const initialized = await requestJson("/api/orders/cart/init", {
            method: "POST",
            body: JSON.stringify({
              tableId: tableCode,
              customer: { name: customerName.trim(), mobile: mobile.trim() },
              guestCount: Number(guestCount),
              kitchenNote: kitchenNote.trim(),
            }),
          });
          order = getOrderFromResponse(initialized);
          cartOrderId = getOrderRouteId(order);
          if (!cartOrderId) {
            throw new Error("The cart API did not return an order ID.");
          }
          setDraftOrderId(String(cartOrderId));
          localStorage.setItem("uncleCoffeeCartOrderId", String(cartOrderId));
        }

        const currentItems = order.items || [];
        const currentById = new Map(
          currentItems.map((item) => [getOrderItemId(item), item])
        );
        const desiredIds = new Set(
          cartItems.map((item) => String(item.menuItemId || item.id))
        );

        for (const existingItem of currentItems) {
          const menuItemId = getOrderItemId(existingItem);
          if (!desiredIds.has(menuItemId)) {
            await requestJson(
              `/api/orders/cart/${encodeURIComponent(cartOrderId)}/items/${encodeURIComponent(menuItemId)}`,
              { method: "DELETE" }
            );
          }
        }

        for (const item of cartItems) {
          const menuItemId = String(item.menuItemId || item.id);
          const body = {
            menuItemId,
            quantity: item.quantity,
            options: item.options || {},
            note: item.note || "",
          };
          const existingItem = currentById.get(menuItemId);
          const path = `/api/orders/cart/${encodeURIComponent(cartOrderId)}/items`;
          await requestJson(
            existingItem
              ? `${path}/${encodeURIComponent(menuItemId)}`
              : path,
            {
              method: existingItem ? "PATCH" : "POST",
              body: JSON.stringify(existingItem ? {
                quantity: body.quantity,
                options: body.options,
                note: body.note,
              } : body),
            }
          );
        }

        const checkoutResult = await requestJson(
          `/api/orders/cart/${encodeURIComponent(cartOrderId)}/checkout`,
          {
            method: "POST",
            body: JSON.stringify({
              paymentMethod,
              kitchenNote: kitchenNote.trim(),
            }),
          }
        );
        order = getOrderFromResponse(checkoutResult);
      }

      const routeId = getOrderRouteId(order) || cartOrderId;
      if (!routeId || !order.orderId) {
        throw new Error("Checkout did not return the order identifiers.");
      }
      writeStoredValue("uncleCoffeeCurrentOrder", order);
      localStorage.setItem("uncleCoffeeOrderId", String(routeId));
      localStorage.setItem("uncleCoffeeBusinessOrderId", String(order.orderId));
      localStorage.setItem("uncleCoffeeOrderMobile", mobile.trim());

      if (paymentMethod === "counter") {
        await requestJson("/api/payments/counter", {
          method: "POST",
          body: JSON.stringify({
            orderId: order.orderId,
            notes: "Paying at the counter",
          }),
        });
        localStorage.removeItem("uncleCoffeeCartOrderId");
        localStorage.removeItem("uncleCoffeeCart");
        navigate("/tracking");
        return;
      }

      const paymentOrder = await requestJson("/api/payments/create-order", {
        method: "POST",
        body: JSON.stringify({ orderId: order.orderId }),
      });
      if (!paymentOrder.razorpayOrderId || !paymentOrder.keyId) {
        throw new Error("The payment API returned incomplete Razorpay details.");
      }

      await loadRazorpay();
      const razorpay = new window.Razorpay({
        key: paymentOrder.keyId,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || "INR",
        name: "Uncle's Coffee",
        description: `Order ${order.orderId}`,
        order_id: paymentOrder.razorpayOrderId,
        prefill: {
          name: paymentOrder.customer?.name || customerName.trim(),
          contact: paymentOrder.customer?.mobile || mobile.trim(),
        },
        handler: async (razorpayResponse) => {
          try {
            await requestJson("/api/payments/verify", {
              method: "POST",
              body: JSON.stringify(razorpayResponse),
            });
            localStorage.removeItem("uncleCoffeeCartOrderId");
            localStorage.removeItem("uncleCoffeeCart");
            navigate("/tracking");
          } catch (verificationError) {
            setError(
              verificationError.message ||
                "Payment verification failed. Please contact the cafe with your order ID."
            );
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setIsSubmitting(false),
        },
      });
      razorpay.open();
    } catch (requestError) {
      setError(requestError.message || "Unable to place your order.");
      setIsSubmitting(false);
    }
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

          <div className="mb-6 grid gap-3 rounded-2xl bg-[#EFE9DF] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-semibold text-espresso">
              Table
              <select
                value={tableCode}
                onChange={(event) => setTableCode(event.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-[#EAE1D6] bg-white px-3 text-sm"
              >
                <option value="">Select a table</option>
                {tables.map((table) => (
                  <option key={table.id || table._id} value={table.tableCode}>
                    {table.tableCode} · {table.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-semibold text-espresso">
              Name
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-[#EAE1D6] bg-white px-3 text-sm"
                autoComplete="name"
              />
            </label>
            <label className="text-xs font-semibold text-espresso">
              Mobile number
              <input
                value={mobile}
                onChange={(event) => setMobile(event.target.value)}
                className="mt-1 block h-10 w-full rounded-lg border border-[#EAE1D6] bg-white px-3 text-sm"
                inputMode="tel"
                autoComplete="tel"
              />
            </label>
            <label className="text-xs font-semibold text-espresso">
              Guests
              <input
                type="number"
                min="1"
                value={guestCount}
                onChange={(event) => setGuestCount(Math.max(1, Number(event.target.value) || 1))}
                className="mt-1 block h-10 w-full rounded-lg border border-[#EAE1D6] bg-white px-3 text-sm"
              />
            </label>
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
                      key={item.menuItemId || item.id}
                      item={item}
                      onIncrease={() =>
                        updateQuantity(
                          item.menuItemId || item.id,
                          1
                        )
                      }
                      onDecrease={() =>
                        updateQuantity(
                          item.menuItemId || item.id,
                          -1
                        )
                      }
                      onRemove={() =>
                        removeItem(item.menuItemId || item.id)
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
                      Note shared with {tableCode || "your table"}
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
                  {draftOrderId ? `Cart #${draftOrderId}` : ""}
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
                        {tableCode || "Select a table"} • Instant Table Checkout
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

                  {error && (
                    <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="button"
                    disabled={cartItems.length === 0 || isSubmitting}
                    onClick={
                      handlePlaceOrder
                    }
                    className="mt-6 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#91431F] text-sm font-semibold text-cream shadow-[0_5px_12px_rgba(145,67,31,0.18)] transition hover:bg-caramelHover disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Processing…"
                      : `${t.cart.placeOrder} — ₹${totalPayable}`}

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
              {tableCode ? `${tableCode} Active` : "Table not selected"}
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
  const extrasTotal = (item.options?.extras || []).reduce(
    (total, extra) => total + Number(extra.price || 0),
    0
  );
  const itemTotal = (Number(item.price || 0) + extrasTotal) * item.quantity;
  const customization = [
    item.options?.temperature,
    item.options?.milk && `${item.options.milk} milk`,
    ...(item.options?.extras || []).map((extra) => extra.name),
  ].filter(Boolean).join(" · ");

  return (
    <article className="rounded-2xl bg-[#F2EDE5] p-4 sm:p-5">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">

        {/* Image */}

        <div className="relative h-[150px] w-full shrink-0 overflow-hidden rounded-xl sm:h-[96px] sm:w-[96px]">

          <img
            src={item.image || ""}
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
                {customization || item.meta || "Menu item"}
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
              ₹{Number(item.price || 0) + extrasTotal} each
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