import { useState, useCallback } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { Home } from "./pages/Home";
import { Explore } from "./pages/Explore";
import { About } from "./pages/About";
import { Reading } from "./pages/Reading";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { AdminDashboard } from "./pages/AdminDashboard";
import { Privacy } from "./pages/Privacy";
import { Terms } from "./pages/Terms";
import { SplashScreen, shouldShowSplash } from "./components/SplashScreen";

export function App() {
  // Abertura animada: só no app instalado, uma vez por sessão (ou com ?splash=1)
  const [showSplash, setShowSplash] = useState(shouldShowSplash);
  const handleSplashFinish = useCallback(() => setShowSplash(false), []);

  return (
    <AuthProvider>
      {showSplash && <SplashScreen onFinish={handleSplashFinish} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/sobre" element={<About />} />
          <Route path="/leitura/:id" element={<Reading />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/login" element={<Login />} />
          <Route path="/perfil" element={<Profile />} />
          {/* Acesso ao painel agora é só pelo login unificado (/login), sem página própria de admin */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;