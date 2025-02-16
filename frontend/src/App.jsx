
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import 'bootstrap-icons/font/bootstrap-icons.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import 'boxicons/css/boxicons.min.css'
import 'sweetalert2/dist/sweetalert2.min.css'

import { BrowserRouter as Router , Routes, Route } from "react-router-dom";
import List from './components/Users/list';
import AdminPage from './pages/Admin/AdminPage';
import Assessments from './pages/Admin/Assessments';
import ChatPage from './pages/RoomQuestion/ChatPage';
import QuestionPage from './pages/Admin/QuestionsPage'

import QuestionsPage from './pages/QuestionsPage'

const globalStyles = {
  body: {
    fontFamily: 'cnn_sans_display, helveticaneue, Helvetica, Arial, Utkal, sans-serif'
  }
}

// Add global styles
document.body.style.fontFamily = globalStyles.body.fontFamily

function App() {
  return (
    <main>
      <Router>
          <Routes>
              <Route path="/" element={<List/>} />
              <Route path="/questions" element={<QuestionsPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/admin/assessments" element={<Assessments/>} />
              <Route path="/admin/question" element={<QuestionPage/>} />
              <Route path="/room/chat" element={<ChatPage/>} />
          </Routes>
      </Router>
    </main>
  )
}

export default App