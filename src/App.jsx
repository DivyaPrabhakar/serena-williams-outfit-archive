import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HeaderSlotProvider } from './components/layout/HeaderSlot'
import Nav from './components/layout/Nav'
import ViewerPage from './pages/ViewerPage'
import AdminPage from './pages/AdminPage'
import AboutPage from './pages/AboutPage'
import SubmitPage from './pages/SubmitPage'

export default function App() {
  return (
    <BrowserRouter>
      <HeaderSlotProvider>
        <Nav />
        <Routes>
          <Route path="/" element={<ViewerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </HeaderSlotProvider>
    </BrowserRouter>
  )
}
