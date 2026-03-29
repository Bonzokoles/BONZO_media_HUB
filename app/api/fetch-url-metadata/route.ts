export const dynamic = 'error'

import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Fetch the page
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; BONZO_media_HUB/1.0)",
      },
      signal: AbortSignal.timeout(5000),
    })

    if (!response.ok) {
      return NextResponse.json({ 
        title: "",
        description: "",
        favicon: getFaviconUrl(url),
      })
    }

    const html = await response.text()

    // Parse metadata
    const title = extractMetaContent(html, "og:title") 
      || extractTagContent(html, "title") 
      || ""
    
    const description = extractMetaContent(html, "og:description") 
      || extractMetaContent(html, "description") 
      || ""

    // Try to get favicon
    let favicon = extractLinkHref(html, 'rel="icon"')
      || extractLinkHref(html, "rel='icon'")
      || extractLinkHref(html, 'rel="shortcut icon"')
      || getFaviconUrl(url)

    // Make favicon URL absolute
    if (favicon && !favicon.startsWith("http")) {
      const urlObj = new URL(url)
      favicon = favicon.startsWith("/")
        ? `${urlObj.origin}${favicon}`
        : `${urlObj.origin}/${favicon}`
    }

    return NextResponse.json({
      title: title.slice(0, 200),
      description: description.slice(0, 500),
      favicon,
    })
  } catch (error) {
    console.error("Error fetching URL metadata:", error)
    return NextResponse.json({
      title: "",
      description: "",
      favicon: "",
    })
  }
}

function extractMetaContent(html: string, property: string): string {
  // Try property attribute
  const propertyMatch = html.match(
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']+)["']`, "i")
  )
  if (propertyMatch) return propertyMatch[1]

  // Try name attribute
  const nameMatch = html.match(
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']+)["']`, "i")
  )
  if (nameMatch) return nameMatch[1]

  // Try reverse order (content before property/name)
  const reverseMatch = html.match(
    new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*(property|name)=["']${property}["']`, "i")
  )
  if (reverseMatch) return reverseMatch[1]

  return ""
}

function extractTagContent(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[^>]*>([^<]+)</${tag}>`, "i"))
  return match ? match[1].trim() : ""
}

function extractLinkHref(html: string, relAttr: string): string {
  const match = html.match(
    new RegExp(`<link[^>]*${relAttr}[^>]*href=["']([^"']+)["']`, "i")
  )
  if (match) return match[1]

  // Try reverse order
  const reverseMatch = html.match(
    new RegExp(`<link[^>]*href=["']([^"']+)["'][^>]*${relAttr}`, "i")
  )
  return reverseMatch ? reverseMatch[1] : ""
}

function getFaviconUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    return `${urlObj.origin}/favicon.ico`
  } catch {
    return ""
  }
}
