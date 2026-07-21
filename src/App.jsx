import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HeaderSlotProvider } from './components/layout/HeaderSlot'
import SeoHead from './components/SeoHead'
import Nav from './components/layout/Nav'
import ViewerPage from './pages/ViewerPage'
import AdminPage from './pages/AdminPage'
import AboutPage from './pages/AboutPage'

export default function App() {
  return (
    <BrowserRouter>
      <HeaderSlotProvider>
        <SeoHead />
        <Nav />
        <Routes>
          <Route path="/" element={<ViewerPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </HeaderSlotProvider>
    </BrowserRouter>
  )
}
