"use client";
import React from "react";
import { useState } from "react";
import { PlayCircle, X } from "lucide-react";
import { Button } from "../ui/button";
import { useRef } from "react";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"



export function PlayAIAudio({ aiResponse }: { aiResponse: string }) {

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
            "/api/text-to-speech",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ aiResponse }),
            });


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
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    {playingResponse ? (
                        <X className="mr-2 h-4 w-4 hover:animate-pulse cursor-pointer" onClick={async () => await playAIResponse()} />
                    ) : (
                        <PlayCircle className="mr-2 h-4 w-4 hover:animate-pulse cursor-pointer" onClick={async () => await playAIResponse()} />
                    )}        
                </TooltipTrigger>
                <TooltipContent>

                {playingResponse ? (
                        <p>Stop</p>
                    ) : (
                        <p>Click to play</p>
                    )}                  </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}