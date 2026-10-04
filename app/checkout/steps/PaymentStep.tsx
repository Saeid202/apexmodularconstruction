"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { getStripe } from "@/lib/stripe/client";
import { createPaymentIntent } from "@/app/actions/payment";

const PURPLE = "#1F2937";
const GOLD = "#D4AF37";

// ── Props ─────────────────────────────────────────────────────────────────────

interface PaymentStepProps {
  totalCents: number;
  totalDisplay: string;
  onBack: () => void;
  onSuccess: (paymentIntentId: string) => void;
}

// ── Inner form (must be inside <Elements>) ────────────────────────────────────

interface PaymentFormProps {
  totalDisplay: string;
  onBack: () => void;
  onSuccess: (paymentIntentId: string) => void;
}

function PaymentForm({ totalDisplay, onBack, onSuccess }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/checkout/success",
      },
      redirect: "if_required",
    });

    if (error) {
      setErrorMessage(error.message ?? "Payment failed. Please try again.");
      setIsProcessing(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      onSuccess(paymentIntent.id);
    } else {
      setErrorMessage("Payment was not completed. Please try again.");
      setIsProcessing(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ width: "100%" }}>
      <h2 style={styles.heading}>Payment</h2>

      <div style={styles.elementWrapper}>
        <PaymentElement />
      </div>

      {errorMessage && (
        <div style={styles.errorBox} role="alert">
          {errorMessage}
        </div>
      )}

      <div style={styles.buttonRow}>
        <button
          type="button"
          onClick={onBack}
          disabled={isProcessing}
          style={styles.backButton}
        >
          Back
        </button>

        <button
          type="submit"
          disabled={isProcessing || !stripe || !elements}
          style={{
            ...styles.payButton,
            opacity: isProcessing || !stripe || !elements ? 0.7 : 1,
            cursor: isProcessing || !stripe || !elements ? "not-allowed" : "pointer",
          }}
        >
          {isProcessing ? (
            <span style={styles.spinnerRow}>
              <Spinner />
              Processing…
            </span>
          ) : (
            `Pay ${totalDisplay}`
          )}
        </button>
      </div>
    </form>
  );
}

// ── Outer component (fetches clientSecret, renders <Elements>) ────────────────

export function PaymentStep({
  totalCents,
  totalDisplay,
  onBack,
  onSuccess,
}: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setFetchError(null);
    const { clientSecret: secret, error } = await createPaymentIntent(totalCents);
    if (error || !secret) {
      setFetchError(error ?? "Failed to initialise payment.");
      return;
    }
    setClientSecret(secret);
  }, [totalCents]);

  useEffect(() => {
    fetchClientSecret();
  }, [fetchClientSecret]);

  if (fetchError) {
    return (
      <div style={{ width: "100%" }}>
        <h2 style={styles.heading}>Payment</h2>
        <div style={styles.errorBox} role="alert">
          {fetchError}
        </div>
        <div style={styles.buttonRow}>
          <button type="button" onClick={onBack} style={styles.backButton}>
            Back
          </button>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div style={styles.loadingWrapper}>
        <Spinner size={32} />
        <p style={{ color: PURPLE, marginTop: "1rem", fontWeight: 600 }}>
          Preparing payment…
        </p>
      </div>
    );
  }

  return (
    <Elements
      stripe={getStripe()}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
          variables: {
            colorPrimary: PURPLE,
            colorText: "#1a1a2e",
          },
        },
      }}
    >
      <PaymentForm
        totalDisplay={totalDisplay}
        onBack={onBack}
        onSuccess={onSuccess}
      />
    </Elements>
  );
}

// ── Spinner ───────────────────────────────────────────────────────────────────

function Spinner({ size = 18 }: { size?: number }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `${Math.max(2, size / 8)}px solid rgba(255,255,255,0.35)`,
        borderTopColor: "#fff",
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
      }}
    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  heading: {
    color: PURPLE,
    fontSize: "1.25rem",
    fontWeight: 700,
    marginBottom: "1.5rem",
  },
  elementWrapper: {
    marginBottom: "1.5rem",
    padding: "1.25rem",
    borderRadius: "0.75rem",
    border: `1.5px solid #e5e7eb`,
    background: "#fafafa",
  },
  errorBox: {
    padding: "0.875rem 1rem",
    borderRadius: "0.5rem",
    background: "#fef2f2",
    border: "1.5px solid #fca5a5",
    color: "#b91c1c",
    fontSize: "0.9rem",
    marginBottom: "1.25rem",
  },
  buttonRow: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.5rem",
  },
  backButton: {
    flex: "0 0 auto",
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    border: `2px solid ${PURPLE}`,
    background: "transparent",
    color: PURPLE,
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background 0.15s",
  },
  payButton: {
    flex: 1,
    padding: "0.875rem 1.5rem",
    borderRadius: "0.5rem",
    border: "none",
    background: GOLD,
    color: "#1a1a2e",
    fontSize: "1rem",
    fontWeight: 700,
    letterSpacing: "0.01em",
    boxShadow: `0 2px 8px rgba(212,175,55,0.3)`,
    transition: "background 0.15s, box-shadow 0.15s",
  },
  spinnerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
  },
  loadingWrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "3rem 0",
  },
};
