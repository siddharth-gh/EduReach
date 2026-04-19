import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import API from "../api/api";
import { useAuth } from "../app/useAuth";
import AppShell from "../layouts/AppShell";

const QuizAttempt = () => {
  const { t } = useTranslation();
  const { quizId } = useParams();
  const navigate = useNavigate();
  const { user, setCurrentUser } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await API.get(`/quizzes/${quizId}`);
        setQuiz(response.data);
      } catch (err) {
        setError(err.response?.data?.message || t("quizAttempt.loadError"));
      }
    };

    fetchQuiz();
  }, [quizId, t]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const answers = Object.entries(selectedAnswers).map(
        ([questionIndex, selectedOption]) => ({
          questionIndex: Number(questionIndex),
          selectedOption: Number(selectedOption),
        })
      );

      const response = await API.post(`/quiz-attempts/${quizId}`, { answers });
      if (response.data.student && user) {
        setCurrentUser({
          ...user,
          streakCount: response.data.student.streakCount,
          lastActiveAt: response.data.student.lastActiveAt,
        });
      }

      navigate(`/quiz-result/${response.data.attempt._id}`);
    } catch (err) {
      setError(err.response?.data?.message || t("quizAttempt.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (error && !quiz) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="form-error">{error}</p>
        </section>
      </AppShell>
    );
  }

  if (!quiz) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="status-text">{t("quizAttempt.loading")}</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section page-narrow">
        <div className="hero-card hero-card-compact">
          <span className="eyebrow">{t("quizAttempt.badge")}</span>
          <h1>{quiz.title}</h1>
          <p className="hero-copy">{quiz.description || t("quizAttempt.defaultDescription")}</p>
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <form className="stack-list" onSubmit={handleSubmit}>
          {quiz.questions.map((question, questionIndex) => (
            <article key={questionIndex} className="dashboard-card">
              <h3>
                {questionIndex + 1}. {question.questionText}
              </h3>
              <div className="quiz-options">
                {question.options.map((option, optionIndex) => (
                  <label key={optionIndex} className="quiz-option">
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={optionIndex}
                      checked={selectedAnswers[questionIndex] === optionIndex}
                      onChange={() =>
                        setSelectedAnswers((current) => ({
                          ...current,
                          [questionIndex]: optionIndex,
                        }))
                      }
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </article>
          ))}
          <button type="submit" className="btn btn-inline" disabled={isSubmitting}>
            {isSubmitting ? t("quizAttempt.submitting") : t("quizAttempt.submit")}
          </button>
        </form>
      </section>
    </AppShell>
  );
};

export default QuizAttempt;
