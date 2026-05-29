import { NextRequest, NextResponse } from 'next/server';
  
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  
  if (!endpoint) {
    return NextResponse.json({ error: 'Missing endpoint parameter' }, { status: 400 });
  }

  // Блокируем нерабочие endpoints
  if (endpoint.includes('/trending')) {
    return NextResponse.json(
      { error: 'Endpoint not available', message: 'Use /coins with orderBy parameter instead' }, 
      { status: 400 }
    );
  }

  const baseUrl = 'https://frontend-api-v3.pump.fun';
  const url = `${baseUrl}${endpoint}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Pump.fun API error (${response.status}):`, errorText);
      return NextResponse.json(
        { error: `Pump.fun API error: ${response.status}`, details: errorText }, 
        { status: response.status }
      );
    }

    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      console.error('Non-JSON response:', text);
      return NextResponse.json({ error: 'Non-JSON response from Pump.fun' }, { status: 500 });
    }
    
    console.log('Proxy response:', data);
    
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Error proxying to Pump.fun API:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
