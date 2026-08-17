import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    let modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    if (modelName.includes('1.0-pro-vision')) modelName = "gemini-1.5-flash";

    if (!apiKey) {
      return NextResponse.json({
        provider: "gemini",
        configured: false,
        model: modelName,
        available: false,
        error: "GEMINI_API_KEY is not configured on the server."
      }, { status: 500 });
    }

    // Verify model using the REST API to check available models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = "Failed to communicate with Gemini API";
      try {
        const errJson = JSON.parse(errorText);
        errorMessage = errJson.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText;
      }
      return NextResponse.json({
        provider: "gemini",
        configured: true,
        model: modelName,
        available: false,
        error: errorMessage
      }, { status: 500 });
    }

    const data = await response.json();
    const models = data.models || [];
    
    // Check if our exact model exists in the list
    // Note: The API returns model names with the prefix 'models/', e.g., 'models/gemini-1.5-flash'
    const targetModelPath = `models/${modelName}`;
    const foundModel = models.find((m: any) => m.name === targetModelPath);

    if (foundModel) {
      const supportedMethods = foundModel.supportedGenerationMethods || [];
      const supportsGenerateContent = supportedMethods.includes('generateContent');

      return NextResponse.json({
        provider: "gemini",
        configured: true,
        model: modelName,
        available: true,
        imageInput: true, // Typically implied if the model is a flash/pro multimodal variant
        structuredOutput: true,
        details: {
          displayName: foundModel.displayName,
          version: foundModel.version,
          supportsGenerateContent
        }
      });
    } else {
      return NextResponse.json({
        provider: "gemini",
        configured: true,
        model: modelName,
        available: false,
        error: `Model ${modelName} is not available for this API key or API version.`
      }, { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({
      provider: "gemini",
      configured: false,
      available: false,
      error: error.message || "Unknown error during Gemini health check."
    }, { status: 500 });
  }
}
