import { StreamingTextResponse } from "ai";
import { MendableStream } from "@/lib/mendable_stream";
import { welcomeMessage } from "@/lib/strings";

export const runtime = "edge";

export async function POST(req: Request) {
  // Extract the `messages` from the body of the request
  const { messages } = await req.json();

  // question is on the last message
  const question = messages[messages.length - 1].content;
  messages.pop();

  const url = "https://api.mendable.ai/v0/newConversation";

  const mendableBody = {
    api_key: process.env.MENDABLE_API_KEY,
  };
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mendableBody),
    });

    const conversation_id = await r.json();

    const history = [];
    for (let i = 0; i < messages.length; i += 2) {
      history.push({
        prompt: messages[i].content,
        response: messages[i + 1].content,
      });
    }

    history.unshift({
      prompt: "",
      response: welcomeMessage,
    });

    const { aiStream, streamData } = await MendableStream({
      api_key: process.env.MENDABLE_API_KEY,
      question: question,
      history: history,
      conversation_id: conversation_id.conversation_id,
    });
    
    // return new StreamingTextResponse(aiStream, {}, streamData);
    // TODO: once this is api is working, we already have logic to update the data in mentable_stream.ts
    return new StreamingTextResponse(aiStream);
  } catch (e) {
    console.log(e);
  }
}
