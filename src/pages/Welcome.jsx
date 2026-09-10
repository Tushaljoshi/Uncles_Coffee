import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const Welcome = () => {
  const { t } = useLanguage();
  const [tableNumber, setTableNumber] = useState("12");
  const [tableEditing, setTableEditing] = useState(false);
  const [customerName, setCustomerName] = useState("Tushal");
  const [guests, setGuests] = useState("2");
  const [note, setNote] = useState(
    "Please make the cappuccino extra hot, less sugar..."
  );

  const handleViewMenu = () => {
    if (!tableNumber.trim()) {
      alert("Please enter your table number.");
      return;
    }

    if (!customerName.trim()) {
      alert("Please enter your name.");
      return;
    }

    console.log({
      tableNumber,
      customerName,
      guests,
      note,
    });

    // Later:
    // navigate("/menu");
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
                  Live Barista Bar
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
              <div className="relative mt-7 overflow-hidden rounded-[18px] shadow-[0_14px_35px_rgba(61,35,20,0.12)]">
                <img
                  src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=85"
                  alt="Coffee served inside a warm modern cafe"
                  className="h-[280px] w-full object-cover sm:h-[390px]"
                />

                {/* Image Overlay */}
                <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3 sm:inset-x-4 sm:bottom-4 sm:gap-4">
                  {/* Coffee Information */}
                  <div className="max-w-[calc(100%-8px)] rounded-2xl bg-cream/95 p-3 shadow-lg backdrop-blur-sm sm:max-w-[310px] sm:p-4">
                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-caramel">
                      Today's Single Origin
                    </p>

                    <h3 className="mt-1 font-serif text-lg leading-tight text-espresso sm:text-xl">
                      Ethiopia Yirgacheffe
                    </h3>

                    <p className="mt-1 text-[11px] leading-4 text-[#624B3D] sm:text-xs sm:leading-5">
                      Notes of bergamot, peach blossoms & wild honey
                    </p>
                  </div>

                  {/* Barista Status */}
                  <div className="hidden items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-xs font-medium text-espresso shadow-lg sm:flex">
                    <span className="text-caramel">☕</span>
                    Barista Station Ready
                  </div>
                </div>
              </div>

              {/* ================= FEATURE CARDS ================= */}
              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <FeatureCard
                  icon="⌗"
                  title="Scan & Order"
                  description="Ready in 30 seconds"
                />

                <FeatureCard
                  icon="☕"
                  title="Live Updates"
                  description="Direct kitchen status"
                />

                <FeatureCard
                  icon="▣"
                  title="Flexible Pay"
                  description="At table or counter"
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
                      {t.welcome.table} {tableNumber}
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

                {/* Table */}
                <div className="mt-6">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-espresso">
                      {t.welcome.table} Assignment
                    </label>

                    <span className="text-[10px] font-semibold text-caramel">
                      ● Verified QR
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5">
                    <span className="text-lg text-caramel">▱</span>

                    {tableEditing ? (
                      <input
                        type="text"
                        value={tableNumber}
                        onChange={(event) =>
                          setTableNumber(event.target.value)
                        }
                        placeholder="12"
                        aria-label={t.welcome.table}
                        autoFocus
                        className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-espresso outline-none placeholder:text-[#A89788]"
                      />
                    ) : (
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-espresso">
                        {t.welcome.table} {tableNumber || "-"}
                      </span>
                    )}

                    <button
                      type="button"
                      className="text-xs font-semibold text-caramel underline underline-offset-2"
                      onClick={() => {
                        if (tableEditing && !tableNumber.trim()) {
                          setTableNumber("12");
                        }
                        setTableEditing((editing) => !editing);
                      }}
                    >
                      {tableEditing ? t.common.save : t.common.edit}
                    </button>
                  </div>
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
                      For your server
                    </span>
                  </div>

                  <div className="flex items-center gap-3 rounded-xl bg-white px-4 py-3.5">
                    <span className="text-lg text-caramel">♙</span>

                    <input
                      id="customerName"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
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

                  <p className="mt-2 text-[11px] leading-5 text-[#715E50]">
                    ♡ Oat milk, almond milk, and decaf available on menu.
                  </p>
                </div>

                {/* Guests */}
                <div className="mt-5">
                  <label className="mb-2 block text-xs font-medium text-espresso">
                    {t.welcome.guests}
                  </label>

                  <div className="grid grid-cols-4 gap-2">
                    {["1", "2", "3", "4+"].map((number) => (
                      <button
                        key={number}
                        type="button"
                        onClick={() => setGuests(number)}
                        className={`rounded-lg py-2.5 text-xs font-medium transition ${
                          guests === number
                            ? "bg-caramel text-cream"
                            : "bg-white text-espresso hover:bg-latte"
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  type="button"
                  onClick={handleViewMenu}
                  className="mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-caramel px-6 py-4 text-sm font-semibold text-cream shadow-sm transition hover:bg-caramelHover hover:shadow-md active:scale-[0.99]"
                >
                  {t.welcome.viewMenu}

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
                  Need assistance? Wave to our floor team or notify baristas
                  via tracking screen.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SEASONAL MENU ================= */}
        <section className="border-t border-[#EEE5D9] bg-[#FBF8F2]">
          <div className="mx-auto max-w-[1240px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8">

            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-caramel">
                  Seasonal Morning Craft
                </p>

                <h2 className="mt-1 font-serif text-[26px] text-espresso sm:text-[30px]">
                  Fresh from the bakehouse & roaster
                </h2>
              </div>

              <a
                href="/menu"
                className="text-xs font-semibold text-caramel transition hover:text-caramelHover"
              >
                Browse full seasonal card →
              </a>
            </div>

            {/* Seasonal Cards */}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <SeasonalCard
                image="https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=80"
                title="Butter Croissant"
                description="72-hour cultured Normandy butter..."
                price="$4.50"
                tag="Warmly Baked"
              />

              <SeasonalCard
                image="https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=400&q=80"
                title="Avocado Tartine"
                description="Heritage sourdough, Meyer lemon..."
                price="$12.00"
                tag="Chef Selection"
              />

              <SeasonalCard
                image="https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=400&q=80"
                title="Slow Bar Chemex"
                description="Colombian Geisha, clean tea-like..."
                price="$6.50"
                tag="Filter Roast"
              />
            </div>
          </div>
        </section>
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-[#E8DED0] bg-[#F5F0E8]">
        <div className="mx-auto flex max-w-[1240px] flex-col justify-between gap-3 px-4 py-6 pb-28 text-xs text-[#624B3D] sm:px-6 sm:py-7 sm:pb-32 lg:flex-row lg:items-center lg:px-8 lg:pb-7">
          <p className="font-serif text-sm">
            Uncle's Coffee — Artisanal roastery & slow bar.
          </p>

          <div className="flex items-center gap-5">
            <span>Table-side ordering service</span>

            <span className="font-medium text-caramel">
              Table {tableNumber} Active
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
   SEASONAL CARD
========================================================= */

const SeasonalCard = ({
  image,
  title,
  description,
  price,
  tag,
}) => {
  return (
    <article className="flex items-center gap-3 rounded-2xl bg-[#F4F0E8] p-3 transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={image}
        alt={title}
        className="h-[78px] w-[78px] shrink-0 rounded-xl object-cover"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-[18px] leading-tight text-espresso">
            {title}
          </h3>

          <span className="shrink-0 text-sm font-semibold text-caramel">
            {price}
          </span>
        </div>

        <p className="mt-1 truncate text-xs text-[#715E50]">
          {description}
        </p>

        <span className="mt-2 inline-flex rounded-full bg-[#EEE7DD] px-2 py-1 text-[8px] font-semibold uppercase tracking-[0.08em] text-caramel">
          {tag}
        </span>
      </div>
    </article>
  );
};

export default Welcome;