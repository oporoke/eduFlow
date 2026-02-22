"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function ParentStudentPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchStudentData();
  }, []);

  const fetchStudentData = async () => {
    const res = await fetch(`/api/parent/student/${studentId}`);
    if (res.status === 401) { router.push("/parent/login"); return; }
    if (res.status === 403) { router.push("/parent/dashboard"); return; }
    const d = await res.json();
    setData(d);
  };

  const acknowledgeIep = async (iepId: string) => {
    await fetch(`/api/iep/${iepId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ parentAcknowledged: true }),
    });
    fetchStudentData();
  };

  if (!data) return <div className="p-8">Loading...</div>;

  const lessonPercentage = data.totalLessons
    ? Math.round((data.completedLessons / data.totalLessons) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Student Progress</h1>
          <button onClick={() => router.push("/parent/dashboard")} className="text-sm text-blue-600 hover:underline">
            Back to Dashboard
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded shadow p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{data.enrollments?.length}</p>
            <p className="text-xs text-gray-500 mt-1">Classes Enrolled</p>
          </div>
          <div className="bg-white rounded shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{lessonPercentage}%</p>
            <p className="text-xs text-gray-500 mt-1">Lessons Complete</p>
          </div>
          <div className="bg-white rounded shadow p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">
              {data.avgScore !== null ? `${data.avgScore}%` : "—"}
            </p>
            <p className="text-xs text-gray-500 mt-1">Avg Quiz Score</p>
          </div>
          <div className="bg-white rounded shadow p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">{data.quizAttempts}</p>
            <p className="text-xs text-gray-500 mt-1">Quizzes Taken</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["overview", "classes", "ieps"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded text-sm capitalize border ${
                activeTab === tab
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="bg-white rounded shadow p-6">
            <h2 className="font-semibold mb-4">Lesson Progress</h2>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Completion</span>
              <span>{data.completedLessons}/{data.totalLessons} lessons</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${lessonPercentage}%` }}
              />
            </div>

            <h2 className="font-semibold mb-4">Classes Overview</h2>
            <div className="space-y-3">
              {data.enrollments?.map((e: any) => (
                <div key={e.id} className="border rounded p-4">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{e.classroom.name}</h3>
                    <p className="text-sm text-gray-500">Teacher: {e.classroom.teacher?.name}</p>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {e.classroom.subjects?.length} subjects
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === "classes" && (
          <div className="space-y-4">
            {data.enrollments?.map((e: any) => (
              <div key={e.id} className="bg-white rounded shadow p-6">
                <h2 className="font-semibold text-lg mb-4">{e.classroom.name}</h2>
                <p className="text-sm text-gray-500 mb-3">Teacher: {e.classroom.teacher?.name}</p>
                {e.classroom.subjects?.map((s: any) => (
                  <div key={s.id} className="mb-3 border-l-2 border-blue-200 pl-3">
                    <p className="font-medium text-sm">📚 {s.name}</p>
                    {s.topics?.map((t: any) => (
                      <div key={t.id} className="ml-3 mt-1">
                        <p className="text-sm text-gray-600">📖 {t.name}</p>
                        {t.subtopics?.map((st: any) => (
                          <p key={st.id} className="text-xs text-gray-400 ml-3">• {st.name}</p>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* IEPs Tab */}
        {activeTab === "ieps" && (
          <div className="space-y-4">
            {data.ieps?.length === 0 ? (
              <div className="bg-white rounded shadow p-8 text-center text-gray-400">
                <p className="text-4xl mb-3">📋</p>
                <p>No IEPs created yet</p>
              </div>
            ) : (
              data.ieps?.map((iep: any) => (
                <div key={iep.id} className="bg-white rounded shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold">IEP Document</h3>
                      <p className="text-sm text-gray-400">
                        By {iep.teacher?.name} · {new Date(iep.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded ${
                        iep.status === "FINAL" ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                      }`}>
                        {iep.status}
                      </span>
                      {iep.parentAcknowledged ? (
                        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
                          ✓ Acknowledged
                        </span>
                      ) : (
                        <button
                          onClick={() => acknowledgeIep(iep.id)}
                          className="text-xs bg-orange-600 text-white px-3 py-1 rounded hover:bg-orange-700"
                        >
                          Acknowledge
                        </button>
                      )}
                    </div>
                  </div>

                  {[
                    { label: "Strengths", value: iep.strengths, color: "bg-green-50" },
                    { label: "Areas of Concern", value: iep.areasOfConcern, color: "bg-yellow-50" },
                    { label: "Learning Goals", value: iep.learningGoals, color: "bg-blue-50" },
                    { label: "Interventions", value: iep.interventions, color: "bg-purple-50" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className={`${color} rounded p-3 mb-2`}>
                      <p className="text-xs font-semibold text-gray-600 mb-1">{label}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{value || "Not specified"}</p>
                    </div>
                  ))}

                  {iep.reviewDate && (
                    <p className="text-sm text-gray-500 mt-3">
                      Review Date: {new Date(iep.reviewDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}