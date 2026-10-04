"use client";

import { useState } from "react";
import type { CanadianProvince } from "@/lib/tax/calculator";

export interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  province: CanadianProvince;
  postalCode: string;
}

interface Props {
  initialData?: ShippingFormData;
  onComplete: (data: ShippingFormData) => void;
}

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

const PROVINCES: { code: CanadianProvince; name: string }[] = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
];

const POSTAL_CODE_REGEX = /^[A-Z]\d[A-Z] \d[A-Z]\d$/;

type FormErrors = Partial<Record<keyof ShippingFormData, string>>;

function validate(data: ShippingFormData): FormErrors {
  const errors: FormErrors = {};

  if (!data.fullName.trim()) errors.fullName = "Full name is required.";
  if (!data.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!data.phone.trim()) errors.phone = "Phone number is required.";
  if (!data.addressLine1.trim()) errors.addressLine1 = "Address is required.";
  if (!data.city.trim()) errors.city = "City is required.";
  if (!data.province) errors.province = "Province is required.";
  if (!data.postalCode.trim()) {
    errors.postalCode = "Postal code is required.";
  } else if (!POSTAL_CODE_REGEX.test(data.postalCode)) {
    errors.postalCode = "Enter a valid postal code (e.g. A1B 2C3).";
  }

  return errors;
}

export function ShippingStep({ initialData, onComplete }: Props) {
  const [form, setForm] = useState<ShippingFormData>(
    initialData ?? {
      fullName: "",
      email: "",
      phone: "",
      addressLine1: "",
      city: "",
      province: "ON",
      postalCode: "",
    }
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    const updated =
      name === "postalCode" ? value.toUpperCase() : value;
    setForm((prev) => ({ ...prev, [name]: updated }));
    // Clear error on change
    if (errors[name as keyof ShippingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onComplete(form);
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{ width: "100%" }}>
      <h2
        style={{
          color: PURPLE,
          fontSize: "1.25rem",
          fontWeight: 700,
          marginBottom: "1.5rem",
        }}
      >
        Shipping Information
      </h2>

      <div style={styles.grid}>
        <Field
          label="Full Name"
          id="fullName"
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          error={errors.fullName}
          autoComplete="name"
        />

        <Field
          label="Email"
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />

        <Field
          label="Phone"
          id="phone"
          name="phone"
          type="tel"
          value={form.phone}
          onChange={handleChange}
          error={errors.phone}
          autoComplete="tel"
        />

        <Field
          label="Address Line 1"
          id="addressLine1"
          name="addressLine1"
          type="text"
          value={form.addressLine1}
          onChange={handleChange}
          error={errors.addressLine1}
          autoComplete="address-line1"
          fullWidth
        />

        <Field
          label="City"
          id="city"
          name="city"
          type="text"
          value={form.city}
          onChange={handleChange}
          error={errors.city}
          autoComplete="address-level2"
        />

        {/* Province dropdown */}
        <div style={styles.fieldWrapper}>
          <label htmlFor="province" style={styles.label}>
            Province / Territory <span style={{ color: "#c0392b" }}>*</span>
          </label>
          <select
            id="province"
            name="province"
            value={form.province}
            onChange={handleChange}
            autoComplete="address-level1"
            style={{
              ...styles.input,
              ...(errors.province ? styles.inputError : {}),
            }}
          >
            {PROVINCES.map(({ code, name }) => (
              <option key={code} value={code}>
                {name} ({code})
              </option>
            ))}
          </select>
          {errors.province && (
            <span style={styles.errorText}>{errors.province}</span>
          )}
        </div>

        <Field
          label="Postal Code"
          id="postalCode"
          name="postalCode"
          type="text"
          value={form.postalCode}
          onChange={handleChange}
          error={errors.postalCode}
          autoComplete="postal-code"
          placeholder="A1B 2C3"
          maxLength={7}
        />
      </div>

      <button type="submit" style={styles.submitButton}>
        Continue to Review
      </button>
    </form>
  );
}

// ── Field helper ──────────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  id: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  autoComplete?: string;
  placeholder?: string;
  maxLength?: number;
  fullWidth?: boolean;
}

function Field({
  label,
  id,
  name,
  type,
  value,
  onChange,
  error,
  autoComplete,
  placeholder,
  maxLength,
  fullWidth,
}: FieldProps) {
  return (
    <div
      style={{
        ...styles.fieldWrapper,
        ...(fullWidth ? { gridColumn: "1 / -1" } : {}),
      }}
    >
      <label htmlFor={id} style={styles.label}>
        {label} <span style={{ color: "#c0392b" }}>*</span>
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        style={{
          ...styles.input,
          ...(error ? styles.inputError : {}),
        }}
      />
      {error && <span style={styles.errorText}>{error}</span>}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
    gap: "1.25rem",
    marginBottom: "2rem",
  },
  fieldWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.375rem",
  },
  label: {
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#1a1a2e",
  },
  input: {
    padding: "0.625rem 0.875rem",
    borderRadius: "0.5rem",
    border: `1.5px solid #d1d5db`,
    fontSize: "0.9375rem",
    color: "#1a1a2e",
    background: "#fff",
    outline: "none",
    transition: "border-color 0.15s",
    width: "100%",
    boxSizing: "border-box" as const,
  },
  inputError: {
    borderColor: "#c0392b",
  },
  errorText: {
    fontSize: "0.8125rem",
    color: "#c0392b",
    marginTop: "0.125rem",
  },
  submitButton: {
    display: "block",
    width: "100%",
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    background: PURPLE,
    color: "#fff",
    fontSize: "1rem",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.01em",
    boxShadow: `0 2px 8px rgba(31,41,55,0.18)`,
    transition: "background 0.15s, box-shadow 0.15s",
  },
};
