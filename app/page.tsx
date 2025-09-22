"use client"

import type React from "react"

import { useState } from "react"

export default function NotionTitleGenerator() {
  const [title, setTitle] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [includeImage, setIncludeImage] = useState(false)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [uploadedImageDimensions, setUploadedImageDimensions] = useState<{ width: number; height: number } | null>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string
        setUploadedImage(imageUrl)

        const img = new Image()
        img.onload = () => {
          setUploadedImageDimensions({ width: img.width, height: img.height })
        }
        img.src = imageUrl
      }
      reader.readAsDataURL(file)
    }
  }

  const generateTitleImage = async (title: string, withImage = false): Promise<string> => {
    const width = 1750
    const height = 980

    const canvas = document.createElement("canvas")
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext("2d")!

    ctx.fillStyle = "#f7f7f5"
    ctx.fillRect(0, 0, width, height)

    if (withImage && uploadedImage) {
      const img = new Image()
      img.crossOrigin = "anonymous"

      return new Promise((resolve) => {
        img.onload = () => {
          const maxImageWidth = width * 0.4
          const maxImageHeight = height * 0.6

          let imageWidth = img.width
          let imageHeight = img.height

          const imageAspectRatio = imageWidth / imageHeight
          if (imageWidth > maxImageWidth) {
            imageWidth = maxImageWidth
            imageHeight = imageWidth / imageAspectRatio
          }
          if (imageHeight > maxImageHeight) {
            imageHeight = maxImageHeight
            imageWidth = imageHeight * imageAspectRatio
          }

          const imageTextSpacing = 80
          const imageX = 80
          const textStartX = imageX + imageWidth + imageTextSpacing
          const textWidth = width - textStartX - 80
          const textCenterX = textStartX + textWidth / 2

          ctx.fillStyle = "#2e2f31"
          ctx.textAlign = "center"
          ctx.textBaseline = "middle"

          let fontSize = 180
          const maxTextWidth = textWidth

          const splitTextIntoLines = (text: string, fontSize: number): string[] => {
            ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`
            const words = text.split(" ")
            const lines: string[] = []
            let currentLine = ""

            for (const word of words) {
              const testLine = currentLine ? `${currentLine} ${word}` : word
              const metrics = ctx.measureText(testLine)
              if (metrics.width > maxTextWidth) {
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
            return lines.every((line) => ctx.measureText(line).width <= maxTextWidth)
          }

          let lines = splitTextIntoLines(title, fontSize)

          while ((lines.length * fontSize > height * 0.8 || !checkLinesFit(lines, fontSize)) && fontSize > 60) {
            fontSize -= 10
            lines = splitTextIntoLines(title, fontSize)
          }

          const textHeight = lines.length * fontSize * 1.2
          let finalImageHeight = imageHeight
          let finalImageWidth = imageWidth
          if (imageHeight < textHeight * 1.1) {
            finalImageHeight = textHeight * 1.1
            finalImageWidth = finalImageHeight * imageAspectRatio
          }

          const combinedHeight = Math.max(finalImageHeight, textHeight)
          const verticalCenter = height / 2

          const imageY = verticalCenter - finalImageHeight / 2

          // Zeichne das Bild und ersetze transparente Bereiche mit Hintergrundfarbe
          ctx.drawImage(img, imageX, imageY, finalImageWidth, finalImageHeight)

          // Hole die Pixel-Daten des gezeichneten Bereichs
          const imageData = ctx.getImageData(imageX, imageY, finalImageWidth, finalImageHeight)
          const data = imageData.data

          // Hintergrundfarbe als RGB-Werte
          const bgColor = { r: 247, g: 247, b: 245 } // #f7f7f5

          // Ersetze transparente Pixel (Alpha = 0) mit Hintergrundfarbe
          for (let i = 0; i < data.length; i += 4) {
            if (data[i + 3] === 0) { // Vollständig transparent
              data[i] = bgColor.r     // Rot
              data[i + 1] = bgColor.g // Grün
              data[i + 2] = bgColor.b // Blau
              data[i + 3] = 255       // Vollständig opak
            }
          }

          // Setze die modifizierten Pixel-Daten zurück
          ctx.putImageData(imageData, imageX, imageY)

          const textCenterY = verticalCenter

          ctx.font = `bold ${fontSize}px Inter, -apple-system, BlinkMacSystemFont, sans-serif`
          const totalTextHeight = (lines.length - 1) * fontSize * 1.2
          const firstLineY = textCenterY - totalTextHeight / 2

          lines.forEach((line, index) => {
            const y = firstLineY + index * fontSize * 1.2
            ctx.fillText(line, textCenterX, y)
          })

          resolve(canvas.toDataURL("image/png"))
        }
        img.src = uploadedImage
      })
    } else {
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
  }

  const handleGenerate = async () => {
    if (title.trim()) {
      if (includeImage && !uploadedImage) {
        alert("Bitte laden Sie ein Bild hoch, wenn Sie die Bild-Option verwenden möchten.")
        return
      }

      setIsGenerating(true)
      try {
        const imageDataUrl = await generateTitleImage(title, includeImage)
        setGeneratedImage(imageDataUrl)
      } catch (error) {
        console.error("Error generating image:", error)
        alert("Fehler beim Generieren des Bildes.")
      } finally {
        setIsGenerating(false)
      }
    } else {
      alert("Bitte geben Sie einen Titel ein.")
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
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 max-w-md w-full">
        <h1 className="text-4xl font-bold mb-6 text-[#2e2f31] text-center">Notion Galerie-Bild Generator</h1>

        <div className="mb-6">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Geben Sie Ihren Titel ein"
            className="w-full p-4 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e2f31] focus:border-[#2e2f31] text-[#2e2f31] placeholder-gray-500"
            onKeyPress={(e) => e.key === "Enter" && handleGenerate()}
          />
        </div>

        <div className="mb-6">
          <label className="flex items-center space-x-3 mb-4">
            <input
              type="checkbox"
              checked={includeImage}
              onChange={(e) => setIncludeImage(e.target.checked)}
              className="w-5 h-5 text-[#2e2f31] bg-white border-gray-300 rounded focus:ring-[#2e2f31] focus:ring-2"
            />
            <span className="text-[#2e2f31] font-medium">Bild hinzufügen</span>
          </label>

          {includeImage && (
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full p-3 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2e2f31] text-[#2e2f31] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#2e2f31] file:text-white hover:file:bg-black"
              />
              {uploadedImage && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <img
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded preview"
                    className="w-full max-h-48 object-contain rounded-md"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[#2e2f31] text-white py-4 rounded-lg hover:bg-black transition duration-200 mb-4 font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? "Generiere..." : "Titelbild generieren"}
        </button>

        {generatedImage && (
          <div className="mt-8">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <img src={generatedImage || "/placeholder.svg"} alt="Generated Title" className="w-full rounded-md" />
            </div>
            <button
              onClick={handleDownload}
              className="w-full bg-[#2e2f31] text-white py-4 rounded-lg hover:bg-black transition duration-200 font-semibold text-lg"
            >
              Titelbild herunterladen
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
