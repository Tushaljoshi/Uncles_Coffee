import React, { useEffect, useState, useMemo } from "react";
import {
  Search,
  X,
  RefreshCw,
  Car,
  User,
  Wrench,
  MapPin,
  Calendar,
  Clock,
  Phone,
  ChevronRight,
  AlertCircle,
  CreditCard,
  Star,
  Image as ImageIcon,
  ClipboardList,
} from "lucide-react";
import TopBar from "../components/TopBar.jsx";
import Sidebar from "../components/Sidebar.jsx";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const STATUS_OPTIONS = [
  { value: "all", label: "All Status" },
  { value: "searching", label: "Searching" },
  { value: "declined", label: "Declined" },
  { value: "assigned", label: "Assigned" },
  { value: "arrived", label: "Arrived" },
  { value: "inspection_started", label: "Inspection Started" },
  { value: "waiting_for_approval", label: "Waiting for Approval" },
  { value: "approved", label: "Approved" },
  { value: "work_in_progress", label: "Work in Progress" },
  { value: "work_done", label: "Work Done" },
];

const BOOKING_TYPE_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "instant", label: "Instant" },
  { value: "schedule", label: "Scheduled" },
  { value: "emergency", label: "Emergency" },
];

const EMPTY = "Not available";

const formatStatus = (status) =>
  (status || "unknown")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatBookingType = (type) => {
  const map = { instant: "Instant", schedule: "Scheduled", emergency: "Emergency (SOS)" };
  return map[type] || formatStatus(type);
};

const formatLocationType = (type) => {
  const map = { home: "Home", current_location: "Current Location", workshop: "Workshop" };
  return map[type] || formatStatus(type);
};

const formatPaymentStatus = (status) => {
  const map = { paid: "Paid", pending: "Pending", failed: "Failed", refunded: "Refunded" };
  return map[status] || formatStatus(status);
};

const hasValue = (v) => v != null && v !== "" && String(v).trim() !== "";

const displayText = (v) => {
  if (!hasValue(v)) return EMPTY;
  if (typeof v === "object") return EMPTY;
  return String(v).trim();
};

const cleanMultiline = (text) => {
  if (!hasValue(text)) return "";
  return String(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
};

const formatCurrency = (amount) => {
  if (amount == null || amount === "") return EMPTY;
  const n = Number(amount);
  if (Number.isNaN(n)) return EMPTY;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
};

const formatPhone = (phone) => {
  if (!hasValue(phone)) return EMPTY;
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  return phone;
};

const formatDate = (iso) => {
  if (!hasValue(iso)) return EMPTY;
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return displayText(iso);
    return d.toLocaleString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return displayText(iso);
  }
};

