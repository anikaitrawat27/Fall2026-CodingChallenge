import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./hooks/useToast";
import { Navbar } from "./components/Navbar";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Boards } from "./pages/Boards";
import { BoardDetail } from "./pages/BoardDetail";
import { Search } from "./pages/Search";
import { SharedBoard } from "./pages/SharedBoard";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { NotFound } from "./pages/NotFound";

/**
 * Route map:
 *   /             boards home        (auth required)
 *   /search       discover images    (auth required)
 *   /boards/:id   a single board     (auth required)
 *   /s/:slug      public share link  (no auth)
 *   /login        sign in
 *   /register     create an account
 */
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-full">
            <Navbar />
            <main>
              <Routes>
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Boards />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <Search />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/boards/:id"
                  element={
                    <ProtectedRoute>
                      <BoardDetail />
                    </ProtectedRoute>
                  }
                />

                {/* Public — deliberately outside ProtectedRoute. */}
                <Route path="/s/:slug" element={<SharedBoard />} />

                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                <Route path="/index.html" element={<Navigate to="/" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
          </div>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
