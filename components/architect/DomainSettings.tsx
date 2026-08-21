"use client";

import { useMemo, useState } from "react";
import {
  Globe,
  Save,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { updateArchitectProfile } from "@/app/actions/architect";
import { verifyCustomDomainDNS, type DomainVerifyResult } from "@/app/actions/domains";
import { isValidCustomDomain, normalizeHost, APP_ROOT_DOMAIN, APP_A_RECORD } from "@/lib/domains";

interface DomainSettingsProps {
  initialProfile: any;
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable — no-op */
        }
      }}
      className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function DomainSettings({ initialProfile }: DomainSettingsProps) {
  const branding = initialProfile?.branding || {};
  const subdomain: string | null = initialProfile?.subdomain || null;
  const savedDomain: string = branding.customDomain || "";

  const [domain, setDomain] = useState<string>(savedDomain);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState<DomainVerifyResult | null>(null);

  const normalized = normalizeHost(domain);
  const valid = normalized === "" || isValidCustomDomain(normalized);
  const isConnectedRoot = normalized.startsWith("www.") || normalized.split(".").length === 2;

  const dnsRows = useMemo(() => {
    // A root domain (myfirm.com) uses an A record; a subdomain (www.myfirm.com,
    // studio.myfirm.com) uses a CNAME to the app.
    if (normalized.split(".").length > 2 || normalized.startsWith("www.")) {
      const label = normalized.split(".")[0] || "www";
      return [{ type: "CNAME", name: label, value: APP_ROOT_DOMAIN }];
    }
    return [
      { type: "A", name: "@", value: APP_A_RECORD },
      { type: "CNAME", name: "www", value: APP_ROOT_DOMAIN },
    ];
  }, [normalized]);

  async function persist(nextDomain: string | null) {
    setSaving(true);
    setMessage(null);
    // Only `branding.customDomain` changes — every other profile field is
    // passed through unchanged so nothing else in the record is affected.
    const result = await updateArchitectProfile({
      fullName: initialProfile?.full_name || "",
      phone: initialProfile?.phone ?? null,
      firmName: initialProfile?.firm_name ?? null,
      bio: initialProfile?.bio ?? null,
      website: initialProfile?.website ?? null,
      address: initialProfile?.address ?? null,
      professionalRole: initialProfile?.professional_role ?? null,
      experienceYears: initialProfile?.experience_years ?? null,
      specialization: initialProfile?.specialization ?? null,
      subdomain: initialProfile?.subdomain ?? undefined,
      branding: { ...branding, customDomain: nextDomain || undefined },
    });
    setSaving(false);
    if (result.success) {
      setMessage({
        kind: "ok",
        text: nextDomain
          ? "Domain saved. Add the DNS records below, then it can take up to 48h to go live."
          : "Custom domain removed.",
      });
    } else {
      setMessage({ kind: "err", text: result.error || "Failed to save domain." });
    }
  }

  function handleSave() {
    if (!valid || normalized === "") {
      setMessage({ kind: "err", text: "Enter a valid domain, e.g. www.myfirm.com" });
      return;
    }
    setDomain(normalized);
    persist(normalized);
  }

  function handleRemove() {
    setDomain("");
    setVerifyResult(null);
    persist(null);
  }

  async function handleVerify() {
    setVerifying(true);
    setVerifyResult(null);
    try {
      const result = await verifyCustomDomainDNS(savedDomain);
      setVerifyResult(result);
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="max-w-3xl space-y-6 p-6 lg:p-8">
      {/* Default subdomain (always available) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-gray-900">Your free Apex address</h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Every studio comes with a built-in address. It always works, even without a custom domain.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <code className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-800 border border-gray-200">
            {subdomain ? `${subdomain}.${APP_ROOT_DOMAIN}` : "Set a subdomain in Settings first"}
          </code>
          {subdomain ? (
            <a
              href={`/studio/${subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ExternalLink className="h-4 w-4" /> Preview
            </a>
          ) : null}
        </div>
      </div>

      {/* Custom domain entry */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900">Connect a custom domain</h3>
        <p className="mt-1 text-sm text-gray-500">
          Already own a domain? Point it here so visitors see your own web address instead of the Apex one.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <div className="flex items-center rounded-xl border border-gray-200 px-3 focus-within:ring-2 focus-within:ring-emerald-500">
              <span className="text-sm text-gray-400">https://</span>
              <input
                type="text"
                value={domain}
                placeholder="www.myfirm.com"
                onChange={(e) => setDomain(e.target.value)}
                className="w-full bg-transparent px-2 py-2.5 text-sm focus:outline-none"
              />
            </div>
            {!valid ? (
              <p className="mt-1 text-xs text-rose-600">That doesn’t look like a valid domain.</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !valid || normalized === ""}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              <Save className="h-4 w-4" /> {saving ? "Saving…" : "Save domain"}
            </button>
            {savedDomain ? (
              <button
                onClick={handleRemove}
                disabled={saving}
                className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
              >
                <Trash2 className="h-4 w-4" /> Remove
              </button>
            ) : null}
          </div>
        </div>

        {message ? (
          <div
            className={`mt-4 flex items-start gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
              message.kind === "ok"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {message.kind === "ok" ? (
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            {message.text}
          </div>
        ) : null}
      </div>

      {/* DNS setup instructions — shown once a domain is saved */}
      {savedDomain ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-gray-900">Point your DNS</h3>
              {verifyResult?.connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" /> Connected
                </span>
              ) : verifyResult && !verifyResult.connected ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                  <AlertCircle className="h-3 w-3" /> Not detected yet
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
                  <AlertCircle className="h-3 w-3" /> Awaiting DNS
                </span>
              )}
            </div>
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${verifying ? "animate-spin" : ""}`} />
              {verifying ? "Checking…" : "Verify connection"}
            </button>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Log in to your domain registrar (GoDaddy, Namecheap, Cloudflare…) and add
            {dnsRows.length > 1 ? " these records:" : " this record:"}
          </p>

          <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-2 font-semibold">Type</th>
                  <th className="px-4 py-2 font-semibold">Name / Host</th>
                  <th className="px-4 py-2 font-semibold">Value / Points to</th>
                  <th className="px-4 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dnsRows.map((row) => (
                  <tr key={`${row.type}-${row.name}`}>
                    <td className="px-4 py-2.5 font-mono text-gray-800">{row.type}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-800">{row.name}</td>
                    <td className="px-4 py-2.5 font-mono text-gray-800">{row.value}</td>
                    <td className="px-4 py-2.5 text-right">
                      <CopyButton value={row.value} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-gray-400">
            After the records propagate (usually minutes, up to 48 hours), your studio will be reachable at{" "}
            <span className="font-semibold text-gray-600">{savedDomain}</span>. SSL is provisioned automatically by
            the Apex team once the domain resolves.
          </p>

          {verifyResult ? (
            <div
              className={`mt-4 rounded-xl border px-4 py-3 text-sm ${
                verifyResult.connected
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <div className="flex items-start gap-2 font-medium">
                {verifyResult.connected ? (
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                )}
                <span>
                  {verifyResult.connected
                    ? `DNS is pointing at Apex (via ${verifyResult.method?.toUpperCase()} record). Your domain is connected — SSL finishes automatically.`
                    : verifyResult.error ||
                      "DNS isn’t pointing here yet. Double-check the records above; changes can take up to 48 hours."}
                </span>
              </div>
              {verifyResult.found.length > 0 ? (
                <div className="mt-2 pl-6">
                  <p className="text-xs font-semibold uppercase opacity-70">Records found</p>
                  <ul className="mt-1 space-y-0.5 font-mono text-xs">
                    {verifyResult.found.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
