"use client";

export default function Footer() {
    return (
        <footer style={{ backgroundColor: "#0A192F", borderTop: "1px solid #112240", padding: "64px 0", color: "#fff" }}>
            <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 1.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 48, marginBottom: 64 }}>
                    <div style={{ gridColumn: "span 2" }} className="footer-brand">
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 32 }}>
                            <span style={{ fontSize: 32, color: "#FF6B00" }}>🚀</span>
                            <span style={{ fontSize: 24, fontWeight: 900, fontFamily: "Montserrat, sans-serif", textTransform: "uppercase", letterSpacing: "-0.04em" }}>AIleadsite</span>
                        </div>
                        <p style={{ fontSize: 14, color: "#94a3b8", fontWeight: 500, lineHeight: 1.6, maxWidth: 300 }}>
                            Direct-response web design for the ambitious small business owner. Built for ROI, engineered for speed.
                        </p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#FF6B00", marginBottom: 24 }}>Company</h4>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                            {["About Our Process", "Growth Partners", "ROI Case Studies"].map(item => (
                                <li key={item}><a href="#" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", fontWeight: 700 }}>{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#FF6B00", marginBottom: 24 }}>Growth Plans</h4>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                            {["Essential Launch", "Market Dominator", "Enterprise Custom"].map(item => (
                                <li key={item}><a href="#" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", fontWeight: 700 }}>{item}</a></li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: 11, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.2em", color: "#FF6B00", marginBottom: 24 }}>Legal</h4>
                        <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 16 }}>
                            {["Privacy Terms", "Service Agreement", "Lead Guarantee"].map(item => (
                                <li key={item}><a href="#" style={{ fontSize: 14, color: "#94a3b8", textDecoration: "none", fontWeight: 700 }}>{item}</a></li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div style={{ paddingTop: 40, borderTop: "1px solid #112240", textAlign: "center" }}>
                    <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.15em", color: "#475569" }}>
                        © 2026 AIleadsite.com. Engineered for growth.
                    </p>
                </div>
            </div>
            <style>{`
        @media (max-width: 768px) {
          .footer-brand { grid-column: span 1 !important; }
        }
      `}</style>
        </footer>
    );
}
