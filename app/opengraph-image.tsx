import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Shanghai Apex Modular Construction - Your Trusted Partner for Construction Success";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #2d0f6b 0%, #1e0a4a 50%, #150736 100%)",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Gold top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 8, background: "linear-gradient(90deg, #D4AF37, #f5d76e, #D4AF37)", display: "flex" }} />

        {/* Background glow circles */}
        <div style={{ position: "absolute", top: -150, right: -100, width: 600, height: 600, borderRadius: "50%", background: "rgba(212,175,55,0.07)", display: "flex" }} />
        <div style={{ position: "absolute", bottom: -100, left: -100, width: 400, height: 400, borderRadius: "50%", background: "rgba(212,175,55,0.05)", display: "flex" }} />

        {/* Left content */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "60px 80px", flex: 1 }}>

          {/* Badge */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(212,175,55,0.15)", border: "1px solid rgba(212,175,55,0.4)",
            borderRadius: 100, padding: "8px 20px", width: "fit-content", marginBottom: 32,
          }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#D4AF37", display: "flex" }} />
            <span style={{ color: "#D4AF37", fontSize: 18, fontWeight: 700, letterSpacing: 2 }}>APEX MODULAR CONSTRUCTION</span>
          </div>
          
          {/* Headline */}
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 24 }}>
            <span style={{ color: "white", fontSize: 58, fontWeight: 900, lineHeight: 1.1 }}>Your Trusted Partner</span>
            <span style={{ color: "white", fontSize: 58, fontWeight: 900, lineHeight: 1.1 }}>for</span>
            <span style={{ color: "#D4AF37", fontSize: 62, fontWeight: 900, lineHeight: 1.1 }}>Construction Success</span>
          </div>

          {/* Subtext */}
          <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 24, marginBottom: 40, lineHeight: 1.5 }}>
            One-stop sourcing and consolidation of{"\n"}construction materials.
          </div>

          {/* Feature pills */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {["Reliable Quality", "Cost Efficiency", "On-time Delivery", "Expert Support"].map((label) => (
              <div key={label} style={{
                padding: "10px 20px",
                border: "1px solid rgba(212,175,55,0.4)",
                borderRadius: 100,
                color: "#D4AF37",
                fontSize: 18,
                fontWeight: 600,
                background: "rgba(212,175,55,0.1)",
                display: "flex",
              }}>
                {label}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 80px",
          borderTop: "1px solid rgba(212,175,55,0.2)",
          background: "rgba(0,0,0,0.2)",
        }}>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, letterSpacing: 2 }}>apexmodularconstruction.com</span>
          <span style={{ color: "rgba(212,175,55,0.6)", fontSize: 16 }}>Source from China · Ship to Canada</span>
        </div>

        {/* Gold bottom bar */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 5, background: "linear-gradient(90deg, #D4AF37, #f5d76e, #D4AF37)", display: "flex" }} />
      </div>
    ),
    { ...size }
  );
}
