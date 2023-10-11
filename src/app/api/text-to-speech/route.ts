import { Configuration, OpenAIApi } from "openai-edge";
import { StreamingTextResponse } from "ai";
import { MendableStream } from "@/lib/mendable_stream";
import { welcomeMessage } from "@/lib/strings";

export const runtime = "edge";

export async function POST(req: Request) {

    let modelId = "eleven_multilingual_v2";
    let voiceId = "21m00Tcm4TlvDq8ikWAM";

    // Extract the `messages` from the body of the request
    const { aiResponse } = await req.json();
    let response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
        {
            method: "POST",
            headers: {
                accept: "audio/mpeg",
                "Content-Type": "application/json",
                "xi-api-key": process.env.ELEVEN_LABS_API_KEY as string,
            },
            body: JSON.stringify({
                text: aiResponse,
                model_id: modelId,
            }),
        },
    )
    return response
}
