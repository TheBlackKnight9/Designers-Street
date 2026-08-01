"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format-relative";

type CommentUser = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
};

type CommentRow = {
  id: string;
  body: string;
  createdAt: string;
  userId: string;
  parentId: string | null;
  user: CommentUser;
  _count?: { replies: number };
};

const EMOJIS = ["❤️", "🔥", "👏", "✨", "😍"] as const;

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });
  const body = await res.json();
  if (!res.ok || body?.ok === false) {
    throw new Error(body?.error?.message || "Request failed");
  }
  return body.data as T;
}

function highlightMentions(text: string) {
  const parts = text.split(/(@[\w.-]+)/g);
  return parts.map((part, i) =>
    part.startsWith("@") ? (
      <span key={i} className="font-semibold text-[#2B2B2B]">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function isCreatorComment(
  c: CommentRow,
  designerName?: string,
  designerHandle?: string
) {
  const name = (c.user?.name || "").toLowerCase();
  if (designerName && name.includes(designerName.toLowerCase().slice(0, 12))) {
    return true;
  }
  if (designerHandle && name.includes(designerHandle.toLowerCase())) {
    return true;
  }
  return false;
}

export function CommentPanel({
  postId,
  onCountChange,
  designerName,
  designerHandle,
}: {
  postId: string;
  onCountChange?: (count: number) => void;
  designerName?: string;
  designerHandle?: string;
}) {
  const [items, setItems] = useState<CommentRow[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, CommentRow[]>>({});
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [meId, setMeId] = useState<string | null>(null);
  const [reactions, setReactions] = useState<
    Record<string, Partial<Record<(typeof EMOJIS)[number], number>>>
  >({});
  const [pinnedId, setPinnedId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/me")
      .then((r) => r.json())
      .then((body) => {
        if (body?.ok && body.data?.user?.id) setMeId(body.data.user.id);
      })
      .catch(() => undefined);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const page = await apiJson<{
        items: CommentRow[];
        nextCursor: string | null;
      }>(`/api/posts/${encodeURIComponent(postId)}/comments?limit=20`);
      const list = page.items || [];
      setItems(list);
      setNextCursor(page.nextCursor ?? null);
      setReplies({});
      const creator = list.find((c) =>
        isCreatorComment(c, designerName, designerHandle)
      );
      setPinnedId(creator?.id ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load comments");
    } finally {
      setLoading(false);
    }
  }, [postId, designerName, designerHandle]);

  useEffect(() => {
    void load();
  }, [load]);

  const sortedItems = useMemo(() => {
    if (!pinnedId) return items;
    const pinned = items.filter((c) => c.id === pinnedId);
    const rest = items.filter((c) => c.id !== pinnedId);
    return [...pinned, ...rest];
  }, [items, pinnedId]);

  async function loadMore() {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await apiJson<{
        items: CommentRow[];
        nextCursor: string | null;
      }>(
        `/api/posts/${encodeURIComponent(postId)}/comments?limit=20&cursor=${encodeURIComponent(nextCursor)}`
      );
      setItems((prev) => [...prev, ...(page.items || [])]);
      setNextCursor(page.nextCursor ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load more");
    } finally {
      setLoadingMore(false);
    }
  }

  async function loadReplies(parentId: string) {
    try {
      const page = await apiJson<{ items: CommentRow[] }>(
        `/api/posts/${encodeURIComponent(postId)}/comments?limit=30&parentId=${encodeURIComponent(parentId)}`
      );
      setReplies((prev) => ({ ...prev, [parentId]: page.items || [] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load replies");
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const body = text.trim();
    if (!body) return;
    try {
      const result = await apiJson<{
        comment: CommentRow;
        commentsCount: number;
      }>(`/api/posts/${encodeURIComponent(postId)}/comments`, {
        method: "POST",
        body: JSON.stringify({ body, parentId: replyTo }),
      });
      setText("");
      const parent = replyTo;
      setReplyTo(null);
      onCountChange?.(result.commentsCount);
      if (parent) {
        await loadReplies(parent);
      } else {
        await load();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not post comment");
    }
  }

  async function onSaveEdit(id: string) {
    try {
      await apiJson(`/api/comments/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify({ body: editText }),
      });
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Edit failed");
    }
  }

  async function onDelete(id: string) {
    try {
      const result = await apiJson<{ commentsCount: number }>(
        `/api/comments/${encodeURIComponent(id)}`,
        { method: "DELETE" }
      );
      onCountChange?.(result.commentsCount);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  function react(id: string, emoji: (typeof EMOJIS)[number]) {
    setReactions((prev) => {
      const cur = prev[id] || {};
      return {
        ...prev,
        [id]: { ...cur, [emoji]: (cur[emoji] || 0) + 1 },
      };
    });
  }

  function insertMention() {
    if (!designerHandle) return;
    const mention = `@${designerHandle} `;
    setText((t) => (t.includes(mention.trim()) ? t : `${mention}${t}`.trimStart()));
  }

  function renderComment(c: CommentRow, nested = false) {
    const isOwner = meId && c.userId === meId;
    const creator = isCreatorComment(c, designerName, designerHandle);
    const pinned = c.id === pinnedId && !nested;
    return (
      <li
        key={c.id}
        className={`text-sm rounded-xl px-2 py-1.5 ${
          nested ? "ml-4 border-l-2 border-[#E0E0E0] pl-3" : ""
        } ${
          creator
            ? "bg-[#F7F3EA] border border-[#E8DFC8]"
            : pinned
              ? "bg-[#FAFAF7]"
              : ""
        }`}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-xs text-[#2B2B2B]">
            {c.user?.name || "Member"}
          </p>
          {creator && (
            <span className="rounded-full bg-[#2B2B2B] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white">
              Creator
            </span>
          )}
          {pinned && (
            <span className="text-[8px] font-bold uppercase tracking-wider text-[#9A8B6A]">
              Pinned
            </span>
          )}
          <span className="text-[10px] text-[#9A9A9A]">
            {formatRelativeTime(c.createdAt)}
          </span>
        </div>
        {editingId === c.id ? (
          <div className="mt-1 space-y-2">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full rounded-lg border border-cloud bg-mist px-2 py-1 text-xs"
              rows={2}
              maxLength={1000}
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSaveEdit(c.id)}
                className="text-[10px] uppercase tracking-wider underline"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-[10px] uppercase tracking-wider text-stone"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#4A4A4A] mt-0.5 leading-relaxed">
            {highlightMentions(c.body)}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => react(c.id, emoji)}
              className="text-[12px] opacity-70 hover:opacity-100 active:scale-110 transition-all"
              aria-label={`React ${emoji}`}
            >
              {emoji}
              {reactions[c.id]?.[emoji] ? (
                <span className="ml-0.5 text-[9px] text-[#7A7A7A]">
                  {reactions[c.id][emoji]}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-3 mt-1">
          <button
            type="button"
            onClick={() => setReplyTo(c.id)}
            className="text-[10px] uppercase tracking-wider text-stone"
          >
            Reply
          </button>
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => {
                  setEditingId(c.id);
                  setEditText(c.body);
                }}
                className="text-[10px] uppercase tracking-wider text-stone"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => onDelete(c.id)}
                className="text-[10px] uppercase tracking-wider text-stone"
              >
                Delete
              </button>
            </>
          )}
          {(c._count?.replies ?? 0) > 0 && !nested && (
            <button
              type="button"
              onClick={() => void loadReplies(c.id)}
              className="text-[10px] uppercase tracking-wider text-stone underline"
            >
              {c._count?.replies} replies
            </button>
          )}
        </div>
        {replies[c.id]?.length ? (
          <ul className="mt-2 space-y-2">
            {replies[c.id].map((r) => renderComment(r, true))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div className="border-t border-white/40 px-4 py-3 space-y-3">
      <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-[#7A7A7A]">
        Comments
      </p>
      {loading && <p className="text-xs text-[#7A7A7A]">Loading…</p>}
      {error && (
        <p className="text-xs text-red-700 bg-red-50 rounded-lg px-2 py-1">
          {error}
          {error.toLowerCase().includes("sign") ||
          error.toLowerCase().includes("auth") ? (
            <>
              {" "}
              <Link href="/account/login" className="underline">
                Sign in
              </Link>
            </>
          ) : null}
        </p>
      )}
      <ul className="space-y-3 max-h-72 overflow-y-auto">
        {sortedItems.map((c) => renderComment(c))}
      </ul>
      {nextCursor && (
        <button
          type="button"
          onClick={() => void loadMore()}
          disabled={loadingMore}
          className="text-[10px] uppercase tracking-wider underline text-[#7A7A7A]"
        >
          {loadingMore ? "Loading…" : "Load more comments"}
        </button>
      )}
      <form onSubmit={onSubmit} className="space-y-2">
        {replyTo && (
          <p className="text-[10px] text-stone">
            Replying…{" "}
            <button
              type="button"
              className="underline"
              onClick={() => setReplyTo(null)}
            >
              cancel
            </button>
          </p>
        )}
        {designerHandle && (
          <button
            type="button"
            onClick={insertMention}
            className="rounded-full bg-[#F0EDE6] px-2.5 py-1 text-[10px] font-semibold text-[#2B2B2B]"
          >
            @{designerHandle}
          </button>
        )}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={
            designerHandle
              ? `Add a comment… try @${designerHandle}`
              : "Add a comment…"
          }
          rows={2}
          maxLength={1000}
          className="w-full rounded-xl border border-cloud bg-mist px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-gold/30"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-[#2B2B2B] text-white text-[10px] font-bold uppercase tracking-wider rounded-full active:scale-[0.98] transition-transform"
        >
          Post
        </button>
      </form>
    </div>
  );
}
