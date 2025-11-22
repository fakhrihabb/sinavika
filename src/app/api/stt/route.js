import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_CLOUD_STT_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'STT API key not configured' },
        { status: 500 }
      );
    }

    // Convert audio file to base64
    const bytes = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(bytes).toString('base64');

    console.log('Audio file size:', bytes.byteLength, 'bytes');
    console.log('Base64 audio length:', base64Audio.length);

    // Call Google Cloud Speech-to-Text API
    const response = await fetch(
      `https://speech.googleapis.com/v1/speech:recognize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          config: {
            encoding: 'WEBM_OPUS',
            sampleRateHertz: 48000,
            languageCode: 'id-ID',
            enableAutomaticPunctuation: true,
            model: 'default',
            audioChannelCount: 1,
          },
          audio: {
            content: base64Audio,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('STT API Error Response:', error);
      return NextResponse.json(
        { error: error.error?.message || 'Failed to transcribe audio', details: error },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('STT API Response:', JSON.stringify(data, null, 2));

    // Extract transcription
    if (!data.results || data.results.length === 0) {
      console.log('No results from STT API');
      return NextResponse.json({
        transcript: '',
        confidence: 0,
      });
    }

    const transcript = data.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');
    
    const confidence = data.results[0].alternatives[0].confidence || 0;

    console.log('Transcription:', transcript, 'Confidence:', confidence);

    return NextResponse.json({
      transcript,
      confidence,
    });

  } catch (error) {
    console.error('STT Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
