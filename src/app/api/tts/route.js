import { NextResponse } from 'next/server';

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_TTS_API_KEY;
    
    if (!apiKey) {
      console.error('TTS API key not configured');
      return NextResponse.json(
        { error: 'TTS API key not configured' },
        { status: 500 }
      );
    }

    console.log(`[TTS] Generating for ${text.length} chars`);

    // Call Google Cloud Text-to-Speech API with optimized settings
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice: {
            languageCode: 'id-ID',
            name: 'id-ID-Standard-A', // Female voice
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
            speakingRate: 1.0, // Normal speed for faster playback
            pitch: 0.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('[TTS] API Error:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to generate speech', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (!data.audioContent) {
      console.error('[TTS] No audio content in response');
      return NextResponse.json(
        { error: 'No audio content received from TTS API' },
        { status: 500 }
      );
    }

    const duration = Date.now() - startTime;
    console.log(`[TTS] Generated in ${duration}ms (${data.audioContent.length} chars)`);

    // Return the base64 audio
    return NextResponse.json({
      audioContent: data.audioContent,
    });

  } catch (error) {
    console.error('TTS Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
