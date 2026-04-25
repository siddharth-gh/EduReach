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

  // Adaptive Session State
  const [isAdaptive, setIsAdaptive] = useState(false);
  const [adaptiveSessionId, setAdaptiveSessionId] = useState("");
  const [adaptiveSession, setAdaptiveSession] = useState(null);
  const [adaptiveQuestion, setAdaptiveQuestion] = useState(null);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState(null);
  const [selectedAdaptiveAnswer, setSelectedAdaptiveAnswer] = useState(null);
  const [isSubmittingAdaptive, setIsSubmittingAdaptive] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await API.get(`/quizzes/${quizId}`);
        setQuiz(response.data);
        
        // If it's an AI quiz, we switch to adaptive mode automatically
        if (response.data.generatedBy === "ai" && response.data.sourceLectureId) {
          setIsAdaptive(true);
          startAdaptiveSession(response.data.sourceLectureId);
        }
      } catch (err) {
        setError(err.response?.data?.message || t("quizAttempt.loadError"));
      }
    };
    fetchQuiz();
  }, [quizId]);

  const startAdaptiveSession = async (lectureId) => {
    try {
      const res = await API.post(`/adaptive-quizzes/lectures/${lectureId}/start`);
      setAdaptiveSessionId(res.data.sessionId);
      setAdaptiveSession(res.data.session);
      setAdaptiveQuestion(res.data.currentQuestion);
    } catch (err) {
      setError("Failed to initialize adaptive session");
    }
  };

  const handleAdaptiveSubmit = async (selectedIdx) => {
    if (isSubmittingAdaptive || isTransitioning) return;
    setIsSubmittingAdaptive(true);
    try {
      const res = await API.post(`/adaptive-quizzes/sessions/${adaptiveSessionId}/answer`, {
        questionId: adaptiveQuestion.id,
        selectedAnswer: selectedIdx,
        timeTakenSeconds: 30
      });
      
      setIsTransitioning(true);
      setTimeout(() => {
        setAdaptiveSession(res.data.session);
        if (res.data.currentQuestion) {
          setAdaptiveQuestion(res.data.currentQuestion);
        }
        setSelectedAdaptiveAnswer(null);
        setIsTransitioning(false);
      }, 400);

    } catch (err) {
      setError("Failed to submit answer");
    } finally {
      setIsSubmittingAdaptive(false);
    }
  };

  const handleSubmitStatic = async (event) => {
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

  if (error) return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-[40px] border border-red-100 dark:border-red-900/50">
           <p className="text-red-600 font-bold mb-6">{error}</p>
           <button onClick={() => navigate(-1)} className="px-8 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-2xl font-bold">Return Back</button>
        </div>
      </div>
    </AppShell>
  );

  if (!quiz || (isAdaptive && !adaptiveQuestion && adaptiveSession?.status !== 'completed')) return <AppShell><div className="max-w-3xl mx-auto px-4 py-20 animate-pulse"><div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-2xl w-3/4 mb-10"></div><div className="space-y-6"><div className="h-40 bg-gray-100 dark:bg-gray-800/50 rounded-[40px]"></div></div></div></AppShell>;

  // --- ADAPTIVE RENDER ---
  if (isAdaptive) {
    // If completed
    if (adaptiveSession?.status === 'completed') {
      const getGrade = (score) => {
        const s = parseFloat(score);
        if (s >= 9.0) return { label: "S - Legendary", color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" };
        if (s >= 7.5) return { label: "A - Master", color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" };
        if (s >= 6.0) return { label: "B - Proficient", color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" };
        if (s >= 4.0) return { label: "C - Intermediate", color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" };
        return { label: "D - Beginner", color: "text-gray-500", bg: "bg-gray-500/10", border: "border-gray-500/20" };
      };
      const grade = getGrade(adaptiveSession.score);
      const topStrong = adaptiveSession.bestConcept?.concept || "General Knowledge";
      const topWeak = adaptiveSession.worstConcept?.concept || "N/A";

      return (
        <AppShell>
          <div className="max-w-4xl mx-auto px-4 py-20 animate-in fade-in zoom-in duration-700">
            {/* Hero Header */}
            <header className="text-center mb-16 relative">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -z-10" />
               
               <div className="relative inline-block mb-8">
                  <div className="w-40 h-40 rounded-full border-[12px] border-gray-100 dark:border-gray-800 flex items-center justify-center relative overflow-hidden">
                     <div className="absolute inset-0 bg-blue-600/5" />
                     <div className="text-center relative">
                        <span className="block text-5xl font-black text-gray-900 dark:text-white leading-none">{adaptiveSession.score}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Mastery Rating</span>
                     </div>
                  </div>
                  <div className={`absolute -bottom-2 -right-2 px-6 py-3 ${grade.bg} ${grade.color} backdrop-blur-xl border ${grade.border} rounded-2xl font-black text-xs shadow-xl`}>
                     {grade.label}
                  </div>
               </div>

               <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">Assessment Complete</h1>
               <p className="text-lg text-gray-500 max-w-xl mx-auto mb-10">
                  You successfully navigated {adaptiveSession.answeredCount} questions. 
               </p>

               {/* Top Insights Cards */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  <div className="p-6 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 rounded-3xl text-left">
                     <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Strongest Topic</p>
                     <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{topStrong}</p>
                  </div>
                  <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-3xl text-left">
                     <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Needs Focus</p>
                     <p className="text-lg font-bold text-gray-900 dark:text-white truncate">{topWeak}</p>
                  </div>
               </div>
            </header>

            {/* Question Breakdown */}
            <div className="space-y-6 mb-16">
               <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">Question Review</h3>
                  <div className="flex gap-4">
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-[10px] font-bold text-gray-400 uppercase">Correct</span></div>
                     <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /><span className="text-[10px] font-bold text-gray-400 uppercase">Incorrect</span></div>
                  </div>
               </div>

               {adaptiveSession.answers?.map((ans, idx) => (
                 <article key={idx} className={`p-8 lg:p-10 rounded-[40px] border transition-all ${ans.isCorrect ? 'bg-emerald-50/20 dark:bg-emerald-900/5 border-emerald-100 dark:border-emerald-900/10' : 'bg-red-50/20 dark:bg-red-900/5 border-red-100 dark:border-red-900/10'}`}>
                    <div className="flex gap-4 mb-8">
                       <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${ans.isCorrect ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                          {idx + 1}
                       </span>
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                             <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{ans.difficulty} • {ans.concept}</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest ${ans.isCorrect ? 'text-emerald-500' : 'text-red-500'}`}>{ans.isCorrect ? 'Correct' : 'Incorrect'}</span>
                          </div>
                          <h4 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{ans.question}</h4>
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-12 mb-8">
                       {ans.options?.map((opt, oIdx) => {
                          const isUserSelection = ans.selectedAnswer === oIdx;
                          const isCorrectOption = ans.correctAnswer === oIdx;
                          return (
                            <div 
                              key={oIdx} 
                              className={`p-4 rounded-2xl text-xs font-bold border ${
                                isCorrectOption ? 'bg-emerald-500 text-white border-emerald-500' : 
                                isUserSelection ? 'bg-red-500 text-white border-red-500' : 
                                'bg-gray-50 dark:bg-gray-800 text-gray-500 border-transparent'
                              }`}
                            >
                               <span className="opacity-60 mr-2">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                            </div>
                          );
                       })}
                    </div>

                    {(ans.explanation || ans.remediationHint) && (
                      <div className="ml-12 p-6 bg-white dark:bg-gray-900/50 rounded-3xl border border-black/5 dark:border-white/5">
                         <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-2"><span className="font-black text-gray-900 dark:text-white uppercase text-[9px] tracking-widest mr-2">Explanation:</span> {ans.explanation}</p>
                         {ans.remediationHint && <p className="text-xs text-blue-500 italic"><span className="font-black uppercase text-[9px] tracking-widest mr-2">Pro Tip:</span> {ans.remediationHint}</p>}
                      </div>
                    )}
                 </article>
               ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
               <button onClick={() => window.location.reload()} className="w-full sm:w-auto px-10 py-5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-2 border-gray-100 dark:border-gray-800 font-black rounded-2xl shadow-xl transition-all transform hover:-translate-y-1">
                 Practice Again
               </button>
               <button onClick={() => navigate(-1)} className="w-full sm:w-auto px-12 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1">
                 Continue Learning
               </button>
            </div>
          </div>
        </AppShell>
      );
    }

    return (
      <AppShell>
        <div className="max-w-3xl mx-auto px-4 py-20">
           <div className="flex justify-between items-center mb-12">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl">🧠</div>
                 <div>
                    <h2 className="text-xl font-black text-gray-900 dark:text-white leading-none">Adaptive Quiz</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Level: {adaptiveQuestion.difficulty}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Step {adaptiveQuestion.questionNumber} / {adaptiveQuestion.totalQuestions}</p>
                 <div className="w-32 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(adaptiveQuestion.questionNumber / adaptiveQuestion.totalQuestions) * 100}%` }} />
                 </div>
              </div>
           </div>

           <div className={`transition-all duration-500 ease-in-out ${isTransitioning ? 'opacity-0 translate-y-4 scale-95' : 'opacity-100 translate-y-0 scale-100'}`}>
              <div className="bg-white dark:bg-gray-900 p-10 rounded-[48px] border border-gray-100 dark:border-gray-800 shadow-2xl shadow-blue-600/5 mb-8">
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-10 leading-tight">
                   {adaptiveQuestion.question}
                 </h3>

                 <div className="grid grid-cols-1 gap-4 mb-10">
                    {adaptiveQuestion.options.map((opt, i) => (
                      <button 
                       key={i} 
                       onClick={() => handleAdaptiveSubmit(i)}
                       disabled={isSubmittingAdaptive || isTransitioning}
                       className="p-6 text-left rounded-3xl border-2 border-gray-100 dark:border-gray-800 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-all font-bold group relative"
                      >
                        <div className="flex items-center">
                           <span className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center mr-4 text-xs font-black transition-colors">
                              {String.fromCharCode(65 + i)}
                           </span>
                           <span className="flex-1 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">{opt}</span>
                        </div>
                      </button>
                    ))}
                 </div>

                 {isSubmittingAdaptive && (
                   <div className="flex justify-center items-center py-4">
                      <div className="w-6 h-6 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
                      <span className="ml-3 text-xs font-black text-gray-400 uppercase tracking-widest">Processing...</span>
                   </div>
                 )}
              </div>
           </div>
        </div>
      </AppShell>
    );
  }

  // --- STATIC RENDER ---
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto px-4 py-20">
        <button onClick={() => navigate(-1)} className="mb-8 text-sm font-bold text-gray-400 hover:text-blue-600 transition-colors uppercase tracking-widest">← Back</button>

        <header className="mb-12">
           <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-4">{quiz.title}</h1>
           <p className="text-lg text-gray-500 dark:text-gray-400">{quiz.description}</p>
        </header>

        <form onSubmit={handleSubmitStatic} className="space-y-8">
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
                       <input type="radio" className="hidden" name={`question-${qIndex}`} checked={selectedAnswers[qIndex] === oIndex} onChange={() => setSelectedAnswers(curr => ({ ...curr, [qIndex]: oIndex }))} />
                       <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-[10px] ${selectedAnswers[qIndex] === oIndex ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-200 dark:border-gray-700'}`}>{selectedAnswers[qIndex] === oIndex && '✓'}</span>
                       <span className="text-sm">{option}</span>
                     </label>
                   ))}
                </div>
             </article>
           ))}
           <div className="pt-10 flex flex-col items-center gap-4">
              <button type="submit" disabled={isSubmitting} className="px-12 py-5 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all transform hover:-translate-y-1 disabled:bg-blue-400">
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </button>
           </div>
        </form>
      </div>
    </AppShell>
  );
};

export default QuizAttempt;
