"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PostForm from "@/components/blog/PostForm";
import { Post } from "@/types/post.types";

export default function NewPostPage() {
  const router = useRouter();

  const handleSuccess = (post: Post) => {
    router.push(`/admin/blog/posts/${post.id}/edit`);
  };

  return (
    <div className="space-y-4 p-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">New Post</h2>
        <p className="text-sm text-gray-500">Create and publish a new blog post</p>
      </div>
      <PostForm
        onSuccess={handleSuccess}
        onCancel={() => router.push("/admin/blog/posts")}
      />
    </div>
  );
}
