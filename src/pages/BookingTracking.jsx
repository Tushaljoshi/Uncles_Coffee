import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useLanguage } from "../context/LanguageContext";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "");

const readStoredBooking = () => {
  try {
    return JSON.parse(localStorage.getItem("uncleCoffeeBooking") || "null");
  } catch {
    return null;
  }
};

const formatStatus = (status = "") =>
  status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const getStatusLabel = (status, translations) => {
  const labels = {
    requested: translations.bookingRequested,
    confirmed: translations.reservationConfirmed,
    preparing: translations.preparing,
    ready: translations.readyArrival,
    checked_in: translations.checkedIn,
    completed: translations.completed,
    cancelled: translations.cancelled,
  };
  return labels[status] || formatStatus(status);
};

const BookingTracking = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // =========================================================
  // GET BOOKING DATA
  // =========================================================

  const [bookingCandidate, setBookingCandidate] = useState(
    () => location.state || readStoredBooking() || {}
  );
  const [bookingData, setBookingData] = useState({});
  const candidateBookingId =
    bookingCandidate.bookingId ||
    bookingCandidate.id ||
    bookingCandidate._id ||
    "";
  const candidateMobile = bookingCandidate.customer?.mobile || "";
  const reservation = bookingData.reservation || {};
  const table =
    reservation.table ||
    (typeof reservation.tableId === "object" ? reservation.tableId : {}) ||
    {};
  const tableLabel = table.tableNumber
    ? `Table ${table.tableNumber}`
    : table.tableCode || table.name || "";
  const customer = bookingData.customer || {};
  const bookingFee = Number(
    reservation.bookingFee ??
    reservation.booking_fee ??
    bookingData.bookingFee ??
    bookingData.booking_fee ??
    table.bookingFee ??
    table.booking_fee ??
    0
  );
  const bookingId =
    bookingData.bookingId || bookingData.id || bookingData._id || "";
  const displayBookingId = bookingId
    ? `#${String(bookingId).replace(/^#/, "")}`
    : "";
  const currentStatus = String(bookingData.status || "").toLowerCase();
  const statusHistory = Array.isArray(bookingData.statusHistory)
    ? bookingData.statusHistory
    : [];
  const latestStatusUpdate = statusHistory[statusHistory.length - 1];
  const timelineItems = statusHistory.length
    ? statusHistory
    : currentStatus
      ? [{
          status: currentStatus,
          message: bookingData.statusMessage || "",
          at: bookingData.updatedAt || bookingData.createdAt,
        }]
      : [];
    const hasBooking = Boolean(bookingId);
    const currentStatusLabel = currentStatus
      ? getStatusLabel(currentStatus, t.bookingTracking)
      : "";
    const isTerminalStatus = ["completed", "cancelled"].includes(currentStatus);
  const reservationImageFileId =
    bookingData.imageFileId || reservation.imageFileId;
  const reservationImageUrl = bookingData.imageUrl || bookingData.image;
  const tableImage = reservationImageFileId
    ? API_BASE_URL
      ? `${API_BASE_URL}/api/reservations/file/${encodeURIComponent(reservationImageFileId)}`
      : ""
    : reservationImageUrl
      ? API_BASE_URL
        ? new URL(reservationImageUrl, API_BASE_URL).toString()
        : reservationImageUrl
    : table.imageFileId
      ? API_BASE_URL
        ? `${API_BASE_URL}/api/tables/file/${encodeURIComponent(table.imageFileId)}`
        : ""
      : table.imageUrl || table.image
        ? API_BASE_URL
          ? new URL(table.imageUrl || table.image, API_BASE_URL).toString()
          : table.imageUrl || table.image
        : "";

  // =========================================================
  // CURRENT STATUS
  // =========================================================

  const [activeFilter, setActiveFilter] =
    useState("All");

  const [showCancelPopup, setShowCancelPopup] =
    useState(false);
  const [history, setHistory] = useState([]);
  const [historyMobile, setHistoryMobile] = useState(
    candidateMobile
  );
  const [mobileInput, setMobileInput] = useState(candidateMobile);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [historyRefresh, setHistoryRefresh] = useState(0);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [copiedBooking, setCopiedBooking] = useState(false);
  const [tableImageError, setTableImageError] = useState(false);

  useEffect(() => {
    if (location.state) {
      setBookingCandidate(location.state);
      setBookingData({});
      setHistoryMobile(location.state.customer?.mobile || "");
      setMobileInput(location.state.customer?.mobile || "");
    }
  }, [location.state]);

  useEffect(() => {
    setTableImageError(false);
  }, [tableImage]);

  useEffect(() => {
    const mobile = historyMobile.replace(/\D/g, "");
    if (!mobile) {
      setHistory([]);
      setBookingData({});
      setIsLoadingHistory(false);
      return undefined;
    }
    if (!API_BASE_URL) {
      setHistoryError("VITE_API_BASE_URL is not configured.");
      setIsLoadingHistory(false);
      return undefined;
    }

    const controller = new AbortController();
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setHistoryError("");
      try {
        const endpoint = new URL(`${API_BASE_URL}/api/reservations/history`);
        endpoint.searchParams.set("mobile", mobile);
        const response = await fetch(endpoint, { signal: controller.signal });
        const result = await response.json();
        if (!response.ok || !result.success || !Array.isArray(result.reservations)) {
          throw new Error(
            result.message || `Reservation history request failed (${response.status}).`
          );
        }
        setHistory(result.reservations);
        setLastRefreshed(new Date());
        const currentRecord = result.reservations.find(
          (record) =>
            String(record.bookingId || record.id || record._id || "") ===
            String(candidateBookingId).replace(/^#/, "")
        );
        if (
          currentRecord &&
          candidateBookingId &&
          mobile === String(candidateMobile).replace(/\D/g, "")
        ) {
          setBookingData(currentRecord);
          try {
            localStorage.setItem(
              "uncleCoffeeBooking",
              JSON.stringify(currentRecord)
            );
          } catch {
            setHistoryError("Unable to save the refreshed reservation locally.");
          }
        } else if (candidateBookingId) {
          setBookingData({});
          try {
            const storedBooking = readStoredBooking();
            const storedBookingId =
              storedBooking?.bookingId ||
              storedBooking?.id ||
              storedBooking?._id ||
              "";
            if (
              String(storedBookingId).replace(/^#/, "") ===
              String(candidateBookingId).replace(/^#/, "")
            ) {
              localStorage.removeItem("uncleCoffeeBooking");
            }
          } catch {
            setHistoryError("Unable to clear an unverified reservation from this browser.");
          }
        }
      } catch (requestError) {
        if (requestError.name !== "AbortError") {
          setHistoryError(
            requestError.message || "Unable to load reservation history."
          );
          setHistory([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingHistory(false);
        }
      }
    };

    loadHistory();
    const refreshInterval = window.setInterval(
      () => setHistoryRefresh((value) => value + 1),
      30000
    );
    return () => {
      controller.abort();
      window.clearInterval(refreshInterval);
    };
  }, [
    candidateBookingId,
    candidateMobile,
    historyMobile,
    historyRefresh,
  ]);

  // =========================================================
  // FORMAT TIME
  // =========================================================

  const formattedTime = formatTime(
    reservation.time
  );

  // =========================================================
  // HISTORY DATA
  // =========================================================

  const historyItems = history.map((record) => {
    const historyReservation = record.reservation || {};
    const historyTable =
      typeof historyReservation.tableId === "object"
        ? historyReservation.tableId
        : historyReservation.table || {};
    const status = String(record.status || "").toLowerCase();
    const statusType =
      status === "cancelled"
        ? "cancelled"
        : status === "completed"
          ? "completed"
          : ["requested", "confirmed", "preparing", "ready", "checked_in"].includes(
                status
              )
            ? "upcoming"
            : "unknown";
    const latestUpdate =
      record.statusHistory?.[record.statusHistory.length - 1];

    return {
      id: record.bookingId || record.id || record._id,
      date: formatDate(historyReservation.date),
      table: historyTable.tableNumber
        ? `Table ${historyTable.tableNumber}`
        : historyTable.tableCode ||
          historyTable.name ||
          "Table details unavailable",
      guests: historyReservation.guests || "",
      area: historyTable.location || historyTable.area || "",
      time: formatTime(historyReservation.time),
      status: status ? formatStatus(status) : "Status unavailable",
      statusType,
      description:
        latestUpdate?.message ||
        (status ? formatStatus(status) : "No status update provided."),
      record,
    };
  });
  const filteredHistory =
    activeFilter === "All"
      ? historyItems
      : historyItems.filter((item) => {
          if (activeFilter === "Upcoming") {
            return item.statusType === "upcoming";
          }
          if (activeFilter === "Completed") {
            return item.statusType === "completed";
          }
          if (activeFilter === "Cancelled") {
            return item.statusType === "cancelled";
          }
          return true;
        });
  const historyCounts = historyItems.reduce(
    (counts, item) => {
      counts[item.statusType] = (counts[item.statusType] || 0) + 1;
      return counts;
    },
    {}
  );

  // =========================================================
  // CANCEL BOOKING
  // =========================================================

  const handleCancel = async () => {
    setHistoryError("");
    if (!bookingId || !customer.mobile) {
      setHistoryError("A booking ID and mobile number are required to cancel.");
      return;
    }
    if (!API_BASE_URL) {
      setHistoryError("VITE_API_BASE_URL is not configured.");
      return;
    }

    setIsCancelling(true);
    try {
      const endpoint = `${API_BASE_URL}/api/reservations/${encodeURIComponent(
        String(bookingId).replace(/^#/, "")
      )}/cancel`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: customer.mobile,
          reason: cancelReason.trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok || result.success === false) {
        throw new Error(
          result.message || `Cancellation failed (${response.status}).`
        );
      }

      const returnedRecord =
        result.reservation ||
        result.booking ||
        result.data?.reservation ||
        result.data?.booking ||
        result.data;
      if (returnedRecord?.bookingId || returnedRecord?.id || returnedRecord?._id) {
        setBookingData(returnedRecord);
        try {
          localStorage.setItem(
            "uncleCoffeeBooking",
            JSON.stringify(returnedRecord)
          );
        } catch {
          setHistoryError("Reservation cancelled, but this browser could not save the update locally.");
        }
      }
      setShowCancelPopup(false);
      setHistoryRefresh((value) => value + 1);
    } catch (requestError) {
      setHistoryError(requestError.message || "Unable to cancel this reservation.");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleLookupHistory = () => {
    const mobile = mobileInput.replace(/\D/g, "");
    if (mobile.length < 10) {
      setHistoryError("Enter a valid 10-digit mobile number.");
      return;
    }
    setHistoryError("");
    setHistoryMobile(mobile);
    setHistoryRefresh((value) => value + 1);
  };

  const handleCopyBooking = async () => {
    if (!bookingId) return;
    try {
      await navigator.clipboard.writeText(String(bookingId).replace(/^#/, ""));
      setCopiedBooking(true);
      window.setTimeout(() => setCopiedBooking(false), 1800);
    } catch {
      setHistoryError("Could not copy the reservation ID. Please copy it manually.");
    }
  };

  // =========================================================
  // MODIFY BOOKING
  // =========================================================

  const handleModify = () => {
    navigate("/bookings/tables", {
      state: {
        date: reservation.date,
        guests: reservation.guests,
        time: reservation.time,
      },
    });
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

      <main className="mx-auto max-w-[1240px] px-4 pb-8 pt-7 sm:px-6 sm:pb-10 sm:pt-8 lg:px-8 lg:pb-20">

        {/* ===================================================
            PAGE HEADER
        =================================================== */}

        <section className="mb-6 sm:mb-10">

          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-caramel" />

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.16em]
                    text-caramel
                  "
                >
                    {hasBooking ? "RESERVATION DETAILS" : "BOOKING HISTORY"}
                </p>

              </div>

              <h1
                className="
                  font-serif
                  text-[36px]
                  leading-none
                  tracking-[-0.04em]
                  text-espresso
                  sm:text-[46px]
                "
              >
                {t.bookingTracking.pageTitle}
              </h1>

              <p className="mt-3 max-w-[650px] text-[13px] text-[#67564A]">
                {t.bookingTracking.pageIntro}
              </p>

            </div>

            {/* Booking credentials */}

            {hasBooking && (
            <div
              className="
                flex
                flex-col
                gap-2
                rounded-2xl
                bg-[#F5F0E8]
                p-2
                sm:flex-row
              "
            >

              <div
                className="
                  flex
                  min-w-0
                  sm:min-w-[150px]
                  items-center
                  gap-3
                  rounded-xl
                  bg-white
                  px-4
                  py-3
                "
              >
                <span className="text-[16px] text-caramel">
                  #
                </span>

                <div>

                  <p className="text-[8px] uppercase tracking-wider text-[#8B7B6E]">
                    {t.bookingTracking.bookingId}
                  </p>

                  <p className="text-[11px] font-semibold text-espresso">
                    {displayBookingId || "—"}
                  </p>

                </div>

              </div>

              <div
                className="
                  flex
                  min-w-0
                  sm:min-w-[175px]
                  items-center
                  gap-3
                  rounded-xl
                  bg-white
                  px-4
                  py-3
                "
              >
                <span className="text-[15px] text-caramel">
                  ♧
                </span>

                <div>

                  <p className="text-[8px] uppercase tracking-wider text-[#8B7B6E]">
                    {t.bookingTracking.phone}
                  </p>

                  <p className="text-[11px] font-semibold text-espresso">
                    {customer.mobile
                      ? `+91 ${formatPhone(customer.mobile)}`
                      : "—"}
                  </p>

                </div>

              </div>

            </div>
            )}

          </div>

        </section>

        {/* ===================================================
            ACTIVE BOOKING GRID
        =================================================== */}

        {hasBooking ? (
        <section className="grid min-w-0 gap-5 sm:gap-7 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.9fr)]">

          {/* =================================================
              LEFT TRACKING CARD
          ================================================= */}

          <div
            className="
              rounded-[24px]
              border
              border-[#E8DED1]
              bg-[#F6F0E7]
              p-5
              shadow-[0_8px_25px_rgba(61,35,20,0.06)]
              sm:p-7
            "
          >

            {/* Active heading */}

            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p
                  className="
                    text-[9px]
                    font-semibold
                    uppercase
                    tracking-[0.15em]
                    text-caramel
                  "
                >
                  {t.bookingTracking.activeBooking}
                </p>

                <div className="mt-2 flex flex-wrap items-baseline gap-2">

                  <h2 className="font-serif text-[27px] text-espresso">
                    {displayBookingId || "—"}
                  </h2>

                  {(table.area || table.location) && (
                    <span className="text-[11px] text-[#79685C]">
                      • {table.area || table.location}
                    </span>
                  )}

                </div>

              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex w-fit items-center gap-2 rounded-full bg-[#F1DCCF] px-4 py-2 text-[9px] font-semibold text-caramel">
                  <span className="h-2 w-2 rounded-full bg-caramel" />
                  {currentStatusLabel || "Status unavailable"}
                </div>
                <button
                  type="button"
                  onClick={() => setHistoryRefresh((value) => value + 1)}
                  disabled={isLoadingHistory}
                  className="rounded-full border border-[#E4D7CA] bg-white px-4 py-2 text-[9px] font-semibold text-espresso transition hover:bg-[#F7F1E9] disabled:opacity-50"
                >
                  {isLoadingHistory ? "Refreshing…" : "Refresh"}
                </button>
                <button
                  type="button"
                  onClick={handleCopyBooking}
                  className="rounded-full border border-[#E4D7CA] bg-white px-4 py-2 text-[9px] font-semibold text-espresso transition hover:bg-[#F7F1E9]"
                >
                  {copiedBooking ? "Copied" : "Copy ID"}
                </button>
              </div>

            </div>
            {lastRefreshed && (
              <p className="-mt-3 mb-4 text-[9px] text-[#806F61]" aria-live="polite">
                Last updated {lastRefreshed.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}

            {/* =================================================
                READY TIME
            ================================================= */}

            <div
              className="
                mb-5
                flex
                items-start
                gap-4
                rounded-2xl
                border
                border-[#E8DDD1]
                bg-white
                p-4
                sm:mb-7
                sm:p-5
              "
            >

              <div
                className="
                  flex
                  h-11
                  w-11
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-[#F5E0CA]
                  text-[21px]
                  text-caramel
                "
              >
                ◷
              </div>

              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <p className="text-[11px] font-semibold text-espresso">
                    {t.bookingTracking.readyBy}{" "}
                    {bookingData.estimatedReadyAt
                      ? formatDateTime(bookingData.estimatedReadyAt)
                      : "—"}
                  </p>

                  <span
                    className="
                      rounded-full
                      bg-[#FAD9CC]
                      px-2
                      py-1
                      text-[7px]
                      font-semibold
                      text-caramel
                    "
                  >
                    {bookingData.estimatedReadyAt ? "ESTIMATE" : currentStatusLabel}
                  </span>

                </div>

                <p className="mt-1 text-[10px] leading-4 text-[#705E51]">
                  {latestStatusUpdate?.message ||
                    (statusHistory.length
                      ? "No additional status note."
                      : "No status note has been provided.")}
                </p>

              </div>

            </div>

            {/* =================================================
                PROGRESS
            ================================================= */}

            <div className="relative">

              {/* Vertical line */}

              <div
                className="
                  absolute
                  left-[15px]
                  top-4
                  w-px
                  bg-[#D9CEC2]
                "
                style={{
                  height: `${Math.max(0, timelineItems.length - 1) * 64}px`,
                }}
              />

              {timelineItems.length === 0 && (
                <p className="rounded-xl border border-dashed border-[#D9CEC2] bg-white/70 p-4 text-xs text-[#705E51]">
                  No status updates have been received yet.
                </p>
              )}

              {timelineItems.map((item, index) => {
                const status = String(item.status || "").toLowerCase();
                const completed = index < timelineItems.length - 1;
                const active = index === timelineItems.length - 1;

                return (
                  <TimelineItem
                    key={item.id || `${status}-${item.at || index}`}
                    number={completed ? "✓" : active ? "✦" : ""}
                    title={getStatusLabel(status, t.bookingTracking)}
                    description={item.message || getStatusLabel(status, t.bookingTracking)}
                    time={item.at ? formatDateTime(item.at) : "—"}
                    completed={completed}
                    active={active}
                    last={index === timelineItems.length - 1}
                  />
                );
              })}

            </div>

            {/* =================================================
                BOOKING SUMMARY
            ================================================= */}

            <div
              className="
                mt-5
                grid
                grid-cols-2
                gap-5
                rounded-2xl
                bg-white
                p-4
                sm:grid-cols-4
                sm:p-5
              "
            >

              <Summary
                label="SEATING"
                value={tableLabel || "—"}
              />

              <Summary
                label="PARTY SIZE"
                value={
                  reservation.guests
                    ? `${reservation.guests} Guests`
                    : "—"
                }
              />

              <Summary
                label="SCHEDULE"
                value={formattedTime}
              />

              <Summary
                label="ATMOSPHERE"
                value={
                  table.location || table.area || "—"
                }
              />

              {bookingFee > 0 && (
                <Summary
                  label="BOOKING FEE"
                  value={`₹${bookingFee}`}
                />
              )}

            </div>

            {/* =================================================
                ACTION BUTTONS
            ================================================= */}

            <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto]">

              <button
                type="button"
                onClick={handleModify}
                className="
                  flex
                  items-center
                  justify-center
                  gap-2
                  rounded-full
                  bg-[#EAE5DE]
                  px-4
                  py-3
                  text-[10px]
                  font-medium
                  text-espresso
                  transition
                  hover:bg-latte
                "
              >
                <span>▣</span>
                {t.bookingTracking.modify}
              </button>

              <button
                type="button"
                disabled={!bookingId || !customer.mobile || isTerminalStatus}
                onClick={() => setShowCancelPopup(true)}
                className="
                  rounded-full
                  bg-[#FADAD5]
                  px-5
                  py-3
                  text-[10px]
                  font-medium
                  text-error
                  transition
                  hover:bg-[#F5C8C1]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                ⊗ {t.bookingTracking.cancel}
              </button>

            </div>

          </div>

          {/* =================================================
              RIGHT SIDE
          ================================================= */}

          <aside>

            {/* =================================================
                TABLE PREVIEW
            ================================================= */}

            <div
              className="
                overflow-hidden
                rounded-[24px]
                bg-white
                shadow-[0_8px_25px_rgba(61,35,20,0.06)]
              "
            >

              <div className="relative h-[230px] overflow-hidden bg-[#E4D8CA]">

                {tableImage && !tableImageError ? (
                  <img
                    src={tableImage}
                    alt={table.name || table.tableCode || "Reserved table"}
                    className="h-full w-full object-cover"
                      onError={() => setTableImageError(true)}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#EFE6DB] to-[#DCCBBC] text-sm font-medium text-[#715E50]">
                    No table photo available
                  </div>
                )}

                <span
                  className="
                    absolute
                    left-4
                    top-4
                    rounded-full
                    bg-white/95
                    px-3
                    py-2
                    text-[8px]
                    font-semibold
                    text-espresso
                    shadow-sm
                  "
                >
                  {t.bookingTracking.preview}
                </span>

              </div>

              <div className="p-5">

                <div className="flex items-start justify-between gap-3">

                  <h3 className="font-serif text-[23px] leading-tight text-espresso">
                    {table.name ||
                      table.tableCode ||
                      (table.tableNumber
                        ? `Table ${table.tableNumber}`
                        : "Table details unavailable")}
                  </h3>

                  {table.capacity && (
                    <span className="whitespace-nowrap rounded-full bg-[#F5F0E8] px-3 py-1.5 text-[8px] font-bold uppercase text-caramel">
                      {table.capacity} seats
                    </span>
                  )}

                </div>

                <p className="mt-2 text-[10px] leading-5 text-[#69584C]">
                  {table.location || table.area || "Table details unavailable."}
                  {table.capacity ? ` • Seats up to ${table.capacity}` : ""}
                </p>

                <div className="mt-4 flex flex-wrap gap-4 text-[8px] font-medium text-[#6C5A4D]">
                  {[...(table.features || []), ...(table.amenities || [])]
                    .slice(0, 4)
                    .map((feature) => (
                      <span key={feature}>{feature}</span>
                    ))}

                </div>

              </div>

            </div>

          </aside>

        </section>
        ) : (
          <section className="overflow-hidden rounded-[28px] border border-[#E8DED1] bg-gradient-to-br from-white to-[#F5F0E8] px-6 py-12 text-center shadow-[0_12px_35px_rgba(61,35,20,0.07)] sm:px-12 sm:py-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2E5D9] text-2xl text-caramel">
              ◷
            </div>
            <h2 className="mt-5 font-serif text-3xl text-espresso">
              No reservation selected
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#6F5E52]">
              Look up a reservation using the mobile number attached to it, or start a new booking.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() =>
                  document.getElementById("reservation-history-mobile")?.focus()
                }
                className="rounded-full bg-caramel px-6 py-3 text-sm font-semibold text-cream transition hover:bg-caramelHover"
              >
                Find my reservation
              </button>
              <button
                type="button"
                onClick={() => navigate("/bookings")}
                className="rounded-full border border-[#E5D8CA] bg-white px-6 py-3 text-sm font-semibold text-espresso transition hover:bg-[#F7F1E9]"
              >
                Book a table
              </button>
            </div>
          </section>
        )}

        {/* ===================================================
            RESERVATION HISTORY
        =================================================== */}

        <section className="mt-10 sm:mt-20">

          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

            <div>

              <h2
                className="
                  font-serif
                  text-[30px]
                  tracking-[-0.03em]
                  text-espresso
                  sm:text-[36px]
                "
              >
                {t.bookingTracking.history}
              </h2>

              <p className="mt-2 text-[11px] text-[#6F5E52]">
                {t.bookingTracking.historyIntro}
              </p>

            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <label>
                <span className="sr-only">Mobile number for reservation history</span>
                <input
                  id="reservation-history-mobile"
                  type="tel"
                  inputMode="numeric"
                  value={mobileInput}
                  onChange={(event) =>
                    setMobileInput(
                      event.target.value.replace(/\D/g, "").slice(0, 10)
                    )
                  }
                  placeholder="10-digit mobile number"
                  disabled={isLoadingHistory}
                  className="w-full rounded-full border border-[#E8DED0] bg-white px-4 py-2.5 text-[10px] text-espresso outline-none focus:border-caramel sm:w-48"
                />
              </label>
              <button
                type="button"
                onClick={handleLookupHistory}
                disabled={isLoadingHistory || mobileInput.replace(/\D/g, "").length < 10}
                className="rounded-full bg-caramel px-4 py-2.5 text-[10px] font-semibold text-cream transition hover:bg-caramelHover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoadingHistory ? "Loading…" : "Find reservations"}
              </button>
            </div>

            {/* Filters */}

            <div
              className="
                flex
                w-fit
                flex-wrap
                rounded-full
                bg-[#F0EBE4]
                p-1
              "
            >

              {[
                "All",
                "Upcoming",
                "Completed",
                "Cancelled",
              ].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() =>
                    setActiveFilter(filter)
                  }
                  className={`
                    rounded-full
                    px-4
                    py-2
                    text-[9px]
                    font-medium
                    transition
                    ${
                      activeFilter === filter
                        ? "bg-caramel text-cream"
                        : "text-[#68574B] hover:bg-white"
                    }
                  `}
                >
                  {filter === "All"
                    ? t.bookingTracking.all
                    : filter === "Upcoming"
                    ? t.bookingTracking.upcoming
                    : filter === "Completed"
                    ? t.bookingTracking.completed
                    : t.bookingTracking.cancelled}
                  {filter === "Upcoming" &&
                    ` (${historyCounts.upcoming || 0})`}
                  {filter === "Completed" &&
                    ` (${historyCounts.completed || 0})`}
                  {filter === "Cancelled" &&
                    ` (${historyCounts.cancelled || 0})`}
                </button>
              ))}

            </div>

          </div>

          {/* History Cards */}

          <div className="grid gap-4 lg:grid-cols-2">

            {historyError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 lg:col-span-2">
                {historyError}
              </p>
            )}
            {isLoadingHistory && (
              <p className="rounded-xl bg-white p-4 text-sm text-[#6F5E52] lg:col-span-2">
                Loading reservation history...
              </p>
            )}
            {!isLoadingHistory && !historyError && filteredHistory.length === 0 && (
              <p className="rounded-xl bg-white p-4 text-sm text-[#6F5E52] lg:col-span-2">
                {historyMobile
                  ? "No reservations found for this mobile number."
                  : "Enter the mobile number used for your reservation to see its status and history."}
              </p>
            )}

            {!isLoadingHistory && filteredHistory.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onTrack={() =>
                  navigate("/bookings/tracking", {
                    state: item.record,
                  })
                }
                onBookAgain={() =>
                  navigate("/bookings")
                }
              />
            ))}

          </div>

        </section>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer
        className="
          border-t
          border-[#E8DED0]
          bg-[#F5F0E8]
        "
      >

        <div
          className="
            mx-auto
            flex
            max-w-[1240px]
            flex-col
            gap-4
            px-4
            py-6
            pb-28
            sm:px-6
            sm:pb-32
            lg:flex-row
            lg:items-center
            lg:justify-between
            lg:px-8
            lg:pb-9
          "
        >

          <div>

            <p className="font-serif text-[18px] text-espresso">
              Uncle&apos;s Coffee
            </p>

            <p className="mt-2 text-[10px] text-[#6F5D50]">
              Reservation information and status updates for your booking.
            </p>

          </div>

          <div
            className="
              flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-[#EFEAE3]
              px-4
              py-2
              text-[9px]
              font-medium
            "
          >
            <span className="h-2 w-2 rounded-full bg-caramel" />
            {bookingId
              ? `Reservation ${displayBookingId} • ${currentStatusLabel}`
              : "Reservation tracking"}
          </div>

        </div>

      </footer>

      {showCancelPopup && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#3D2314]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-booking-title"
        >
          <div className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-[#E5DBCF] bg-white p-6 shadow-[0_20px_60px_rgba(61,35,20,0.2)] sm:max-h-none sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FADAD5] text-xl text-error">
                !
              </div>

              <div>
                <h2 id="cancel-booking-title" className="font-serif text-[25px] text-espresso">
                  {t.bookingTracking.cancelTitle}
                </h2>
                <p className="mt-2 text-[11px] leading-5 text-[#67564A]">
                  {tableLabel
                    ? `Your reservation for ${tableLabel} will be cancelled and the table will be released.`
                    : "Your reservation will be cancelled and the table will be released."}
                </p>
              </div>
            </div>

            <label className="mt-5 block">
              <span className="mb-2 block text-[10px] font-medium text-espresso">
                Cancellation reason
              </span>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(event) => setCancelReason(event.target.value)}
                className="w-full resize-none rounded-xl border border-[#E8DED0] bg-[#F6F1E9] p-3 text-[11px] text-espresso outline-none focus:border-caramel"
              />
            </label>

            {historyError && (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-[10px] text-red-800">
                {historyError}
              </p>
            )}

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCancelPopup(false)}
                className="rounded-full bg-[#EFEAE3] px-5 py-3 text-[10px] font-medium text-espresso transition hover:bg-latte"
              >
                {t.bookingTracking.keepReservation}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isCancelling || !cancelReason.trim()}
                className="rounded-full bg-error px-5 py-3 text-[10px] font-semibold text-white transition hover:opacity-90"
              >
                {isCancelling ? "Cancelling..." : t.bookingTracking.yesCancel}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};


/* ===========================================================
   TIMELINE ITEM
=========================================================== */

const TimelineItem = ({
  number,
  title,
  description,
  time,
  completed = false,
  active = false,
  last = false,
}) => {
  return (
    <div className="relative mb-5 flex gap-4">

      {/* Circle */}

      <div
        className={`
          relative
          z-10
          flex
          h-8
          w-8
          shrink-0
          items-center
          justify-center
          rounded-full
          text-[12px]
          font-semibold
          ${
            completed
              ? "bg-caramel text-cream"
              : active
              ? "bg-caramel text-cream ring-4 ring-[#F0DCCE]"
              : "bg-[#E3DDD6] text-[#A59A90]"
          }
        `}
      >
        {number}
      </div>

      {/* Content */}

      <div
        className={`
          min-w-0
          flex-1
          rounded-xl
          ${
            active
              ? "bg-[#F1EBE3] p-3"
              : "px-0 py-1"
          }
        `}
      >

        <div className="flex items-start justify-between gap-4">

          <div>

            <div className="flex flex-wrap items-center gap-2">

              <h3
                className={`
                  font-serif
                  text-[16px]
                  ${
                    active
                      ? "text-caramel"
                      : completed
                      ? "text-espresso"
                      : "text-[#87796E]"
                  }
                `}
              >
                {title}
              </h3>

              {active && (
                <span
                  className="
                    rounded-full
                    bg-caramel
                    px-2
                    py-1
                    text-[7px]
                    font-bold
                    uppercase
                    text-cream
                  "
                >
                  In Progress
                </span>
              )}

            </div>

            <p
              className={`
                mt-1
                text-[10px]
                leading-4
                ${
                  active || completed
                    ? "text-[#68574A]"
                    : "text-[#A1958B]"
                }
              `}
            >
              {description}
            </p>

          </div>

          <span
            className={`
              shrink-0
              text-[8px]
              font-semibold
              ${
                active
                  ? "text-caramel"
                  : "text-[#8A7A6F]"
              }
            `}
          >
            {time}
          </span>

        </div>

      </div>

    </div>
  );
};


/* ===========================================================
   SUMMARY
=========================================================== */

const Summary = ({
  label,
  value,
}) => {
  return (
    <div>

      <p
        className="
          text-[7px]
          font-semibold
          uppercase
          tracking-[0.1em]
          text-[#88786B]
        "
      >
        {label}
      </p>

      <p className="mt-1 font-serif text-[14px] text-espresso">
        {value}
      </p>

    </div>
  );
};


/* ===========================================================
   HISTORY CARD
=========================================================== */

const HistoryCard = ({
  item,
  onTrack,
  onBookAgain,
}) => {
  return (
    <div
      className="
        overflow-hidden
        rounded-2xl
        border
        border-[#E8DED1]
        bg-white
        shadow-[0_4px_15px_rgba(61,35,20,0.04)]
      "
    >

      <div className="flex gap-4 p-5">

        {/* Icon */}

        <div
          className={`
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${
              item.statusType ===
              "upcoming"
                ? "bg-[#F8D6C7] text-caramel"
                : "bg-[#ECE9E3] text-[#81766C]"
            }
          `}
        >
          {item.statusType === "upcoming"
            ? "▱"
            : item.statusType === "completed"
              ? "✓"
              : item.statusType === "cancelled"
                ? "×"
                : "—"}
        </div>

        {/* Main */}

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-start justify-between gap-3">

            <div>

              <div className="flex items-center gap-2">

                <h3 className="font-serif text-[17px] text-espresso">
                  #{String(item.id).replace(/^#/, "")}
                </h3>

                <span
                  className="
                    rounded-full
                    bg-[#F1ECE5]
                    px-2
                    py-1
                    text-[7px]
                    font-medium
                    text-[#77685C]
                  "
                >
                  {item.date}
                </span>

              </div>

              <p className="mt-1 text-[9px] text-[#6E5D51]">
                {item.table} •{" "}
                {item.guests} Guests •{" "}
                {item.area}
              </p>

              <p className="mt-1 text-[10px] font-semibold text-caramel">
                {item.date} • {item.time}
              </p>

            </div>

            <span
              className={`
                rounded-full
                px-3
                py-1.5
                text-[8px]
                font-semibold
                ${
                  item.statusType ===
                  "upcoming"
                    ? "bg-caramel text-cream"
                    : "bg-[#EEEAE4] text-[#766A60]"
                }
              `}
            >
              {item.status}
            </span>

          </div>

        </div>

      </div>

      {/* Bottom */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-[#EEE7DF]
          bg-[#FCFAF7]
          px-5
          py-3
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <p className="text-[9px] text-[#77675B]">
          ◷ {item.description}
        </p>

        {item.statusType === "upcoming" ? (
          <button
            type="button"
            onClick={onTrack}
            className="
              text-left
              text-[9px]
              font-semibold
              text-caramel
              hover:underline
            "
          >
            View Tracking →
          </button>
        ) : ["completed", "cancelled"].includes(item.statusType) ? (
          <button
            type="button"
            onClick={onBookAgain}
            className="
              rounded-full
              bg-[#ECE8E1]
              px-4
              py-2
              text-[9px]
              font-medium
              text-espresso
              transition
              hover:bg-latte
            "
          >
            ↻ Book Again
          </button>
        ) : null}

      </div>

    </div>
  );
};


/* ===========================================================
   HELPERS
=========================================================== */

const formatDate = (value) => {
  if (!value) return "";

  const date = new Date(
    `${value}T00:00:00`
  );

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );
};


const formatTime = (value) => {
  if (!value) return "";

  const [hourString, minute] =
    value.split(":");

  let hour = Number(hourString);

  const period =
    hour >= 12 ? "PM" : "AM";

  hour = hour % 12 || 12;

  return `${hour}:${minute} ${period}`;
};


const formatPhone = (value) => {
  if (!value) return "—";

  const numbers = value
    .toString()
    .replace(/\D/g, "");

  if (numbers.length === 10) {
    return `${numbers.slice(
      0,
      5
    )} ${numbers.slice(5)}`;
  }

  return value;
};

const formatDateTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};


export default BookingTracking;