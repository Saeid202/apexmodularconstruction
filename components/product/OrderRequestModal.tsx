"use client";

import { useState } from "react";
import { X, Send, MapPin, User, Phone, Mail, Package, MessageSquare } from "lucide-react";
import { submitOrderRequest, type OrderRequestInput } from "@/app/actions/order-requests";

const PURPLE = "#4B1D8F";
const GOLD = "#D4AF37";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4B1D8F] focus:border-transparent transition-shadow";

interface Props {
  productId: string;
  sellerId: string;
  productName: string;
  productPrice: number;
  variantCode: string | null;
  customizations?: any;
  onClose: () => void;
  onSuccess: (requestNumber: string) => void;
}

export function OrderRequestModal({
  productId,
  sellerId,
  productName,
  productPrice,
  variantCode,
  customizations,
  onClose,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);

    const input: OrderRequestInput = {
      productId,
      sellerId,
      productName,
      productPrice,
      variantCode,
      customizations,
      quantity: parseInt(fd.get("quantity") as string) || 1,
      message: (fd.get("message") as string) ?? "",
      contactName: fd.get("contactName") as string,
      contactEmail: fd.get("contactEmail") as string,
      contactPhone: (fd.get("contactPhone") as string) ?? "",
      shippingAddress: {
        addressLine1: fd.get("addressLine1") as string,
        city: fd.get("city") as string,
        province: fd.get("province") as string,
        postalCode: fd.get("postalCode") as string,
        country: "Canada",
      },
    };

    const result = await submitOrderRequest(input);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      onSuccess(result.requestNumber!);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl"
        style={{ border: `2px solid ${GOLD}` }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-2xl"
          style={{ background: `linear-gradient(135deg, ${PURPLE} 0%, #3a1570 100%)` }}
        >
          <div>
            <h2 className="text-lg font-extrabold text-white">Submit Order Request</h2>
            <p className="text-xs text-purple-200 mt-0.5 truncate max-w-[280px]">{productName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-purple-200 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <span className="shrink-0 mt-0.5">⚠</span> {error}
            </div>
          )}

          {/* Quantity + variant info */}
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: "#EDE9F6" }}>
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: PURPLE }}>
              <Package className="h-4 w-4" />
              Order Details
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Quantity *</label>
                <input
                  name="quantity"
                  type="number"
                  min="1"
                  defaultValue="1"
                  required
                  className={inputClass}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Variant</label>
                <input
                  value={variantCode ?? "Standard"}
                  readOnly
                  className={`${inputClass} bg-gray-50 text-gray-500 cursor-default`}
                />
              </div>
            </div>
            {customizations && Object.entries(customizations).length > 0 && (
              <div className="mt-3 pt-3 border-t border-purple-200/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 mb-1.5">Customizations</p>
                <div className="space-y-1">
                  {Object.entries(customizations as Record<string, any>).map(([id, c]) => (
                    <p key={id} className="text-xs text-purple-900">
                      <span className="font-bold">{c.groupName}:</span> {c.optionName}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Message */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-1.5">
              <MessageSquare className="h-4 w-4" style={{ color: PURPLE }} />
              Message / Note
            </label>
            <textarea
              name="message"
              rows={3}
              placeholder="Describe your requirements, preferred delivery timeline, special instructions…"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Contact details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: PURPLE }}>
              <User className="h-4 w-4" />
              Contact Details
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
              <input name="contactName" type="text" required placeholder="John Smith" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  <Mail className="inline h-3 w-3 mr-1" />Email *
                </label>
                <input name="contactEmail" type="email" required placeholder="john@example.com" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">
                  <Phone className="inline h-3 w-3 mr-1" />Phone
                </label>
                <input name="contactPhone" type="tel" placeholder="+1 416 000 0000" className={inputClass} />
              </div>
            </div>
          </div>

          {/* Shipping address */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: PURPLE }}>
              <MapPin className="h-4 w-4" />
              Shipping Address
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Street Address *</label>
              <input name="addressLine1" type="text" required placeholder="123 Main St" className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">City *</label>
                <input name="city" type="text" required placeholder="Toronto" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Province *</label>
                <input name="province" type="text" required placeholder="ON" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Postal Code *</label>
              <input name="postalCode" type="text" required placeholder="M5V 3A8" className={inputClass} />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full min-h-[48px] items-center justify-center gap-2 rounded-xl text-base font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
            style={{ backgroundColor: PURPLE, border: `2px solid ${GOLD}` }}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Submitting…
              </span>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Submit Order Request
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
