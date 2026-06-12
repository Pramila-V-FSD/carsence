import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ShortlistProvider } from "./contexts/ShortlistContext";
import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import CarGrid from "./components/CarGrid";
import CarDetail from "./components/CarDetail";
import CompareView from "./components/CompareView";
import ShortlistPage from "./components/ShortlistPage";
import ChatAdvisor from "./components/ChatAdvisor";
import CarQuiz from "./components/CarQuiz";
import "./index.css";

function HomePage() {
  return (
    <>
      <HeroSection />
    </>
  );
}

function App() {
  return (
    <Router>
      <ShortlistProvider>
        <div className="app min-h-screen bg-slate-950 text-slate-100 font-sans">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<CarGrid />} />
              <Route path="/car/:id" element={<CarDetail />} />
              <Route path="/compare" element={<CompareView />} />
              <Route path="/shortlist" element={<ShortlistPage />} />
              <Route path="/quiz" element={<CarQuiz />} />
            </Routes>
          </main>
          <ChatAdvisor />
        </div>
      </ShortlistProvider>
    </Router>
  );
}

export default App;
