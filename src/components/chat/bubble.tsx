"use client";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Message } from "ai";
import { Grid } from "react-loader-spinner";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm"
import Image from "next/image";
import { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import { useRef } from "react";

export default function Bubble({
  message,
  loading = false,
}: {
  message: Message;
  loading?: boolean;
}) {
  console.log(message.content)
  return (
    <div
      key={message.id}
      className="flex gap-3 my-4 text-gray-600 text-sm flex-1"
    >
      {message.role === "user" && (
        <Avatar className="w-8 h-8">
          <div className="rounded-full bg-gray-100 border p-1">
            <svg
              stroke="none"
              fill="black"
              strokeWidth="0"
              viewBox="0 0 16 16"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10Z"></path>
            </svg>
          </div>
        </Avatar>
      )}
      {message.role === "assistant" && (
        <Avatar className="w-8 h-8 border">
          {/* <AvatarFallback>M</AvatarFallback> */}
          <Image
            src="/hawana_logo.jpeg"
            width={500}
            height={500}
            alt="Muriya"
          />
          {/* <div className={cn("rounded-full bg-gray-100 border p-1", loading && "animate-pulse")}>
            <svg
              stroke="none"
              fill="black"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
              height="20"
              width="20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
              ></path>
            </svg>
          </div> */}
        </Avatar>
      )}

      <div className="leading-relaxed">
        <span className="block font-bold text-gray-700">
          {message.role === "user" ? "You" : "AI"}{" "}
        </span>
        {!loading && (<ReactMarkdown
          className="prose mt-1 w-full break-words prose-p:leading-relaxed"
          remarkPlugins={[remarkGfm]}
          components={{
            // open links in new tab
            a: (props) => (
              <a {...props} target="_blank" rel="noopener noreferrer" />
            ),
          }}
        >
          {message.content}
        </ReactMarkdown>)}
        <PlayAIAudio aiResponse={message.content} />
        {loading && (
          <Grid
            height={12}
            width={12}
            radius={5}
            ariaLabel="grid-loading"
            color="#1a1a1a"
            ms-visible={true}
          />
        )}
      </div>
    </div>
  );
}


export function PlayAIAudio({ aiResponse }: { aiResponse: string }) {
  let modelId = "eleven_multilingual_v2";
  let voiceId = "21m00Tcm4TlvDq8ikWAM";

  const mediaSource = useRef(new MediaSource());
  const audioElement = useRef(new Audio());
  const [playingResponse, setPlayingResponse] = useState<boolean>(false);

  audioElement.current.src = URL.createObjectURL(mediaSource.current);
  audioElement.current.controls = true;

  const stopAudio = () => {
    audioElement.current.pause();
    audioElement.current.currentTime = 0;
    setPlayingResponse(false);
  };

  const playAIResponse = async () => {
    if (playingResponse) {
      stopAudio();
      return;
    }

    setPlayingResponse(true);

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`,
      {
        method: "POST",
        headers: {
          accept: "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": process.env
            .NEXT_PUBLIC_ELEVENLABS_API_KEY as string,
        },
        body: JSON.stringify({
          text: aiResponse,
          model_id: modelId,
        }),
      },
    );

    if (!response.ok) {
      // Handle response error (e.g., rate limit) here
      console.error('Error fetching audio:', response.statusText);
      setPlayingResponse(false);
      return;
    }

    const reader = response.body.getReader();

    // Ensure the media source is in an 'open' state
    if (mediaSource.current.readyState !== 'open') {
      console.error('Media source not open');
      return;
    }

    const sourceBuffer = mediaSource.current.addSourceBuffer('audio/mpeg');

    const pump = async () => {
      const { value, done } = await reader.read();

      if (done) {
        // Safeguard against media source not being open
        if (mediaSource.current.readyState === 'open') {
          mediaSource.current.endOfStream();
        }
        return;
      }

      // Safeguard against source buffer removal
      if (sourceBuffer.updating || mediaSource.current.readyState !== 'open') {
        await new Promise(resolve => sourceBuffer.addEventListener('updateend', resolve, { once: true }));
      }

      sourceBuffer.appendBuffer(value);
      await pump(); // recursively call the pump to fetch the next chunk
    };

    audioElement.current.play().catch(e => {
      console.error('Play request was interrupted:', e.message);
      setPlayingResponse(false);
    });

    // Start the pump to fetch and append data
    pump().catch(e => {
      console.error('Error while fetching and appending audio chunks:', e.message);
      setPlayingResponse(false);
    });
  };

  return (
    <Button onClick={async () => await playAIResponse()}>
      {playingResponse ? (
        <X className="mr-2 h-4 w-4" />
      ) : (
        <PlayCircle className="mr-2 h-4 w-4" />
      )}
    </Button>
  );
}
