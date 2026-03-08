export default function Stats() {
    const stats = [
        { value: "24h", label: "Response Time", desc: "We know you're busy. We act fast." },
        { value: "98%", label: "Client Retention", desc: "Proven results that keep businesses growing." },
        { value: "5 Days", label: "Average Delivery", desc: "Your custom built website, delivered fast." },
    ];

    return (
        <section
            style={{
                padding: "0 1.5rem",
                marginTop: -40,
                position: "relative",
                zIndex: 20,
            }}
        >
            <div style={{ maxWidth: 1280, margin: "0 auto" }}>
                <div
                    className="stats-grid"
                    style={{
                        backgroundColor: "#fff",
                        borderRadius: 16,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.12)",
                        border: "1px solid #f1f5f9",
                        overflow: "hidden",
                    }}
                >
                    {stats.map((s, i) => (
                        <div
                            key={s.label}
                            style={{
                                padding: "40px",
                                textAlign: "center",
                                borderLeft: i > 0 ? "1px solid #f1f5f9" : "none",
                            }}
                        >
                            <div
                                style={{
                                    fontFamily: "Montserrat, sans-serif",
                                    fontSize: "clamp(2.5rem, 4vw, 3rem)",
                                    fontWeight: 800,
                                    color: "#FF6B00",
                                    marginBottom: 8,
                                }}
                            >
                                {s.value}
                            </div>
                            <p style={{ fontWeight: 700, fontSize: 18, color: "#0A192F", margin: "0 0 8px" }}>{s.label}</p>
                            <p style={{ fontSize: 14, color: "#64748b", fontWeight: 500, margin: 0 }}>{s.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid > div {
            border-left: none !important;
            border-top: 1px solid #f1f5f9;
          }
          .stats-grid > div:first-child {
            border-top: none;
          }
        }
      `}</style>
        </section>
    );
}
