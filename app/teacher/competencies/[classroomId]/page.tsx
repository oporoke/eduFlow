"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";

const LEVELS = ["BEGINNING", "DEVELOPING", "ACHIEVING", "EXCELLING"];

const levelColors: { [key: string]: string } = {
  BEGINNING: "bg-red-100 text-red-600",
  DEVELOPING: "bg-yellow-100 text-yellow-600",
  ACHIEVING: "bg-blue-100 text-blue-600",
  EXCELLING: "bg-green-100 text-green-600",
};

export default function CompetencyTrackerPage({ params }: { params: Promise<{ classroomId: string }> }) {
  const { classroomId } = use(params);
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [competencies, setCompetencies] = useState<any[]>([]);
  const [progress, setProgress] = useState<{ [key: string]: any }>({});
  const [selectedCategory, setSelectedCategory] = useState("Core");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [studentsRes, competenciesRes] = await Promise.all([
      fetch(`/api/analytics?classroomId=${classroomId}`),
      fetch("/api/competencies"),
    ]);

    const studentsData = await studentsRes.json();
    const competenciesData = await competenciesRes.json();

    setStudents(studentsData.studentStats || []);
    setCompetencies(competenciesData);

    // Fetch progress for all students
    const progressMap: { [key: string]: any } = {};
    await Promise.all(
      (studentsData.studentStats || []).map(async (s: any) => {
        const res = await fetch(`/api/competencies/progress?studentId=${s.student.id}`);
        const data = await res.json();
        progressMap[s.student.id] = {};
        data.forEach((p: any) => {
          progressMap[s.student.id][p.competencyId] = p.level;
        });
      })
    );
    setProgress(progressMap);
  };

  const updateLevel = async (studentId: string, competencyId: string, level: string) => {
    await fetch("/api/competencies/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, competencyId, level }),
    });

    setProgress((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [competencyId]: level },
    }));
    setMessage("Progress updated!");
    setTimeout(() => setMessage(""), 2000);
  };

  const categories = [...new Set(competencies.map((c) => c.category))];
  const filteredCompetencies = competencies.filter((c) => c.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold">CBC Competency Tracker</h1>
            <p className="text-gray-500 text-sm">Track student mastery of CBC core competencies</p>
          </div>
          <button onClick={() => router.back()} className="text-sm text-blue-600 hover:underline">
            Back
          </button>
        </div>

        {message && <p className="text-green-600 mb-4 text-sm">{message}</p>}

        {/* Category Tabs */}
        <div className="flex gap-2 mb-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded text-sm border ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-3 mb-4">
          {LEVELS.map((level) => (
            <span key={level} className={`text-xs px-2 py-1 rounded ${levelColors[level]}`}>
              {level}
            </span>
          ))}
        </div>

        {/* Competency Grid */}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600 min-w-36">Student</th>
                {filteredCompetencies.map((c) => (
                  <th key={c.id} className="text-left px-3 py-3 font-medium text-gray-600 min-w-40">
                    <p>{c.name}</p>
                    <p className="text-xs text-gray-400 font-normal">{c.description}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={filteredCompetencies.length + 1} className="text-center text-gray-400 py-8">
                    No students enrolled
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.student.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium">{s.student.name}</p>
                      <p className="text-xs text-gray-400">{s.student.email}</p>
                    </td>
                    {filteredCompetencies.map((c) => {
                      const level = progress[s.student.id]?.[c.id] || "BEGINNING";
                      return (
                        <td key={c.id} className="px-3 py-3">
                          <select
                            value={level}
                            onChange={(e) => updateLevel(s.student.id, c.id, e.target.value)}
                            className={`text-xs px-2 py-1 rounded border-0 cursor-pointer ${levelColors[level]}`}
                          >
                            {LEVELS.map((l) => (
                              <option key={l} value={l}>{l}</option>
                            ))}
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}