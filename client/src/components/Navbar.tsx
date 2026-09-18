import { Link, NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, LogOut, Search } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { Button } from "./Button";

/** Top navigation. Shows the account menu only when signed in. */
export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-semibold transition ${
      isActive ? "bg-ink text-white" : "text-ink hover:bg-black/5"
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/85 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
        <Link to="/" className="mr-1 flex items-center gap-2 text-lg font-extrabold text-brand">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-white">P</span>
          <span className="hidden sm:inline">Pinboard</span>
        </Link>

        {user && (
          <>
            <NavLink to="/" end className={linkClass}>
              <LayoutGrid size={16} /> Boards
            </NavLink>
            <NavLink to="/search" className={linkClass}>
              <Search size={16} /> Discover
            </NavLink>
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <span className="hidden text-sm text-ink-soft sm:inline">@{user.username}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
              >
                <LogOut size={16} /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Sign up
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
