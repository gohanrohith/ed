import { Route, Routes } from 'react-router-dom';
import Loginpage from '../components/login/Loginpage';
import DashboardAdmin from '../components/Admins/Dashboard.jsx';
import DashboardStudent from '../components/Students/Dashboard0fStudent.jsx';
import Profile from '../components/Profile/Profile';
import ProtectedRoute from '../components/ProtectedRoute'; // Import the ProtectedRoute component
import Assignmentsofstudents from '../components/Students/Assignments/Assignmentsofstudents.jsx';
import Assignments from '../components/Admins/Assigments/Assignments.jsx';
import HomePage from '../components/Admins/Home/HomePage.jsx';
import HomePageofStudents from '../components/Students/Home/HomePageofStudents.jsx';
import AddStudent from '../components/Admins/Addstudents/AddStudent.jsx';
import ChapterDetails from '../components/Students/Assignments/ChapterDetails.js';
import AddQuestion from '../components/Admins/AddQuestion.jsx/AddQuestion.jsx';
import AddSubjectAndClass from '../components/Admins/AddSubjectandclass/AddSubjectAndClass.jsx';
import DashboardOfSuperadmin from '../components/SuperAdmin/Dashboard';
import HomePageofsuperadmin from '../components/SuperAdmin/Home/HomePage.jsx';
import AddQuestionforAdmin from '../components/SuperAdmin/AddQuestion.jsx/AddQuestion.jsx';
import AdminAvailabe from '../components/SuperAdmin/Admins/AdminAvailabe.jsx';
import ImmediateQuest from '../components/Students/ImmediateQuest/ImmediateQuest.jsx';
import DownloadQuestion from '../components/SuperAdmin/DownloadQuestions/DownloadQuestion.jsx';
const AppRoutes = () => {
  return (
    <Routes>
      {/* Public route */}
      <Route path="/" element={<Loginpage />} />
      {/* Protected route: Only accessible with a valid authToken */}
      <Route
        path="/dashboard_superadmin/"
        element={
          <ProtectedRoute>
            <DashboardOfSuperadmin />
          </ProtectedRoute>
        }
      >
        <Route path="Homeofsuperadmin" element={<HomePageofsuperadmin />} />
        <Route path="AddQuestionforSuperAdmin" element={<AddQuestionforAdmin />} />
        <Route path="Adminsavailabe" element={<AdminAvailabe />} />
        <Route path="DownloadQuestion" element={<DownloadQuestion/>}/>
      </Route>
      {/* Protected route: Only accessible with a valid authToken */}
      <Route
        path="/dashboard_admin/"
        element={
          <ProtectedRoute>
            <DashboardAdmin />
          </ProtectedRoute>
        }
      >
        <Route path="Home" element={<HomePage />} />
        <Route path="assignments" element={<Assignments />} />
        <Route path="addstudent" element={<AddStudent />} />
        <Route path="addquestion" element={<AddQuestion />} />
        <Route path="addsubjectandclass" element={<AddSubjectAndClass />} />
      </Route>
      <Route
        path="/dashboard_student/"
        element={
          <ProtectedRoute>
            <DashboardStudent />
          </ProtectedRoute>
        }
      >
        <Route path="Home" element={<HomePageofStudents />} />
        <Route path="assignments" element={<Assignmentsofstudents />} />
        {/* Add the dynamic route for chapter details */}
        <Route path="chapters/:subjectId" element={<ChapterDetails />} />
        <Route path="ImmediateQuest" element={<ImmediateQuest/>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
