"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { STORIES } from "@/lib/mock-data";
import { listStories, isRemoteApiEnabled } from "@/lib/api/catalog";
import type { StoryItem } from "@/lib/types";
import { StoryViewer } from "./StoryViewer";

export function StoriesStrip() {
  const [stories, setStories] = useState<StoryItem[]>(
    isRemoteApiEnabled() ? [] : STORIES
  );
  const [activeStoryIndex, setActiveStoryIndex] = useState<number | null>(null);
  const [seenStories, setSeenStories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isRemoteApiEnabled()) {
      setStories(STORIES);
      return;
    }
    let cancelled = false;
    listStories()
      .then((items) => {
        if (!cancelled) setStories(items.length ? items : []);
      })
      .catch(() => {
        if (!cancelled) setStories([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleOpenStory = (index: number) => {
    setActiveStoryIndex(index);
    setSeenStories((prev) => new Set(prev).add(stories[index].id));
  };

  const handleCloseStory = () => {
    setActiveStoryIndex(null);
  };

  const handleNextStory = () => {
    if (activeStoryIndex !== null && activeStoryIndex < stories.length - 1) {
      const next = activeStoryIndex + 1;
      setActiveStoryIndex(next);
      setSeenStories((prev) => new Set(prev).add(stories[next].id));
    } else {
      handleCloseStory();
    }
  };

  if (!stories.length) return null;

  return (
    <>
      <div className="px-4 py-4">
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-1">
          {stories.map((story, i) => {
            const seen = seenStories.has(story.id);
            return (
              <button
                key={story.id}
                type="button"
                onClick={() => handleOpenStory(i)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0"
              >
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
                <span className="font-sans text-[10px] font-medium text-[#4A4A4A] max-w-[72px] text-center leading-tight line-clamp-2">
                  {story.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {activeStoryIndex !== null && stories[activeStoryIndex] && (
        <StoryViewer
          story={stories[activeStoryIndex]}
          onClose={handleCloseStory}
          onNext={handleNextStory}
        />
      )}
    </>
  );
}