const formatBookingDate = (dateStr) => {
  if (!hasValue(dateStr)) return EMPTY;
  try {
    const d = new Date(`${dateStr}T12:00:00`);
    if (Number.isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-IN", {
      weekday: "short",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
};

const formatTimeSlot = (slot) => {
  if (!slot?.from) return EMPTY;
  const to = slot.to ? ` – ${slot.to}` : "";
  return `${slot.from}${to}`;
};

const formatCoordinates = (lat, lng) => {
  if (lat == null || lng == null) return EMPTY;
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
};

const formatDistance = (km) => {
  if (km == null || km === "") return EMPTY;
  const n = Number(km);
  if (Number.isNaN(n)) return EMPTY;
  return n < 1 ? `${(n * 1000).toFixed(0)} m` : `${n.toFixed(1)} km`;
};

const uniqueNames = (items, key = "name") =>
  [...new Set((items || []).map((i) => i[key]).filter(Boolean))];

const getStatusStyle = (status) => {
  const map = {
    searching: "bg-slate-100 text-slate-700",
    declined: "bg-red-100 text-red-700",
    assigned: "bg-blue-100 text-blue-700",
    arrived: "bg-indigo-100 text-indigo-700",
    inspection_started: "bg-purple-100 text-purple-700",
    waiting_for_approval: "bg-amber-100 text-amber-800",
    approved: "bg-teal-100 text-teal-700",
    work_in_progress: "bg-orange-100 text-orange-800",
    work_done: "bg-green-100 text-green-700",
  };
  return map[status] || "bg-gray-100 text-gray-600";
};

const getBookingTypeStyle = (type) => {
  const map = {
    instant: "bg-blue-50 text-blue-700 border-blue-200",
    schedule: "bg-violet-50 text-violet-700 border-violet-200",
    emergency: "bg-red-50 text-red-700 border-red-200",
  };
  return map[type] || "bg-gray-50 text-gray-600 border-gray-200";
};

const getServiceNames = (booking) => {
  const details = booking.serviceDetails || [];
  if (details.length === 0) {
    if (booking.issueType) return formatStatus(booking.issueType);
    return EMPTY;
  }
  const names = [];
  details.forEach((svc) => {
    if (svc.types?.length) {
      svc.types.forEach((t) => names.push(t.name || svc.name));
    } else if (svc.name) {
      names.push(svc.name);
    }
  });
  return names.length ? names.join(", ") : EMPTY;
};

const getEstimatedCost = (booking) => {
  if (booking.jobSheet?.estimatedCost != null) {
    return formatCurrency(booking.jobSheet.estimatedCost);
  }
  const types = (booking.serviceDetails || []).flatMap((s) => s.types || []);
  const total = types.reduce((sum, t) => sum + (Number(t.price) || 0), 0);
  return total > 0 ? formatCurrency(total) : EMPTY;
};

const SectionCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white border border-gray-200 rounded-xl overflow-hidden ${className}`}>
    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
      {Icon && <Icon size={16} className="text-red-600 flex-shrink-0" />}
      <h4 className="text-sm font-bold text-gray-800">{title}</h4>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

const InfoGrid = ({ items }) => {
  const visible = items.filter((item) => item.show !== false);
  if (visible.length === 0) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {visible.map(({ label, value, fullWidth, mono }) => (
        <div key={label} className={fullWidth ? "sm:col-span-2" : ""}>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-0.5">{label}</p>
          <p
            className={`text-sm text-gray-900 break-words ${mono ? "font-mono text-xs bg-gray-50 px-2 py-1 rounded" : ""} ${
              value === EMPTY ? "text-gray-400 italic" : "font-medium"
            }`}
          >
            {value}
          </p>
        </div>
      ))}
    </div>
  );
};

const StatusBadge = ({ status, styleFn = getStatusStyle }) => (
  <span className={`inline-flex text-xs px-2.5 py-1 rounded-full font-semibold ${styleFn(status)}`}>
    {formatStatus(status)}
  </span>
);

const PersonCard = ({ title, name, phone, image, id, icon: Icon }) => {
  const displayName = hasValue(name) ? name : title === "Customer" ? "Customer (name not set)" : EMPTY;
  const phoneFormatted = formatPhone(phone);
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center">
          <Icon size={14} className="text-red-600" />
        </div>
        <h4 className="text-sm font-bold text-gray-800">{title}</h4>
      </div>
      <div className="flex items-center gap-3">
        {hasValue(image) ? (
          <img src={image} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center border-2 border-white">
            <Icon size={22} className="text-gray-400" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-bold text-gray-900 text-base leading-tight">{displayName}</p>
          {phoneFormatted !== EMPTY ? (
            <a
              href={`tel:${String(phone).replace(/\D/g, "")}`}
              className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1.5 mt-1 font-medium"
            >
              <Phone size={14} /> {phoneFormatted}
            </a>
          ) : (
            <p className="text-xs text-gray-400 italic mt-1">Phone not available</p>
          )}
          {hasValue(id) && (
            <p className="text-[10px] text-gray-500 mt-1.5 font-mono bg-gray-100 px-2 py-0.5 rounded inline-block truncate max-w-full">
              {id}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        size={18}
        className={n <= rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
      />
    ))}
    <span className="ml-2 text-sm font-bold text-gray-800">{rating}/5</span>
  </div>
);

const TicketDetailModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const customer = booking.customer || {};
  const mechanic = booking.mechanic || {};
  const vehicle = booking.vehicle || {};
  const location = booking.location || {};
  const timeSlot = booking.timeSlot || {};
  const dispute = booking.dispute || {};
  const payment = booking.payment || {};
  const feedback = booking.feedback || {};
  const jobSheet = booking.jobSheet || {};
  const tracking = booking.tracking || {};

  const vehicleLabel = [vehicle.brand, vehicle.model || vehicle.vehicleName]
    .filter(Boolean)
    .join(" ")
    .trim() || vehicle.vehicleName || EMPTY;

  const notesText = cleanMultiline(booking.notes || booking.note);
  const equipmentNames = uniqueNames(booking.equipmentDetails);
  const hasJobSheet = jobSheet.estimatedCost != null || hasValue(jobSheet.description);
  const hasPayment = payment.amount != null || hasValue(payment.orderId);
  const paymentStatusStyle = (s) =>
    s === "paid"
      ? "bg-green-100 text-green-800"
      : s === "pending"
        ? "bg-amber-100 text-amber-800"
        : "bg-gray-100 text-gray-600";

  const copyBookingId = () => {
    navigator.clipboard?.writeText(booking.bookingId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-gray-50 rounded-t-3xl sm:rounded-2xl w-full sm:max-w-3xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b bg-white flex items-start justify-between gap-3 flex-shrink-0">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Booking ID</p>
            <button
              type="button"
              onClick={copyBookingId}
              title="Click to copy"
              className="text-xs font-mono text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded mt-0.5 break-all text-left w-full max-w-full"
            >
              {booking.bookingId}
            </button>
            <h2 className="text-lg font-bold text-gray-900 mt-2">Service Ticket</h2>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <StatusBadge status={booking.status} />
              <span
                className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getBookingTypeStyle(booking.bookingType)}`}
              >
                {formatBookingType(booking.bookingType)}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0 border">
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Quick summary */}
        <div className="px-4 sm:px-5 py-3 bg-white border-b grid grid-cols-2 sm:grid-cols-4 gap-3 flex-shrink-0">
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Estimated</p>
            <p className="text-sm font-bold text-red-600">{getEstimatedCost(booking)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Scheduled</p>
            <p className="text-xs font-semibold text-gray-800">{formatBookingDate(booking.bookingDate)}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Vehicle</p>
            <p className="text-xs font-semibold text-gray-800 truncate">{vehicle.registrationNumber || EMPTY}</p>
          </div>
          <div>
            <p className="text-[10px] text-gray-400 uppercase font-semibold">Time slot</p>
            <p className="text-xs font-semibold text-gray-800">{formatTimeSlot(timeSlot)}</p>
          </div>
        </div>

        <div className="overflow-y-auto p-4 sm:p-5 space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <PersonCard
              title="Customer"
              name={customer.name}
              phone={customer.phone}
              image={customer.profileImage}
              id={customer.userId}
              icon={User}
            />
            <PersonCard
              title="Mechanic"
              name={mechanic.fullName}
              phone={mechanic.phone}
              image={mechanic.profilePhoto}
              id={mechanic.mechanicId || booking.mechanicId}
              icon={Wrench}
            />
          </div>

          <SectionCard title="Vehicle & Booking" icon={Car}>
            <InfoGrid
              items={[
                { label: "Vehicle", value: vehicleLabel },
                { label: "Registration No.", value: displayText(vehicle.registrationNumber) },
                { label: "Vehicle Type", value: displayText(vehicle.vehicleType) },
                { label: "Booking Date", value: formatBookingDate(booking.bookingDate) },
                { label: "Time Slot", value: formatTimeSlot(timeSlot) },
                { label: "Created On", value: formatDate(booking.createdAt) },
                { label: "Last Updated", value: formatDate(booking.updatedAt) },
                {
                  label: "Issue / SOS Type",
                  value: formatStatus(booking.issueType || booking.issueDetails?.issueType),
                  show: hasValue(booking.issueType || booking.issueDetails?.issueType),
                },
                {
                  label: "Customer Notes",
                  value: notesText || EMPTY,
                  fullWidth: true,
                  show: hasValue(notesText),
                },
              ]}
            />
          </SectionCard>

          <SectionCard title="Services & Equipment" icon={ClipboardList}>
            {(booking.serviceDetails || []).length === 0 ? (
              <p className="text-sm text-gray-400 italic">
                {booking.issueType
                  ? `Emergency issue: ${formatStatus(booking.issueType)}`
                  : "No service details available"}
              </p>
            ) : (
              <div className="space-y-3">
                {booking.serviceDetails.map((svc) => (
                  <div key={svc.id} className="rounded-lg border border-gray-100 overflow-hidden">
                    <div className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 border-b border-gray-100">
                      {svc.iconUrl && (
                        <img src={svc.iconUrl} alt="" className="w-8 h-8 object-contain" />
                      )}
                      <p className="font-bold text-sm text-gray-900">{svc.name}</p>
                    </div>
                    {(svc.types || []).length > 0 ? (
                      <ul className="divide-y divide-gray-50">
                        {svc.types.map((t) => (
                          <li key={t.id} className="flex items-start gap-3 px-3 py-2.5">
                            {t.imageUrl && (
                              <img src={t.imageUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">{t.name}</p>
                              {hasValue(t.description) && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-3 whitespace-pre-line">
                                  {cleanMultiline(t.description).slice(0, 200)}
                                  {cleanMultiline(t.description).length > 200 ? "…" : ""}
                                </p>
                              )}
                            </div>
                            {t.price != null && (
                              <span className="text-sm font-bold text-red-600 flex-shrink-0">
                                {formatCurrency(t.price)}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="px-3 py-2 text-xs text-gray-400 italic">Category selected — no sub-service</p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {equipmentNames.length > 0 && (
              <div className="mt-4 pt-3 border-t">
                <p className="text-[10px] font-semibold text-gray-400 uppercase mb-2">Equipment Required</p>
                <div className="flex flex-wrap gap-2">
                  {equipmentNames.map((name) => (
                    <span key={name} className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full font-medium">
                      {name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Location & Live Tracking" icon={MapPin}>
            <InfoGrid
              items={[
                { label: "Service Address", value: displayText(location.address), fullWidth: true },
                { label: "Location Type", value: formatLocationType(location.type) },
                {
                  label: "GPS Coordinates",
                  value: formatCoordinates(location.latitude, location.longitude),
                  mono: true,
                  show: location.latitude != null,
                },
                {
                  label: "Distance to Customer",
                  value: formatDistance(tracking.distanceFromCustomerKm),
                  show: tracking.enabled && tracking.distanceFromCustomerKm != null,
                },
                {
                  label: "Mechanic Live Location",
                  value: displayText(tracking.mechanicLocation?.address),
                  fullWidth: true,
                  show: hasValue(tracking.mechanicLocation?.address),
                },
                {
                  label: "Mechanic Last Seen",
                  value: formatDate(tracking.mechanicLocation?.updatedAt),
                  show: hasValue(tracking.mechanicLocation?.updatedAt),
                },
                {
                  label: "Mechanic Online",
                  value: tracking.mechanicLocation?.isOnline ? "Yes" : "No",
                  show: tracking.mechanicLocation?.isOnline != null,
                },
              ]}
            />
          </SectionCard>

          {(booking.jobTimeline || []).length > 0 && (
            <SectionCard title="Job Timeline" icon={Clock}>
              <div className="relative pl-4 border-l-2 border-red-200 space-y-4">
                {booking.jobTimeline.map((step, i) => (
                  <div key={i} className="relative pl-4">
                    <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-red-500 ring-4 ring-white" />
                    <StatusBadge status={step.status} />
                    <p className="text-xs text-gray-500 mt-1.5 font-medium">{formatDate(step.time)}</p>
                    {step.mechanicId && (
                      <p className="text-[10px] text-gray-400 font-mono mt-0.5">Mechanic: {step.mechanicId}</p>
                    )}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {hasJobSheet && (
            <SectionCard title="Job Sheet & Estimate" icon={ClipboardList}>
              {hasValue(jobSheet.description) && (
                <p className="text-sm text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg border">
                  {displayText(jobSheet.description)}
                </p>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Service", amount: jobSheet.serviceCost },
                  { label: "Parts", amount: jobSheet.partsCost },
                  { label: "Labour", amount: jobSheet.labourCharge },
                  { label: "Total", amount: jobSheet.estimatedCost, highlight: true },
                ].map(({ label, amount, highlight }) => (
                  <div
                    key={label}
                    className={`rounded-lg p-3 text-center ${highlight ? "bg-red-50 border border-red-100" : "bg-gray-50 border border-gray-100"}`}
                  >
                    <p className="text-[10px] text-gray-500 uppercase font-semibold">{label}</p>
                    <p className={`text-sm font-bold mt-0.5 ${highlight ? "text-red-600" : "text-gray-800"}`}>
                      {formatCurrency(amount)}
                    </p>
                  </div>
                ))}
              </div>
              {(jobSheet.parts || []).length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 text-gray-600 text-left">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Part</th>
                        <th className="px-3 py-2 font-semibold text-center">Qty</th>
                        <th className="px-3 py-2 font-semibold text-right">Unit Price</th>
                        <th className="px-3 py-2 font-semibold text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {jobSheet.parts.map((p) => {
                        const qty = Number(p.qty) || 1;
                        const price = Number(p.price) || 0;
                        return (
                          <tr key={p.id} className="text-gray-800">
                            <td className="px-3 py-2 font-medium">{p.name}</td>
                            <td className="px-3 py-2 text-center">{qty}</td>
                            <td className="px-3 py-2 text-right">{formatCurrency(price)}</td>
                            <td className="px-3 py-2 text-right font-semibold">{formatCurrency(qty * price)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
              {(jobSheet.images || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {jobSheet.images.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer">
                      <img src={url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
                    </a>
                  ))}
                </div>
              )}
            </SectionCard>
          )}

          {hasPayment && (
            <SectionCard title="Payment" icon={CreditCard}>
              <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-semibold">Amount Paid</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatCurrency(payment.amount)}
                    {payment.currency && payment.currency !== "INR" && (
                      <span className="text-xs text-gray-500 ml-1">{payment.currency}</span>
                    )}
                  </p>
                </div>
                {hasValue(payment.status) && (
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${paymentStatusStyle(payment.status)}`}>
                    {formatPaymentStatus(payment.status)}
                  </span>
                )}
              </div>
              <InfoGrid
                items={[
                  { label: "Order ID", value: displayText(payment.orderId), mono: true, fullWidth: true },
                  { label: "Payment ID", value: displayText(payment.paymentId), mono: true, fullWidth: true },
                  { label: "Service Cost", value: formatCurrency(payment.serviceCost) },
                  { label: "Parts Cost", value: formatCurrency(payment.partsCost) },
                  { label: "Labour Charge", value: formatCurrency(payment.labourCharge) },
                  { label: "Payment Created", value: formatDate(payment.createdAt) },
                  { label: "Paid At", value: formatDate(payment.paidAt) },
                ]}
              />
            </SectionCard>
          )}

          {feedback?.isSubmitted && (
            <SectionCard title="Customer Feedback" icon={Star}>
              <StarRating rating={feedback.rating || 0} />
              <p className="text-[10px] text-gray-400 uppercase font-semibold mt-4 mb-1">Review</p>
              <p className="text-sm text-gray-700 italic">
                {hasValue(feedback.review) ? feedback.review : "No written review"}
              </p>
              <p className="text-xs text-gray-500 mt-2">Submitted: {formatDate(feedback.submittedAt)}</p>
            </SectionCard>
          )}

          {dispute?.isRaised && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 overflow-hidden">
              <div className="px-4 py-3 bg-red-100 border-b border-red-200">
                <h4 className="text-sm font-bold text-red-800">Dispute Raised</h4>
              </div>
              <div className="p-4">
                <InfoGrid
                  items={[
                    { label: "Reason", value: displayText(dispute.reason), fullWidth: true },
                    { label: "Description", value: displayText(dispute.description), fullWidth: true },
                    { label: "Dispute Status", value: formatStatus(dispute.status) },
                  ]}
                />
              </div>
            </div>
          )}

          {(booking.images || []).length > 0 && (
            <SectionCard title={`Booking Images (${booking.images.length})`} icon={ImageIcon}>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {booking.images.map((url, i) => (
                  <a
                    key={i}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-square rounded-lg overflow-hidden border hover:ring-2 hover:ring-red-400"
                  >
                    <img src={url} alt={`Booking ${i + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100">
                      View
                    </span>
                  </a>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </div>
  );
};

const RowSkeleton = () => (
  <tr className="animate-pulse border-b">
    {[...Array(8)].map((_, i) => (
      <td key={i} className="p-4">
        <div className="h-4 bg-gray-200 rounded" />
      </td>
    ))}
  </tr>
);

const ServiceTickets = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/servicebookings/all-bookings`);
      if (!res.ok) throw new Error(`API Error: ${res.status}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setBookings(data.data);
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load service tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    const keyword = search.toLowerCase().trim();
    return bookings.filter((b) => {
      const matchStatus = statusFilter === "all" || b.status === statusFilter;
      const matchType = typeFilter === "all" || b.bookingType === typeFilter;

      if (!keyword) return matchStatus && matchType;

      const customer = b.customer || {};
      const mechanic = b.mechanic || {};
      const vehicle = b.vehicle || {};
      const haystack = [
        b.bookingId,
        customer.name,
        customer.phone,
        customer.userId,
        mechanic.fullName,
        mechanic.phone,
        mechanic.mechanicId,
        vehicle.registrationNumber,
        vehicle.vehicleName,
        vehicle.brand,
        getServiceNames(b),
        b.notes,
        b.note,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchStatus && matchType && haystack.includes(keyword);
    });
  }, [bookings, search, statusFilter, typeFilter]);

  const statusCounts = useMemo(() => {
    const counts = { all: bookings.length };
    bookings.forEach((b) => {
      const s = b.status || "unknown";
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      <div className={`flex-1 flex flex-col ${sidebarOpen ? "lg:ml-60" : ""}`}>
        <TopBar toggleSidebar={toggleSidebar} />

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Service Tickets</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                All service bookings with customer & mechanic details
              </p>
            </div>
            <button
              onClick={fetchBookings}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-60"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-red-800 text-sm font-medium">{error}</p>
                <button onClick={fetchBookings} className="text-red-600 text-sm underline mt-1">
                  Retry
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mb-6">
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-800">{bookings.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-3">
              <p className="text-xs text-gray-500">Filtered</p>
              <p className="text-xl font-bold text-red-600">{filteredBookings.length}</p>
            </div>
            <div className="bg-white rounded-xl border p-3 col-span-2 sm:col-span-2 lg:col-span-3">
              <p className="text-xs text-gray-500 mb-1">By status (sample)</p>
              <p className="text-xs text-gray-600 truncate">
                Assigned: {statusCounts.assigned || 0} · Work done: {statusCounts.work_done || 0} · Searching:{" "}
                {statusCounts.searching || 0}
              </p>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col lg:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search booking ID, customer, mechanic, vehicle, services..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:ring-2 focus:ring-red-500 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm min-w-[180px]"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.value !== "all" && statusCounts[opt.value] != null
                    ? ` (${statusCounts[opt.value]})`
                    : opt.value === "all"
                      ? ` (${statusCounts.all})`
                      : ""}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border text-sm min-w-[140px]"
            >
              {BOOKING_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-3 text-left font-semibold">Booking</th>
                    <th className="p-3 text-left font-semibold">Customer</th>
                    <th className="p-3 text-left font-semibold">Mechanic</th>
                    <th className="p-3 text-left font-semibold hidden md:table-cell">Vehicle</th>
                    <th className="p-3 text-left font-semibold hidden lg:table-cell">Services</th>
                    <th className="p-3 text-center font-semibold">Type</th>
                    <th className="p-3 text-center font-semibold">Status</th>
                    <th className="p-3 text-center font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [...Array(6)].map((_, i) => <RowSkeleton key={i} />)
                  ) : filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-gray-500">
                        No service tickets found
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => {
                      const customer = b.customer || {};
                      const mechanic = b.mechanic || {};
                      const vehicle = b.vehicle || {};
                      return (
                        <tr
                          key={b.bookingId}
                          className="border-t border-gray-100 hover:bg-red-50/30 transition-colors"
                        >
                          <td className="p-3">
                            {/* <p className="font-mono text-xs text-gray-500 truncate max-w-[120px]" title={b.bookingId}>
                              {b.bookingId?.slice(0, 10)}…
                            </p> */}
                            <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDate(b.createdAt).split(",")[0]}
                            </p>
                            <p className="text-xs font-medium text-gray-700 mt-0.5">{getEstimatedCost(b)}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-gray-800 truncate max-w-[140px]">
                              {customer.name || "Customer"}
                            </p>
                            <p className="text-xs text-gray-500">{formatPhone(customer.phone)}</p>
                          </td>
                          <td className="p-3">
                            <p className="font-medium text-gray-800 truncate max-w-[140px]">
                              {mechanic.fullName || EMPTY}
                            </p>
                            <p className="text-xs text-gray-500">{formatPhone(mechanic.phone)}</p>
                          </td>
                          <td className="p-3 hidden md:table-cell">
                            <p className="text-gray-800 truncate max-w-[160px]">
                              {vehicle.brand} {vehicle.model || vehicle.vehicleName}
                            </p>
                            <p className="text-xs text-gray-500">{vehicle.registrationNumber || EMPTY}</p>
                          </td>
                          <td className="p-3 hidden lg:table-cell">
                            <p className="text-xs text-gray-600 line-clamp-2 max-w-[200px]">{getServiceNames(b)}</p>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize ${getBookingTypeStyle(b.bookingType)}`}
                            >
                              {formatBookingType(b.bookingType)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-medium whitespace-nowrap ${getStatusStyle(b.status)}`}
                            >
                              {formatStatus(b.status)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="inline-flex items-center gap-1 text-red-600 hover:text-red-800 text-xs font-semibold"
                            >
                              View <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {selectedBooking && (
        <TicketDetailModal booking={selectedBooking} onClose={() => setSelectedBooking(null)} />
      )}
    </div>
  );
};

export default ServiceTickets;
