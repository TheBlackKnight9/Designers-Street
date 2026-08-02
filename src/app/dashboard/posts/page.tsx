"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/dashboard/Toast";
import { sanitizeImageUrl } from "@/lib/utils/image-url";

type Post = {
  id: string;
  type: string;
  image: string;
  videoUrl: string | null;
  caption: string;
  tag: string | null;
  likesCount: number;
  commentsCount: number;
  productTag: any;
  createdAt: string;
};

export default function DashboardPostsPage() {
  const { push } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchPosts() {
    try {
      const res = await fetch("/api/dashboard/posts");
      const data = await res.json();
      if (data?.ok && Array.isArray(data.data?.posts)) {
        setPosts(data.data.posts);
      }
    } catch {
      push("Failed to load posts", "err");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPosts();
  }, []);

  async function deletePost(id: string) {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/dashboard/posts/${id}`, { method: "DELETE" });
      if (res.ok) {
        push("Post deleted", "ok");
        await fetchPosts();
      }
    } catch {
      push("Failed to delete post", "err");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-charcoal">
            Content Studio &amp; Feed Posts
          </h1>
          <p className="text-xs text-stone mt-1">
            Publish high-engagement media and product-tagged posts directly to the customer feed
          </p>
        </div>

        <Link
          href="/dashboard/posts/new"
          className="px-5 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full shadow-sm hover:bg-black transition-colors"
        >
          + Create New Post
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-64 rounded-2xl bg-mist animate-pulse" />
          <div className="h-64 rounded-2xl bg-mist animate-pulse" />
          <div className="h-64 rounded-2xl bg-mist animate-pulse" />
        </div>
      ) : posts.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-cloud bg-mist/30 space-y-3">
          <p className="text-sm font-semibold text-charcoal">No posts published yet</p>
          <p className="text-xs text-stone">Share behind-the-scenes craft stories and tagged luxury pieces</p>
          <Link
            href="/dashboard/posts/new"
            className="px-6 py-2.5 bg-charcoal text-paper font-sans text-xs font-bold uppercase tracking-wider rounded-full inline-block"
          >
            Create Your First Post
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-3xl border border-cloud overflow-hidden shadow-xs space-y-3">
              <div className="relative aspect-4/5 bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={sanitizeImageUrl(post.image)} alt="" className="w-full h-full object-cover" />
                {post.videoUrl && (
                  <span className="absolute top-2 right-2 px-2 py-1 bg-black/70 text-white text-[9px] font-bold uppercase rounded-md backdrop-blur-xs">
                    ▶ Video
                  </span>
                )}
                {post.tag && (
                  <span className="absolute bottom-2 left-2 px-2.5 py-1 bg-white/90 text-charcoal text-[9px] font-extrabold uppercase rounded-md shadow-xs">
                    {post.tag}
                  </span>
                )}
              </div>

              <div className="p-4 pt-1 space-y-2">
                <p className="text-xs text-charcoal line-clamp-2 font-medium">{post.caption}</p>

                <div className="flex items-center justify-between text-[11px] text-stone pt-2 border-t border-cloud/60">
                  <div className="flex items-center gap-3">
                    <span>❤️ {post.likesCount}</span>
                    <span>💬 {post.commentsCount}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deletePost(post.id)}
                    className="text-stone hover:text-red-700 underline text-[10px]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
