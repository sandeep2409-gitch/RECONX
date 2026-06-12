import { NextResponse } from 'next/server';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json({ error: 'Missing target url parameter' }, { status: 400 });
  }

  try {
    // Perform server-side fetch. This is not subject to CORS restrictions.
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      },
      redirect: 'follow',
      next: { revalidate: 60 } // Cache for 60 seconds
    });

    const isHeaderMode = searchParams.get('mode') === 'headers';

    if (isHeaderMode) {
      // Return response headers in a JSON wrapper
      const headersObj = {};
      response.headers.forEach((value, key) => {
        headersObj[key] = value;
      });

      return NextResponse.json({
        contents: '',
        status: {
          http_code: response.status,
          headers: headersObj
        }
      });
    } else {
      // Return raw content
      const contentType = response.headers.get('content-type') || '';
      
      if (contentType.includes('application/json')) {
        const json = await response.json();
        return NextResponse.json(json);
      } else {
        const text = await response.text();
        return new Response(text, {
          headers: { 'Content-Type': contentType || 'text/plain' }
        });
      }
    }
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json({ error: `Proxy failed to fetch target: ${error.message}` }, { status: 502 });
  }
}
