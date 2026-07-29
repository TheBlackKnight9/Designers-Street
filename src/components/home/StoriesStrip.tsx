"use client";

import Image from "next/image";
import { STORIES } from "@/lib/mock-data";
import { useState } from "react";
import { StoryViewer } from "./StoryViewer";

export function StoriesStrip() {
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setSeenStories((prev) => new Set(prev).add(STORIES[index].id));
  };

  const handleCloseStory = () => {
    setActiveStoryIndex(null);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < STORIES.length - 1) {
      const next = activeStoryIndex + 1;
      setActiveStoryIndex(next);
      setSeenStories((prev) => new Set(prev).add(STORIES[next].id));
    } else {
      handleCloseStory();
    }
  };

  return (
    <>
      <div className="px-4 py-4">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
          {STORIES.map((story, i) => {
            const seen = seenStories.has(story.id);
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleOpenStory(i)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
                {/* Ring + Avatar */}
                <div className={seen ? "story-ring--seen" : "story-ring"}>
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-[#F0F0F0] border-2 border-[#FAFAFA]">
                    <Image
                      src={story.designerLogo}
                      alt={story.designerName}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                </div>
                {/* Label */}
                <span className="font-sans text-[10px] font-medium text-[#4A4A4A] max-w-[72px] text-center leading-tight line-clamp-2">
                  {story.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Story Viewer Overlay */}
      {activeStoryIndex !== null && (
        <StoryViewer
          story={STORIES[activeStoryIndex]}
          onClose={handleCloseStory}
          onNext={handleNextStory}
        />
      )}
    </>
  );
}
