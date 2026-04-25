const CourseCard = ({ course, onClick }) => {
  const { title, description, teacherId, category, level, downloaded } = course || {};
  const teacherName = teacherId?.name || "Instructor";

  return (
    <article 
      className="group bg-white dark:bg-gray-900 rounded-[2.5rem] border border-gray-100 dark:border-gray-800 p-8 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)] transition-all duration-300 cursor-pointer overflow-hidden relative flex flex-col justify-between h-full"
      onClick={onClick}
    >
      <div className="relative z-10 space-y-4">
        <div className="flex justify-between items-start">
           <span className="inline-block px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[9px] font-black rounded-full uppercase tracking-widest">
             {category || "General"}
           </span>
           {downloaded && (
             <span className="w-6 h-6 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
           )}
        </div>
        
        <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="relative z-10 pt-8 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
              {teacherName.charAt(0)}
           </div>
           <p className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{teacherName}</p>
        </div>
        <span className="text-[10px] font-black text-gray-200 dark:text-gray-700 uppercase tracking-widest group-hover:text-blue-600 transition-colors">Details</span>
      </div>

      {/* Subtle Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-600/10 transition-colors duration-500" />
    </article>
  );
};

export default CourseCard;
