"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function CommentSection({ lessonId }: { lessonId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const userId = (session?.user as any)?.id;
  const role = (session?.user as any)?.role;

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    const res = await fetch(`/api/comments?lessonId=${lessonId}`);
    const data = await res.json();
    setComments(data);
  };

  const handleSubmit = async () => {
    if (!text.trim()) return setError("Comment cannot be empty");

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId, text }),
    });

    if (res.ok) {
      setText("");
      setError("");
      fetchComments();
    }
  };

  const handleDelete = async (commentId: string) => {
    const res = await fetch(`/api/comments?id=${commentId}`, {
      method: "DELETE",
    });

    if (res.ok) fetchComments();
  };

  return (
    <div className="mt-6 border-t pt-6">
      <h3 className="font-semibold text-gray-700 mb-4">
        Comments ({comments.length})
      </h3>

      {/* Comment Input */}
      <div className="flex gap-2 mb-6">
        <textarea
          placeholder="Ask a question or leave a comment..."
          className="flex-1 border rounded p-2 text-sm resize-none h-20"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 rounded text-sm hover:bg-blue-700 self-end h-10"
        >
          Post
        </button>
      </div>
      {error && <p className="text-red-500 text-xs mb-4">{error}</p>}

      {/* Comments List */}
      {comments.length === 0 ? (
        <p className="text-gray-400 text-sm">No comments yet. Be the first to ask a question!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm flex-shrink-0">
                {comment.user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{comment.user.name}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    comment.user.role === "TEACHER" ? "bg-purple-100 text-purple-600" :
                    comment.user.role === "ADMIN" ? "bg-red-100 text-red-600" :
                    "bg-gray-100 text-gray-500"
                  }`}>
                    {comment.user.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700">{comment.text}</p>
                {(comment.userId === userId || role === "ADMIN" || role === "TEACHER") && (
                  <button
                    onClick={() => handleDelete(comment.id)}
                    className="text-xs text-red-400 hover:underline mt-1"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}