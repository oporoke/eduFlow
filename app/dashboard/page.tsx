import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) redirect("/login");

  const { name, email } = session.user!;
  const role = (session.user as any).role;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Link href="/profile" className="text-sm text-blue-600 hover:underline">
            Edit Profile
          </Link>
        </div>
        <p className="text-gray-600">Welcome, <span className="font-semibold">{name}</span></p>
        <p className="text-gray-600">Email: {email}</p>
        <p className="text-gray-600">Role: <span className="font-semibold text-blue-600">{role}</span></p>
      </div>
    </div>
  );
}
