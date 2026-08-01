"use client";

import { useCallback, useEffect, useState } from "react";

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body?.ok === false) {
    const msg =
      body?.error?.message ||
      (res.status === 401 || res.status === 403
        ? "Sign in required"
        : "Request failed");
    const err = new Error(msg) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return body.data as T;
}

function authHintMessage(err: unknown, action: "like" | "follow"): string {
  const status = (err as { status?: number })?.status;
  const msg = err instanceof Error ? err.message : "";
  if (
    status === 401 ||
    status === 403 ||
    /sign in|unauthor|auth|session/i.test(msg)
  ) {
    return action === "like" ? "Sign in to like" : "Sign in to follow";
  }
  return msg || (action === "like" ? "Could not update like" : "Could not update follow");
}

export function useLike(options: {
  targetId: string;
  initialLiked?: boolean;
  initialCount?: number;
  mode?: "auto" | "product" | "post";
}) {
  const mode = options.mode ?? "auto";
  const [liked, setLiked] = useState(Boolean(options.initialLiked));
  const [count, setCount] = useState(options.initialCount ?? 0);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLiked(Boolean(options.initialLiked));
  }, [options.initialLiked, options.targetId]);

  useEffect(() => {
    setCount(options.initialCount ?? 0);
  }, [options.initialCount, options.targetId]);

  const toggle = useCallback(async () => {
    if (pending) return;
    const prevLiked = liked;
    const prevCount = count;
    setLiked(!prevLiked);
    setCount(Math.max(0, prevCount + (prevLiked ? -1 : 1)));
    setPending(true);
    try {
      const path =
        mode === "product"
          ? `/api/products/${encodeURIComponent(options.targetId)}/like`
          : `/api/posts/${encodeURIComponent(options.targetId)}/like`;
      const data = await apiJson<{ liked: boolean; likesCount: number }>(path, {
        method: "POST",
      });
      setLiked(data.liked);
      setCount(data.likesCount);
    } catch (err) {
      setLiked(prevLiked);
      setCount(prevCount);
      throw new Error(authHintMessage(err, "like"));
    } finally {
      setPending(false);
    }
  }, [pending, liked, count, mode, options.targetId]);

  return { liked, count, toggle, pending };
}

export function useFollow(options: {
  designerId?: string | null;
  initialFollowing?: boolean;
  initialFollowers?: number;
}) {
  const [following, setFollowing] = useState(Boolean(options.initialFollowing));
  const [followersCount, setFollowersCount] = useState(
    options.initialFollowers ?? 0
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (options.initialFollowing !== undefined) {
      setFollowing(Boolean(options.initialFollowing));
    }
  }, [options.initialFollowing, options.designerId]);

  useEffect(() => {
    if (options.initialFollowers !== undefined) {
      setFollowersCount(options.initialFollowers);
    }
  }, [options.initialFollowers, options.designerId]);

  const toggle = useCallback(async () => {
    if (!options.designerId || pending) return;
    const prev = following;
    setFollowing(!prev);
    setFollowersCount((c) => Math.max(0, c + (prev ? -1 : 1)));
    setPending(true);
    try {
      const data = await apiJson<{ following: boolean; followersCount: number }>(
        `/api/designers/${encodeURIComponent(options.designerId)}/follow`,
        { method: "POST" }
      );
      setFollowing(data.following);
      setFollowersCount(data.followersCount);
    } catch (err) {
      setFollowing(prev);
      setFollowersCount((c) => Math.max(0, c + (prev ? 1 : -1)));
      throw new Error(authHintMessage(err, "follow"));
    } finally {
      setPending(false);
    }
  }, [options.designerId, pending, following]);

  return { following, followersCount, toggle, pending };
}
