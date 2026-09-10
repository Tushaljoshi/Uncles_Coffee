import React, { useEffect } from "react";

const FoodDetailModal = ({
  item,
  quantity,
  setQuantity,
  selectedMilk,
  setSelectedMilk,
  selectedTemperature,
  setSelectedTemperature,
  itemNote,
  setItemNote,
  total,
  onClose,
  onAddToCart,
}) => {

  // Escape key
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-espresso/45 p-3 backdrop-blur-[6px] sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >

      {/* Modal */}
      <div
        className="relative flex max-h-[calc(100dvh-1.5rem)] w-full max-w-[520px] flex-col overflow-hidden rounded-[22px] bg-cream shadow-[0_25px_70px_rgba(61,35,20,0.30)] sm:max-h-[94vh]"
        onMouseDown={(event) => event.stopPropagation()}
      >

        {/* ================= IMAGE ================= */}
        <div className="relative h-[220px] shrink-0 sm:h-[245px]">

          <img
            src={
              item.image ||
              "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=85"
            }
            alt={item.name}
            className="h-full w-full object-cover"
          />

          {/* Gradient */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-espresso/40 to-transparent" />

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-espresso shadow-sm backdrop-blur-sm transition hover:bg-white"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            >
              <path d="M6 6l12 12" />
              <path d="M18 6L6 18" />
            </svg>
          </button>

          {/* Badges */}
          <div className="absolute bottom-3 left-4 flex flex-wrap gap-2">

            {item.badge && (
              <span className="rounded-full bg-[#91431F] px-3 py-1.5 text-[8px] font-bold tracking-[0.08em] text-cream">
                {item.badge}
              </span>
            )}

            <span className="rounded-full bg-cream px-3 py-1.5 text-[8px] font-semibold tracking-[0.05em] text-caramel">
              Single Origin Blend
            </span>

          </div>
        </div>

        {/* ================= CONTENT ================= */}
        <div className="overflow-y-auto">

          <div className="p-5 sm:p-6">

            {/* Title */}
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-5">

              <div>
                <h2 className="font-serif text-[27px] leading-tight text-espresso">
                  {item.name}
                </h2>

                <p className="mt-1.5 max-w-[420px] text-[13px] leading-5 text-[#624B3D]">
                  {item.description}
                </p>
              </div>

              <span className="shrink-0 font-serif text-lg font-semibold text-caramel">
                ₹{item.price}
              </span>

            </div>

            {/* ================= QUANTITY ================= */}
            <div className="mt-6 flex items-center justify-between rounded-2xl bg-[#F4F0E8] px-4 py-3.5">

              <span className="text-sm font-medium text-espresso">
                Quantity
              </span>

              <div className="flex items-center gap-3 rounded-full bg-[#EAE4DA] p-1">

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) =>
                      Math.max(1, current - 1)
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-espresso transition hover:bg-latte"
                >
                  −
                </button>

                <span className="w-5 text-center text-sm font-semibold text-espresso">
                  {quantity}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    setQuantity((current) => current + 1)
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm text-espresso transition hover:bg-latte"
                >
                  +
                </button>

              </div>
            </div>

            {/* ================= MILK ================= */}
            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-espresso">
                  Milk Choice
                </h3>

                <span className="text-[10px] font-medium tracking-[0.08em] text-[#715E50]">
                  Select one
                </span>
              </div>

              <div className="space-y-2">

                <MilkOption
                  label="Regular Whole Milk"
                  price="Included"
                  selected={selectedMilk === "regular"}
                  onClick={() => setSelectedMilk("regular")}
                />

                <MilkOption
                  label="Oat Milk (Barista Blend)"
                  price="+₹30"
                  selected={selectedMilk === "oat"}
                  onClick={() => setSelectedMilk("oat")}
                />

                <MilkOption
                  label="Almond Milk"
                  price="+₹30"
                  selected={selectedMilk === "almond"}
                  onClick={() => setSelectedMilk("almond")}
                />

              </div>
            </div>

            {/* ================= TEMPERATURE ================= */}
            <div className="mt-6">

              <h3 className="mb-2 text-sm font-semibold text-espresso">
                Temperature
              </h3>

              <div className="grid grid-cols-3 gap-2">

                {[
                  {
                    value: "hot",
                    label: "Hot",
                  },
                  {
                    value: "extraHot",
                    label: "Extra Hot",
                  },
                  {
                    value: "iced",
                    label: "Iced",
                  },
                ].map((temperature) => {

                  const active =
                    selectedTemperature === temperature.value;

                  return (
                    <button
                      key={temperature.value}
                      type="button"
                      onClick={() =>
                        setSelectedTemperature(
                          temperature.value
                        )
                      }
                      className={`rounded-xl py-3 text-xs font-medium transition ${
                        active
                          ? "bg-caramel text-cream"
                          : "bg-[#F4F0E8] text-espresso hover:bg-latte"
                      }`}
                    >
                      {temperature.label}
                    </button>
                  );
                })}

              </div>
            </div>

            {/* ================= NOTE ================= */}
            <div className="mt-6">

              <label
                htmlFor="baristaNote"
                className="mb-2 block text-sm font-semibold text-espresso"
              >
                Special Notes for Barista
              </label>

              <input
                id="baristaNote"
                type="text"
                value={itemNote}
                onChange={(event) =>
                  setItemNote(event.target.value)
                }
                placeholder="Less sugar"
                className="h-11 w-full rounded-xl bg-[#F4F0E8] px-4 text-xs text-espresso outline-none placeholder:text-[#8D7A6B] focus:ring-2 focus:ring-caramel/20"
              />

            </div>

          </div>

          {/* ================= CTA ================= */}
          <div className="border-t border-[#E8DED0] bg-[#F5F0E8] p-4 sm:p-5">

            <div className="flex items-center gap-4">

              {/* Total */}
              <div className="shrink-0">
                <p className="text-[10px] text-[#715E50]">
                  Table 12 Total
                </p>

                <p className="font-serif text-xl font-semibold text-espresso">
                  ₹{total}
                </p>
              </div>

              {/* Add */}
              <button
                type="button"
                onClick={onAddToCart}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-caramel px-5 text-sm font-semibold text-cream shadow-sm transition hover:bg-caramelHover hover:shadow-md"
              >

                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 8h12l-1 12H7L6 8Z" />
                  <path d="M9 8a3 3 0 0 1 6 0" />
                </svg>

                Add to Cart — ₹{total}

              </button>

            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MILK OPTION
========================================================= */

const MilkOption = ({
  label,
  price,
  selected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition ${
        selected
          ? "bg-[#F2E7DC]"
          : "bg-[#F4F0E8] hover:bg-latte"
      }`}
    >

      {/* Radio */}
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
          selected
            ? "border-caramel"
            : "border-[#9B8D81]"
        }`}
      >
        {selected && (
          <span className="h-2 w-2 rounded-full bg-caramel" />
        )}
      </span>

      {/* Label */}
      <span className="flex-1 text-sm text-espresso">
        {label}
      </span>

      {/* Price */}
      <span
        className={`text-[10px] font-medium ${
          price === "Included"
            ? "text-[#715E50]"
            : "text-caramel"
        }`}
      >
        {price}
      </span>

    </button>
  );
};

export default FoodDetailModal;