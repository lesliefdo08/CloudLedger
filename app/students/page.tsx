import Link from "next/link";
import { redirect } from "next/navigation";

import CreateStudentForm from "@/components/CreateStudentForm";
import LogoutButton from "@/components/LogoutButton";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function StudentsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const students = await prisma.student.findMany({
    orderBy: { createdAt: "desc" },
    include: { files: true },
  });

  return (
    <main className="page-wrap">
      <header className="top-bar">
        <div>
          <h1>Students</h1>
          <p className="muted-text">Welcome, {user.email}</p>
        </div>
        <LogoutButton />
      </header>

      <section className="grid-two">
        <CreateStudentForm />

        <div className="card">
          <h2>Student List</h2>
          {students.length === 0 ? <p className="muted-text">No students yet.</p> : null}
          <ul className="list">
            {students.map((student) => (
              <li key={student.id} className="list-item">
                <div>
                  <p className="strong-text">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="muted-text">{student.email || "No email"}</p>
                </div>
                <div className="list-actions">
                  <span className="muted-text">{student.files.length} files</span>
                  <Link className="button button-link" href={`/students/${student.id}`}>
                    Open
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
