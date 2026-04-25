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
        setCurrentUser({ ...user, streakCount: response.data.student.streakCount });
      }
      navigate(`/quiz-result/${response.data.attempt._id}`);
    } catch (err) {
      setError(err.response?.data?.message || t("quizAttempt.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!quiz) return <AppShell><div className="max-w-3xl mx-auto px-4 py-20 animate-pulse"><div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl w-3/4 mb-10"></div><div className="space-y-6"><div className="h-40 bg-gray-100 dark:bg-gray-800/50 rounded-[40px]"></div><div className="h-40 bg-gray-100 dark:bg-gray-800/50 rounded-[40px]"></div></div></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">
           ← {t("common.back")}
        </button>

        <header className="mb-12">
           <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">Assessment</span>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{quiz.title}</h1>
           <p className="text-lg text-gray-500 dark:text-gray-400">{quiz.description || t("quizAttempt.defaultDescription")}</p>
        </header>

        {error && <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-3xl text-red-600 font-bold mb-8">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
           {quiz.questions.map((question, qIndex) => (
             <article key={qIndex} className="bg-white dark:bg-gray-900 p-8 lg:p-10 rounded-[40px] border border-gray-100 dark:border-gray-800 shadow-xl shadow-blue-600/5">
                <div className="flex gap-4 mb-8">
                   <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-black text-gray-400 shrink-0">{qIndex + 1}</span>
                   <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">{question.questionText}</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                   {question.options.map((option, oIndex) => (
                     <label 
                      key={oIndex} 
                      className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all cursor-pointer font-bold ${selectedAnswers[qIndex] === oIndex ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'border-gray-50 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-700 dark:text-gray-300'}`}
                     >
                       <input
                         type="radio"
                         className="hidden"
                         name={`question-${qIndex}`}
                         value={oIndex}
                         checked={selectedAnswers[qIndex] === oIndex}
                         onChange={() => setSelectedAnswers(curr => ({ ...curr, [qIndex]: oIndex }))}
                       />
                       <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${selectedAnswers[qIndex] === oIndex ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 dark:border-gray-700'}`}>
                          {selectedAnswers[qIndex] === oIndex && '✓'}
                       </span>
                       <span className="text-sm">{option}</span>
                     </label>
                   ))}
                </div>
             </article>
           ))}

           <div className="pt-10 flex flex-col items-center gap-4">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="px-12 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 disabled:bg-blue-400"
              >
                {isSubmitting ? t("quizAttempt.submitting") : t("quizAttempt.submit")}
              </button>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">All progress is saved to your student profile</p>
           </div>
        </form>
      </div>
    </AppShell>
  );
};

export default QuizAttempt;
