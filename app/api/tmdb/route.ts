export const dynamic = 'force-static'

import { NextRequest, NextResponse } from "next/server"

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_READ_TOKEN = process.env.TMDB_READ_TOKEN
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

const headers = {
  accept: "application/json",
  Authorization: `Bearer ${TMDB_READ_TOKEN}`,
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const query = searchParams.get("query")
  const id = searchParams.get("id")
  const page = searchParams.get("page") || "1"
  const mediaType = searchParams.get("mediaType") || "movie"
  const genre = searchParams.get("genre")
  const year = searchParams.get("year")
  const sortBy = searchParams.get("sortBy") || "popularity.desc"
  const listId = searchParams.get("listId")

  if (!TMDB_API_KEY || !TMDB_READ_TOKEN) {
    return NextResponse.json({ error: "TMDB API keys not configured" }, { status: 500 })
  }

  try {
    let url: string
    let response: Response

    switch (action) {
      case "search":
        if (!query) {
          return NextResponse.json({ error: "Query required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/search/${mediaType}?query=${encodeURIComponent(query)}&page=${page}&language=pl-PL`
        response = await fetch(url, { headers })
        break

      case "details":
        if (!id) {
          return NextResponse.json({ error: "ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/${mediaType}/${id}?language=pl-PL&append_to_response=credits,videos,recommendations,reviews,keywords`
        response = await fetch(url, { headers })
        break

      case "trending":
        url = `${TMDB_BASE_URL}/trending/${mediaType}/week?language=pl-PL&page=${page}`
        response = await fetch(url, { headers })
        break

      case "popular":
        url = `${TMDB_BASE_URL}/${mediaType}/popular?language=pl-PL&page=${page}`
        response = await fetch(url, { headers })
        break

      case "top_rated":
        url = `${TMDB_BASE_URL}/${mediaType}/top_rated?language=pl-PL&page=${page}`
        response = await fetch(url, { headers })
        break

      case "upcoming":
        url = `${TMDB_BASE_URL}/movie/upcoming?language=pl-PL&page=${page}`
        response = await fetch(url, { headers })
        break

      case "now_playing":
        url = `${TMDB_BASE_URL}/movie/now_playing?language=pl-PL&page=${page}`
        response = await fetch(url, { headers })
        break

      case "genres":
        url = `${TMDB_BASE_URL}/genre/${mediaType}/list?language=pl-PL`
        response = await fetch(url, { headers })
        break

      case "discover":
        let discoverUrl = `${TMDB_BASE_URL}/discover/${mediaType}?language=pl-PL&page=${page}&sort_by=${sortBy}`
        if (genre) discoverUrl += `&with_genres=${genre}`
        if (year) {
          if (mediaType === "movie") {
            discoverUrl += `&primary_release_year=${year}`
          } else {
            discoverUrl += `&first_air_date_year=${year}`
          }
        }
        url = discoverUrl
        response = await fetch(url, { headers })
        break

      case "recommendations":
        if (!id) {
          return NextResponse.json({ error: "ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/${mediaType}/${id}/recommendations?language=pl-PL&page=${page}`
        response = await fetch(url, { headers })
        break

      case "similar":
        if (!id) {
          return NextResponse.json({ error: "ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/${mediaType}/${id}/similar?language=pl-PL&page=${page}`
        response = await fetch(url, { headers })
        break

      case "lists":
        // Get user's lists (requires session)
        url = `${TMDB_BASE_URL}/account/{account_id}/lists?api_key=${TMDB_API_KEY}&page=${page}`
        response = await fetch(url, { headers })
        break

      case "list_details":
        if (!listId) {
          return NextResponse.json({ error: "List ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/list/${listId}?language=pl-PL`
        response = await fetch(url, { headers })
        break

      case "person":
        if (!id) {
          return NextResponse.json({ error: "ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/person/${id}?language=pl-PL&append_to_response=movie_credits,tv_credits`
        response = await fetch(url, { headers })
        break

      case "collection":
        if (!id) {
          return NextResponse.json({ error: "ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/collection/${id}?language=pl-PL`
        response = await fetch(url, { headers })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.status_message || "TMDB API error" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("TMDB API error:", error)
    return NextResponse.json({ error: "Failed to fetch from TMDB" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { action, mediaType, mediaId, rating, listId, sessionId } = body

  if (!TMDB_API_KEY || !TMDB_READ_TOKEN) {
    return NextResponse.json({ error: "TMDB API keys not configured" }, { status: 500 })
  }

  try {
    let url: string
    let response: Response
    let requestBody: Record<string, unknown>

    switch (action) {
      case "rate":
        if (!mediaId || rating === undefined) {
          return NextResponse.json({ error: "Media ID and rating required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/${mediaType || "movie"}/${mediaId}/rating?api_key=${TMDB_API_KEY}`
        if (sessionId) url += `&session_id=${sessionId}`
        requestBody = { value: rating }
        response = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        break

      case "add_to_list":
        if (!listId || !mediaId) {
          return NextResponse.json({ error: "List ID and media ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/list/${listId}/add_item?api_key=${TMDB_API_KEY}`
        if (sessionId) url += `&session_id=${sessionId}`
        requestBody = { media_id: mediaId }
        response = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        break

      case "remove_from_list":
        if (!listId || !mediaId) {
          return NextResponse.json({ error: "List ID and media ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/list/${listId}/remove_item?api_key=${TMDB_API_KEY}`
        if (sessionId) url += `&session_id=${sessionId}`
        requestBody = { media_id: mediaId }
        response = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        break

      case "create_list":
        const { name, description } = body
        if (!name) {
          return NextResponse.json({ error: "List name required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/list?api_key=${TMDB_API_KEY}`
        if (sessionId) url += `&session_id=${sessionId}`
        requestBody = { name, description: description || "", language: "pl" }
        response = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        break

      case "add_to_watchlist":
        if (!mediaId) {
          return NextResponse.json({ error: "Media ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/account/{account_id}/watchlist?api_key=${TMDB_API_KEY}`
        if (sessionId) url += `&session_id=${sessionId}`
        requestBody = {
          media_type: mediaType || "movie",
          media_id: mediaId,
          watchlist: true,
        }
        response = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        break

      case "add_to_favorites":
        if (!mediaId) {
          return NextResponse.json({ error: "Media ID required" }, { status: 400 })
        }
        url = `${TMDB_BASE_URL}/account/{account_id}/favorite?api_key=${TMDB_API_KEY}`
        if (sessionId) url += `&session_id=${sessionId}`
        requestBody = {
          media_type: mediaType || "movie",
          media_id: mediaId,
          favorite: true,
        }
        response = await fetch(url, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        })
        break

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.status_message || "TMDB API error" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("TMDB API error:", error)
    return NextResponse.json({ error: "Failed to post to TMDB" }, { status: 500 })
  }
}
