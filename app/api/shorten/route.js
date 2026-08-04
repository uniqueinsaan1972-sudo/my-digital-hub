import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetUrl = searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    const apiKey = process.env.GPLINKS_API_KEY;
    const apiUrl = `https://api.gplinks.com/api?api=${apiKey}&url=${encodeURIComponent(targetUrl)}&format=text`;

    const res = await fetch(apiUrl);
    const shortUrl = (await res.text()).trim();

    if (!shortUrl || !shortUrl.startsWith('http')) {
      return NextResponse.json({ shortUrl: targetUrl });
    }

    return NextResponse.json({ shortUrl });
  } catch (error) {
    console.error('Shorten error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}