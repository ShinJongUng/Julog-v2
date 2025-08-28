import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const title = searchParams.get("title") || "Julog";
    const description = searchParams.get("description") || "개발 발자취 남기기";
    const author = searchParams.get("author") || "신종웅";
    const date = searchParams.get("date") || "";
    const tags = searchParams.get("tags") || "";

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
            backgroundColor: "#0f172a",
            backgroundImage:
              "linear-gradient(45deg, #0f172a 25%, #1e293b 25%, #1e293b 50%, #0f172a 50%, #0f172a 75%, #1e293b 75%, #1e293b)",
            backgroundSize: "40px 40px",
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "40px 60px",
              position: "absolute",
              top: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#22c55e",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                J
              </div>
              <span
                style={{
                  fontSize: "36px",
                  fontWeight: "bold",
                  color: "#22c55e",
                }}
              >
                Julog
              </span>
            </div>
            {date && (
              <span
                style={{
                  fontSize: "20px",
                  color: "#94a3b8",
                }}
              >
                {new Date(date).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>

          {/* Main Content */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: "0 60px",
              flex: 1,
            }}
          >
            <h1
              style={{
                fontSize: title.length > 30 ? "48px" : "64px",
                fontWeight: "bold",
                color: "white",
                lineHeight: 1.2,
                marginBottom: "24px",
                maxWidth: "900px",
              }}
            >
              {title}
            </h1>

            {description && (
              <p
                style={{
                  fontSize: "28px",
                  color: "#cbd5e1",
                  lineHeight: 1.4,
                  maxWidth: "800px",
                  marginBottom: "32px",
                }}
              >
                {description.length > 100
                  ? description.substring(0, 100) + "..."
                  : description}
              </p>
            )}

            {tags && (
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "12px",
                  justifyContent: "center",
                }}
              >
                {tags
                  .split(", ")
                  .slice(0, 4)
                  .map((tag, index) => (
                    <span
                      key={index}
                      style={{
                        backgroundColor: "#22c55e",
                        color: "white",
                        padding: "8px 16px",
                        borderRadius: "20px",
                        fontSize: "18px",
                        fontWeight: "500",
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "40px 60px",
              position: "absolute",
              bottom: 0,
            }}
          >
            <span
              style={{
                fontSize: "24px",
                color: "#64748b",
              }}
            >
              by {author}
            </span>
            <span
              style={{
                fontSize: "20px",
                color: "#64748b",
              }}
            >
              blog.jongung.com
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    console.log(`Failed to generate OG image: ${errorMessage}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
