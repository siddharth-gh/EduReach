import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import AppShell from "../layouts/AppShell";

const QuizResult = () => {
  const { t } = useTranslation();
  const { attemptId } = useParams();
  const navigate = useNavigate();
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

  if (!attempt) return <AppShell><div className="max-w-3xl mx-auto px-4 py-20 animate-pulse"><div className="h-48 bg-gray-100 dark:bg-gray-800/50 rounded-[48px] mb-12"></div><div className="space-y-6"><div className="h-32 bg-gray-50 dark:bg-gray-800/20 rounded-3xl"></div><div className="h-32 bg-gray-50 dark:bg-gray-800/20 rounded-3xl"></div></div></div></AppShell>;

  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        
        <header className="text-center mb-16">
           <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-black rounded-full uppercase tracking-widest mb-4 inline-block">Results</span>
           <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-6">{attempt.quizId?.title}</h1>
           
           <div className="inline-flex flex-col items-center p-10 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-[48px] shadow-2xl shadow-blue-600/5 relative overflow-hidden">
              <div className={`absolute top-0 inset-x-0 h-2 ${attempt.passed ? 'bg-green-500' : 'bg-red-500'}`} />
              <p className="text-5xl font-black text-gray-900 dark:text-white mb-2">{attempt.score}%</p>
              <p className={`text-xs font-black uppercase tracking-widest ${attempt.passed ? 'text-green-600' : 'text-red-600'}`}>
                {attempt.passed ? t("quizResult.passed") : t("quizResult.keepPracticing")}
              </p>
           </div>
        </header>

        <div className="space-y-6">
          {attempt.quizId?.questions?.map((question, index) => {
            const answer = attempt.answers.find(item => item.questionIndex === index);
            const isCorrect = answer?.isCorrect;

            return (
              <article key={index} className={`p-8 lg:p-10 rounded-[40px] border transition-all ${isCorrect ? 'bg-green-50/20 dark:bg-green-900/10 border-green-100 dark:border-green-900/20' : 'bg-red-50/20 dark:bg-red-900/10 border-red-100 dark:border-red-900/20'}`}>
                <div className="flex gap-4 mb-6">
                   <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {isCorrect ? '✓' : '✕'}
                   </span>
                   <h3 className="text-lg font-bold text-gray-900 dark:text-white">{index + 1}. {question.questionText}</h3>
                </div>

                <div className="space-y-4 ml-12">
                   <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("quizResult.yourAnswer")}:</span>
                      <span className={`text-sm font-bold ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {answer?.selectedOption >= 0 ? question.options[answer.selectedOption] : t("quizResult.notAnswered")}
                      </span>
                   </div>
                   {!isCorrect && (
                     <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{t("quizResult.correctAnswer")}:</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{question.options[question.correctAnswer]}</span>
                     </div>
                   )}
                   {question.explanation && (
                     <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-black/5 dark:border-white/5">
                        <p className="text-xs italic text-gray-500 dark:text-gray-400"><span className="font-bold not-italic">{t("quizResult.explanation")}:</span> {question.explanation}</p>
                     </div>
                   )}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-16 text-center">
           <button 
            onClick={() => navigate(-1)} 
            className="px-10 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-black rounded-2xl shadow-xl transition-all transform hover:-translate-y-1"
           >
             Return to Course
           </button>
        </div>
      </div>
    </AppShell>
  );
};

export default QuizResult;
