import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Veridict - AI Writing Detector for Students";
export const size = {
  width: 1200,
  height: 630
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f7f7f4",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 80px",
            maxWidth: "900px",
            textAlign: "center"
          }}
        >
          <div
            style={{
              fontSize: 24,
              letterSpacing: "0.3em",
              color: "#7a7670",
              textTransform: "uppercase",
              marginBottom: 20
            }}
          >
            Veridict
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 600,
              color: "#1f1f1c",
              lineHeight: 1.1,
              marginBottom: 24
            }}
          >
            AI Writing Detector for Students
          </div>
          <div
            style={{
              fontSize: 28,
              color: "#4c4b45",
              lineHeight: 1.4
            }}
          >
            Check your essays before submitting. Get actionable signals to reduce false positives.
          </div>
          <div
            style={{
              marginTop: 40,
              padding: "16px 32px",
              backgroundColor: "#2f3e4e",
              color: "#f7f7f4",
              borderRadius: 100,
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: "0.2em",
              textTransform: "uppercase"
            }}
          >
            Try Free
          </div>
        </div>
      </div>
    ),
    {
      ...size
    }
  );
}
