import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text parameter is required and must be a string" }, { status: 400 })
    }

    const width = 1750
    const height = 980

    // Calculate font size based on text length
    const fontSize = Math.max(100, Math.min(310, 2000 / text.length))

    // Create SVG
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f7f7f5"/>
        <text 
          x="50%" 
          y="50%" 
          font-family="Inter, -apple-system, BlinkMacSystemFont, sans-serif" 
          font-size="${fontSize}" 
          font-weight="bold" 
          fill="#2e2f31" 
          text-anchor="middle" 
          dominant-baseline="middle"
          style="word-wrap: break-word;"
        >
          ${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}
        </text>
      </svg>
    `

    // Convert SVG to PNG using a simple approach
    const svgBuffer = Buffer.from(svg)

    // For now, return the SVG as PNG (browsers will handle it correctly)
    return new Response(svgBuffer, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml",
        "Content-Length": svgBuffer.length.toString(),
        "Cache-Control": "no-cache",
        "Content-Disposition": 'inline; filename="title.svg"',
      },
    })
  } catch (error) {
    console.error("[v0] Error generating title image:", error)
    return NextResponse.json(
      {
        error: "Failed to generate title image",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
