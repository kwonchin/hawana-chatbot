"use client";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChat } from "ai/react";
import { Grid } from "react-loader-spinner";
import Bubble from "./chat/bubble";
import { welcomeMessage } from "@/lib/strings";

export default function Chat() {
  const examples = [
    "What hotels are there in Hawana Salalah?",
    "What is there to do in Hawana Salalah?",
    "How much can I expect to pay staying in Hawana Salalah?",
  ];

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading,
  } = useChat();

  // Create a reference to the scroll area
  const scrollAreaRef = useRef<null | HTMLDivElement>(null);

  // Create a reference to the input
  const inputRef = useRef<null | HTMLInputElement>(null);

  useEffect(() => {
    // Scroll to the bottom when the messages change
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  return (
    <Card className="w-[550px]">
      <CardHeader>
        <CardTitle className="text-lg">Ask me anything!</CardTitle>
        <CardDescription className=" leading-3">
          Powered by Kwonchin
        </CardDescription>
      </CardHeader>
      <CardContent className="">
        <ScrollArea
          ref={scrollAreaRef}
          className="h-[450px] overflow-y-auto w-full spacy-y-4 pr-4"
        >
          <Bubble
            message={{
              role: "assistant",
              content: welcomeMessage,
              id: "initialai",
            }}
          />
          { messages.length === 0 && (
            <div className="flex flex-col space-y-4 border-t border-gray-200 bg-gray-50 p-7 sm:p-10">
              {examples.map((example, i) => (
                <button
                  key={i}
                  className="rounded-md border border-gray-200 bg-white px-5 py-3 text-left text-sm text-gray-500 transition-all duration-75 hover:border-black hover:text-gray-700 active:bg-gray-50"
                  onClick={() => {
                    setInput(example);
                    inputRef.current?.focus();
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          )}
          {messages.map((message) => (
            <Bubble key={message.id} message={message} />
          ))}
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form
          onSubmit={handleSubmit}
          className="flex items-center justify-center w-full space-x-2"
        >
          <Input
            ref={inputRef}
            placeholder="Type your message"
            value={input}
            onChange={handleInputChange}
          />
          <Button disabled={isLoading}>
            {isLoading ? (
              <div className="flex gap-2 items-center">
                <Grid
                  height={12}
                  width={12}
                  radius={5}
                  ariaLabel="grid-loading"
                  color="#fff"
                  ms-visible={true}
                />
                {"Loading..."}
              </div>
            ) : (
              "Send"
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
