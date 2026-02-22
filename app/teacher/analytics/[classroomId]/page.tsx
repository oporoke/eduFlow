"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

export default function AnalyticsPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = use(params);
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const res = await fetch(`/api/analytics?classroomId=${classroomId}`);
    const data = await res.json();
    setAnalytics(data);
  };

  if (!analytics) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Class Analytics</h1>
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
            Back
          </button>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded shadow p-6 text-center">
            <p className="text-3xl font-bold text-blue-600">{analytics.totalStudents}</p>
            <p className="text-sm text-gray-500 mt-1">Total Students</p>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <p className="text-3xl font-bold text-green-600">{analytics.totalLessons}</p>
            <p className="text-sm text-gray-500 mt-1">Total Lessons</p>
          </div>
          <div className="bg-white rounded shadow p-6 text-center">
            <p className="text-3xl font-bold text-purple-600">{analytics.totalQuizzes}</p>
            <p className="text-sm text-gray-500 mt-1">Total Quizzes</p>
          </div>
        </div>

        {/* Student Stats Table */}
        <div className="bg-white rounded shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold">Student Progress</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Student</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Lessons</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Progress</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Quizzes</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Avg Score</th>
              </tr>
            </thead>
            <tbody>
              {analytics.studentStats.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-gray-500 py-8">No students enrolled</td>
                </tr>
              ) : (
                analytics.studentStats.map((s: any) => {
                  const percentage = analytics.totalLessons === 0 ? 0 : Math.round((s.completedLessons / analytics.totalLessons) * 100);
                  return (
                    <tr key={s.student.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <p className="font-medium">{s.student.name}</p>
                        <p className="text-xs text-gray-400">{s.student.email}</p>
                      </td>
                      <td className="px-4 py-3">
                        {s.completedLessons}/{s.totalLessons}
                      </td>
                      <td className="px-4 py-3 w-36">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{percentage}%</p>
                      </td>
                      <td className="px-4 py-3">
                        {s.quizzesTaken}/{s.totalQuizzes}
                      </td>
                      <td className="px-4 py-3">
                        {s.avgScore !== null ? (
                          <span className={`font-medium ${s.avgScore >= 70 ? "text-green-600" : "text-red-500"}`}>
                            {s.avgScore}%
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}