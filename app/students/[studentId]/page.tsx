import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import LogoutButton from "@/components/LogoutButton";
import UploadFileForm from "@/components/UploadFileForm";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ studentId: string }>;
};

export default async function StudentDetailsPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const { studentId } = await params;

  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      files: {
        orderBy: { createdAt: "desc" },
        include: {
          versions: {
            orderBy: { version: "desc" },
          },
        },
      },
    },
  });

  if (!student) {
    notFound();
  }

  return (
    <main className="page-wrap">
      <header className="top-bar">
        <div>
          <Link href="/students" className="back-link">
            Back to students
          </Link>
          <h1>
            {student.firstName} {student.lastName}
          </h1>
          <p className="muted-text">{student.department || "No department"}</p>
        </div>
        <LogoutButton />
      </header>

      <section className="card">
        <h2>Upload New File</h2>
        <UploadFileForm studentId={student.id} buttonLabel="Upload File" />
      </section>

      <section className="card">
        <h2>Files</h2>
        {student.files.length === 0 ? <p className="muted-text">No files uploaded yet.</p> : null}

        <div className="stack">
          {student.files.map((file) => (
            <article className="file-box" key={file.id}>
              <div className="file-head">
                <div>
                  <p className="strong-text">{file.title}</p>
                  <p className="muted-text">Latest: {file.originalName}</p>
                </div>
                <a className="button button-link" href={`/api/files/${file.id}/download`}>
                  Download
                </a>
              </div>

              <UploadFileForm studentId={student.id} fileId={file.id} buttonLabel="Upload New Version" />

              <div className="version-list">
                <p className="muted-text">Version History</p>
                <ul className="list">
                  {file.versions.map((version) => (
                    <li className="list-item" key={version.id}>
                      <span>
                        v{version.version} - {version.originalName}
                      </span>
                      <a className="button button-link" href={`/api/files/${file.id}/download?version=${version.version}`}>
                        Download
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
