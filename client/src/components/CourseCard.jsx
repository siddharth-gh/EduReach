const CourseCard = ({
  title,
  description,
  teacherName,
  category,
  level,
  downloaded,
  onClick,
}) => {
  return (
    <article className="content-card" onClick={onClick}>
      <span className="card-badge">{teacherName || "Instructor"}</span>
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="course-meta-row">
        <span className="meta-pill">{category || "General"}</span>
        <span className="meta-pill">{level || "beginner"}</span>
        {downloaded ? <span className="meta-pill">Downloaded</span> : null}
      </div>
    </article>
  );
};

export default CourseCard;
