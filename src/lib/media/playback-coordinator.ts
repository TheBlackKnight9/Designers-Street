type PauseFn = () => void;

let activeId: string | null = null;
const registry = new Map<string, PauseFn>();

/**
 * App-wide single active video: registering play pauses any other instance.
 */
export const MediaPlaybackCoordinator = {
  register(id: string, pause: PauseFn) {
    registry.set(id, pause);
    return () => {
      registry.delete(id);
      if (activeId === id) activeId = null;
    };
  },

  claim(id: string) {
    if (activeId && activeId !== id) {
      const pause = registry.get(activeId);
      pause?.();
    }
    activeId = id;
  },

  release(id: string) {
    if (activeId === id) activeId = null;
  },

  getActiveId() {
    return activeId;
  },
};
