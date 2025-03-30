
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'boxicons/css/boxicons.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'

import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import AdminPage from './pages/Admin/AdminPage';
import Assessments from './pages/Admin/QuizzPage';
import ChatPage from './pages/RoomQuestion/ChatPage';
import QuestionPage from './pages/Admin/QuestionsPage'

import QuestionsPage from './pages/QuestionsPage'
import CreateRoomPage from './pages/RoomQuestion/CreateRoomPage'
import RoomListPage from './pages/RoomQuestion/RoomListPage'
import MainPage from './pages/MainPage'
import LoginPage from './pages/LoginPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import AuthMiddleware from './middleware/AuthMiddleware';
import PlayPage from './pages/PlayPage'
import ProfilePage from './pages/ProfilePage'
import ManagePage from './pages/ManagePage'
import GenerateQuiz from './pages/GenerateQuiz'
import QuizDetailPage from './pages/QuizDetailPage'
import AuthProvider from './contexts/AuthContext'
import CategoryPage from './pages/Admin/CategoryPage'


const globalStyles = {
  body: {
    fontFamily: 'cnn_sans_display, helveticaneue, Helvetica, Arial, Utkal, sans-serif',
    paddingTop: "56px !important",
   
  }
}

// Add global styles
document.body.style.fontFamily = globalStyles.body.fontFamily

function App() {
  return (
    <AuthProvider>
    <main>
      <Router>
          <Routes>
              <Route path="/" element={<MainPage/>} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/admin" element={
                 <AuthMiddleware>
                 <AdminPage/>
               </AuthMiddleware>
              } />
              <Route path="/admin/quizz" element={
                 <AuthMiddleware>
                 <Assessments/>
               </AuthMiddleware>
              } />
               <Route path="/admin/category" element={
                 <AuthMiddleware>
                 <CategoryPage/>
               </AuthMiddleware>
              } />
              <Route path="/admin/quizz/:quizzId" element={
                 <AuthMiddleware>
                 <QuestionPage/>
               </AuthMiddleware>
              } />
              <Route path="/room/:roomId" element={<ChatPage/>} />
              <Route path="/room/create" element={
                <AuthMiddleware>
                  <CreateRoomPage/>
                </AuthMiddleware>
              } />
              <Route path="/room/list" element={<RoomListPage/>} />
              <Route path="/login" element={<LoginPage/>} />
              <Route path="/reset-password" element={<ResetPasswordPage/>} />
              <Route path="/play/:id" element={
                 <AuthMiddleware>
                   <PlayPage/>
                 </AuthMiddleware>
                } />
              <Route path="/quiz-detail/:id" element={<QuizDetailPage/>} />
              <Route path="/profile" element={<ProfilePage/>} />
              <Route path="/manage" element={<ManagePage/>} />
              <Route path="/generate" element={<GenerateQuiz/>} />
          </Routes>
      </Router>
    </main>
    </AuthProvider> 
  )
}

export default App