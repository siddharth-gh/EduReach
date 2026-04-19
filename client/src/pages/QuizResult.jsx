import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";

const QuizResult = () => {
  const { t } = useTranslation();
  const { attemptId } = useParams();
  const [attempt, setAttempt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const response = await API.get(`/quiz-attempts/${attemptId}`);
        setAttempt(response.data);
      } catch (err) {
        setError(err.response?.data?.message || t("quizResult.loadError"));
      }
    };

    fetchAttempt();
  }, [attemptId, t]);

  if (error && !attempt) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="form-error">{error}</p>
        </section>
      </AppShell>
    );
  }

  if (!attempt) {
    return (
      <AppShell>
        <section className="page-section page-narrow">
          <p className="status-text">{t("quizResult.loading")}</p>
        </section>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <section className="page-section page-narrow">
        <div className="hero-card hero-card-compact">
          <span className="eyebrow">{t("quizResult.badge")}</span>
          <h1>{attempt.quizId?.title}</h1>
          <p className="hero-copy">
            {t("quizResult.score")}: {attempt.score}% | {attempt.passed ? t("quizResult.passed") : t("quizResult.keepPracticing")}
          </p>
        </div>
        <div className="stack-list">
          {attempt.quizId?.questions?.map((question, index) => {
            const answer = attempt.answers.find(
              (item) => item.questionIndex === index
            );

            return (
              <article key={index} className="dashboard-card">
                <h3>
                  {index + 1}. {question.questionText}
                </h3>
                <p className={answer?.isCorrect ? "success-text" : "form-error"}>
                  {answer?.isCorrect ? t("quizResult.correct") : t("quizResult.incorrect")}
                </p>
                <p className="meta-text">
                  {t("quizResult.yourAnswer")}:{" "}
                  {answer?.selectedOption >= 0
                    ? question.options[answer.selectedOption]
                    : t("quizResult.notAnswered")}
                </p>
                <p className="meta-text">
                  {t("quizResult.correctAnswer")}: {question.options[question.correctAnswer]}
                </p>
                {question.explanation ? (
                  <p className="meta-text">{t("quizResult.explanation")}: {question.explanation}</p>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
};

export default QuizResult;
