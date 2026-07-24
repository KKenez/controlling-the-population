import { Routes, Route, Navigate } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import RoutinesPage from './pages/RoutinesPage'
import RoutineEditorPage from './pages/RoutineEditorPage'
import GenerateWeekPage from './pages/GenerateWeekPage'
import SettingsPage from './pages/SettingsPage'
import BacklogPage from './pages/BacklogPage'
import NotesPage from './pages/NotesPage'
import DashboardPage from './pages/DashboardPage'
import DayReviewPage from './pages/DayReviewPage'
import Sidebar from './components/layout/Sidebar'

export default function App() {
  return (
    <div className="flex h-screen bg-kimbie-bg">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/routines" element={<RoutinesPage />} />
          <Route path="/routines/new" element={<RoutineEditorPage />} />
          <Route path="/routines/:id" element={<RoutineEditorPage />} />
          <Route path="/backlog" element={<BacklogPage />} />
          <Route path="/notes" element={<NotesPage />} />
          <Route path="/review" element={<DayReviewPage />} />
          <Route path="/generate" element={<GenerateWeekPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>
    </div>
  )
}
