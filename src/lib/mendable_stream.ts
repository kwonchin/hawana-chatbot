import { AIStream, AIStreamCallbacksAndOptions, experimental_StreamData } from "ai";

export interface MendableStreamCallbacks extends AIStreamCallbacksAndOptions {
  onMessage?: (data: string) => Promise<void>;
  onToken?: (data: string) => Promise<void>;
}

function parseMendableStream(): (data: string) => string | void {
  return (data) => {
    const parsedData = JSON.parse(data);
    const chunk = parsedData.chunk;

    // TODO: handle source and message_id to provide sources to the users
    // More info here: https://docs.mendable.ai/mendable-api/chat
    if (chunk === "<|message_id|>") {
      return;
    }
    if (chunk === "<|source|>") {
      const links = parsedData.metadata.map((meta) => { return meta.link;})
      let formattedString = "\n**Verifed Sources:**"
      links.forEach((link: string) => { formattedString += `\n- ${link}` })
      formattedString += "\n --- \n"
      return formattedString
    }
    if (chunk) {
      return chunk;
    }
  };
}

export async function MendableStream(
  data: any,
  callbacks?: MendableStreamCallbacks
) {
  const url = "https://api.mendable.ai/v0/mendableChat";
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "text/event-stream",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Response error: " + (await response.text()));
  }

  // Instantiate the data
  const streamData = new experimental_StreamData();


  const aiStream = AIStream(response, parseMendableStream(), {
    ...callbacks,
    onToken(message) {
      if (typeof(message) === "object") {
        // console.log("appending message", message)
        // streamData.append(message);
      }
    },
    onFinal(completion) {
      console.log("closing stream data")
      // streamData.close();
    },
    experimental_streamData: true,
  });
  return {
    aiStream,
    streamData,
  }
}
