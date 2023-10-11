"use client";
import React from "react";
import { Message } from "ai/react";

interface ExampleQuestionsProps {
    messages: Message[];
    setInput: React.Dispatch<React.SetStateAction<string>>;
    inputRef: React.RefObject<HTMLInputElement>;
}

export default function ExampleQuestions({ messages, setInput, inputRef }: ExampleQuestionsProps) {
  const examples = [
    "What is Hawana Salalah?",
    "What is there to do in Hawana Salalah?",
    "What hotels are available and how much do they cost?",
  ];

  return (
    <>
      {messages.length === 0 && (
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
    </>
  );
}
