import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";

const CertificatePage = () => {
  const { courseId } = useParams();
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const response = await API.get(`/achievements/certificate/${courseId}`);
        setCertificate(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load certificate");
      }
    };

    fetchCertificate();
  }, [courseId]);

  if (error && !certificate) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="form-error">{error}</p>
        </section>
      </AppShell>
    );
  }

  if (!certificate) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="status-text">Loading certificate...</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section page-narrow">
        <div className="certificate-card">
          <span className="eyebrow">Certificate of Completion</span>
          <h1>{certificate.student.name}</h1>
          <p className="hero-copy">
            has successfully completed the course
          </p>
          <h2>{certificate.course.title}</h2>
          <p className="meta-text">
            Guided by {certificate.course.teacherName}
          </p>
          <p className="meta-text">
            Completed on{" "}
            {new Date(certificate.completedAt).toLocaleDateString()}
          </p>
        </div>
      </section>
    </AppShell>
  );
};

export default CertificatePage;
