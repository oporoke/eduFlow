"use client";

import { useState } from "react";

type AIAssistantProps = {
  onLessonGenerated?: (lesson: any) => void;
  onQuizGenerated?: (quiz: any) => void;
};

export default function AIAssistant({ onLessonGenerated, onQuizGenerated }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("lesson");
  const [topic, setTopic] = useState("");
  const [subject, setSubject] = useState("");
  const [grade, setGrade] = useState("");
  const [contentType, setContentType] = useState("TEXT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<any>(null);

  const generate = async () => {
    if (!topic) return setError("Topic is required");
    setLoading(true);
    setError("");
    setPreview(null);

    const res = await fetch("/api/ai/lesson", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, topic, subject, grade, contentType }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error);
    } else {
      setPreview(data);
    }
    setLoading(false);
  };

  const handleUse = () => {
    if (type === "lesson" && onLessonGenerated) onLessonGenerated(preview);
    if (type === "quiz" && onQuizGenerated) onQuizGenerated(preview);
    setOpen(false);
    setPreview(null);
    setTopic("");
  };

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:opacity-90"
      >
        🤖 AI Assistant
      </button>

      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold">🤖 AI Lesson Assistant</h2>
                <p className="text-gray-500 text-sm">Powered by Google Gemini</p>
              </div>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>

            {/* Type Selector */}
            <div className="flex gap-2 mb-4">
              {["lesson", "quiz", "summary"].map((t) => (
                <button
                  key={t}
                  onClick={() => { setType(t); setPreview(null); }}
                  className={`px-4 py-1.5 rounded text-sm capitalize border ${
                    type === t ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {t === "lesson" ? "📝 Lesson" : t === "quiz" ? "✏️ Quiz" : "📋 Summary"}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="space-y-3 mb-4">
              <input
                type="text"
                placeholder={type === "summary" ? "Paste lesson content to summarize..." : "Topic (e.g. Photosynthesis, Fractions, Kenya History)"}
                className="w-full border p-2 rounded text-sm"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />

              {type !== "summary" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Subject (e.g. Science, Maths)"
                      className="border p-2 rounded text-sm"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Grade (e.g. Grade 4, PP2)"
                      className="border p-2 rounded text-sm"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    />
                  </div>

                  {type === "lesson" && (
                    <select
                      className="w-full border p-2 rounded text-sm"
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                    >
                      <option value="TEXT">Text</option>
                      <option value="MIXED">Mixed</option>
                    </select>
                  )}
                </>
              )}
            </div>

            {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

            <button
              onClick={generate}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 mb-4"
            >
              {loading ? "Generating..." : "✨ Generate"}
            </button>

            {/* Preview */}
            {preview && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="font-semibold mb-3">Preview</h3>

                {type === "lesson" && (
                  <div>
                    <p className="font-medium text-sm mb-2">{preview.title}</p>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{preview.text}</p>
                  </div>
                )}

                {type === "quiz" && (
                  <div>
                    <p className="font-medium text-sm mb-3">{preview.title}</p>
                    {preview.questions?.map((q: any, i: number) => (
                      <div key={i} className="mb-3 bg-white rounded p-3 border">
                        <p className="text-sm font-medium mb-2">{i + 1}. {q.text}</p>
                        {["A", "B", "C", "D"].map((opt) => (
                          <p key={opt} className={`text-xs px-2 py-1 rounded mb-1 ${
                            q.correctAnswer === opt ? "bg-green-100 text-green-700 font-medium" : "text-gray-600"
                          }`}>
                            {opt}. {q[`option${opt}`]}
                          </p>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {type === "summary" && (
                  <p className="text-sm text-gray-700 whitespace-pre-line">{preview.summary}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleUse}
                    className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700"
                  >
                    Use This
                  </button>
                  <button
                    onClick={generate}
                    className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-50"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}