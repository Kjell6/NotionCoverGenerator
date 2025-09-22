"use client"

import type React from "react"
import { useState } from "react"

export default function MinimalNotionTitleGenerator() {
  const [title, setTitle] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const generateTitleImage = async (title: string): Promise<string> => {
    const width = 1750
    const height = 980

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!

    // Background
    ctx.fillStyle = "#f7f7f5"
    ctx.fillRect(0, 0, width, height)

    // Text-only mode
    ctx.fillStyle = "#2e2f31"
    ctx.textAlign = "center"
    ctx.textBaseline = "bottom"

    let fontSize = 310
    const maxWidth = width - 80
    let bottomMargin = 200

    const splitTextIntoLines = (text: string, fontSize: number): string[] => {
      ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`
      const words = text.split(" ")
      const lines: string[] = []
      let currentLine = ""

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word
        const metrics = ctx.measureText(testLine)
        if (metrics.width > maxWidth) {
          if (currentLine) {
            lines.push(currentLine)
            currentLine = word
          } else {
            lines.push(word)
            currentLine = ""
          }
        } else {
          currentLine = testLine
        }
      }
      if (currentLine) {
        lines.push(currentLine)
      }
      return lines
    }

    const checkLinesFit = (lines: string[], fontSize: number): boolean => {
      ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`
      return lines.every((line) => ctx.measureText(line).width <= maxWidth)
    }

    let lines = splitTextIntoLines(title, fontSize)

    while ((lines.length * fontSize > height - bottomMargin || !checkLinesFit(lines, fontSize)) && fontSize > 100) {
      fontSize -= 10
      lines = splitTextIntoLines(title, fontSize)
    }

    if (lines.length > 1) {
      bottomMargin = 100
    }

    const startY = height - bottomMargin

    ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`
    lines.forEach((line, index) => {
      const y = startY - (lines.length - 1 - index) * fontSize
      ctx.fillText(line, width / 2, y)
    })

    return canvas.toDataURL("image/png")
  }

  const handleGenerate = async () => {
    if (title.trim()) {
      setIsGenerating(true)
      try {
        const imageDataUrl = await generateTitleImage(title)
        setGeneratedImage(imageDataUrl)
      } catch (error) {
        console.error("Error generating image:", error)
        alert("Fehler beim Generieren des Bildes.")
      } finally {
        setIsGenerating(false)
      }
    } else {
      alert("Bitte geben Sie einen Text ein.")
    }
  }

  const handleDownload = () => {
    if (generatedImage) {
      const link = document.createElement("a")
      link.href = generatedImage
      link.download = "notion-titelbild.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-2">
      <div className="bg-white rounded-lg p-4 max-w-xs w-full">
        <div className="mb-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Text"
            className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e2f31] focus:border-[#2e2f31] text-[#2e2f31] placeholder-gray-500"
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[#2e2f31] text-white py-3 rounded-lg hover:bg-black transition duration-200 mb-4 font-semibold text-md disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "..." : "Generieren"}
        </button>

        {generatedImage && (
          <div className="mt-6">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-2 mb-4">
              <img src={generatedImage || "/placeholder.svg"} alt="Generated Title" className="w-full rounded-md" />
            </div>
            <button
              onClick={handleDownload}
              className="w-full bg-[#2e2f31] text-white py-3 rounded-lg hover:bg-black transition duration-200 font-semibold text-md"
            >
              Download
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
