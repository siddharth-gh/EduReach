import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Courses from "./pages/Courses";
import CourseDetail from "./pages/CourseDetail";
import LectureViewer from "./pages/LectureViewer";
import QuizAttempt from "./pages/QuizAttempt";
import QuizResult from "./pages/QuizResult";
import CertificatePage from "./pages/CertificatePage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherCourses from "./pages/TeacherCourses";
import TeacherStudents from "./pages/TeacherStudents";
import TeacherAnalytics from "./pages/TeacherAnalytics";
import TeacherProfile from "./pages/TeacherProfile";
import TeacherCourseBuilder from "./pages/TeacherCourseBuilder";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";
import VideoSDKClassroom from "./pages/VideoSDKClassroom";
import OfflineLibrary from "./pages/OfflineLibrary";
import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/course/:courseId" element={<CourseDetail />} />
        <Route path="/lecture/:lectureId" element={<LectureViewer />} />
        <Route path="/offline" element={<OfflineLibrary />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/course/:courseId/live" element={<VideoSDKClassroom />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/quiz/:quizId" element={<QuizAttempt />} />
          <Route path="/quiz-result/:attemptId" element={<QuizResult />} />
          <Route path="/certificate/:courseId" element={<CertificatePage />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={["teacher", "admin"]} />}>
          <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          <Route path="/teacher/courses" element={<TeacherCourses />} />
          <Route path="/teacher/students" element={<TeacherStudents />} />
          <Route path="/teacher/analytics" element={<TeacherAnalytics />} />
          <Route path="/teacher/profile" element={<TeacherProfile />} />
          <Route
            path="/teacher/courses/:courseId"
            element={<TeacherCourseBuilder />}
          />
        </Route>
        <Route element={<RoleRoute allowedRoles={["admin"]} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
