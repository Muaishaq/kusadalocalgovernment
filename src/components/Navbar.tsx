import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/manifesto", label: "Manifesto" },
  { to: "/about", label: "About" },
  { to: "/directory", label: "Polling Units" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-secondary/95 backdrop-blur-md border-b border-secondary">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="font-display text-primary-foreground text-sm font-bold">AI</span>
          </div>
          <span className="font-display text-lg font-bold text-secondary-foreground">
            Aliyu Ismail
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "bg-primary text-primary-foreground"
                  : "text-secondary-foreground/80 hover:text-secondary-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link to="/dashboard">
                <Button variant="ghost" size="sm" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  <LayoutDashboard className="w-4 h-4 mr-1" /> Dashboard
                </Button>
              </Link>
              <span className="text-secondary-foreground/60 text-xs">{profile?.full_name || user.email}</span>
              <Button variant="ghost" size="sm" className="text-secondary-foreground/80 hover:text-secondary-foreground" onClick={handleSignOut}>
                <LogOut className="w-4 h-4 mr-1" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-secondary-foreground/80 hover:text-secondary-foreground">
                  <User className="w-4 h-4 mr-1" /> Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 font-semibold">
                  Join Campaign
                </Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-secondary-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden bg-secondary border-t border-secondary pb-4">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setOpen(false)}
              className={`block px-6 py-3 text-sm font-medium ${
                location.pathname === link.to
                  ? "text-primary bg-primary/10"
                  : "text-secondary-foreground/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="px-6 pt-2 flex gap-2">
            {user ? (
              <>
                <Link to="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="text-secondary-foreground/80">Dashboard</Button>
                </Link>
                <Button variant="ghost" size="sm" className="text-secondary-foreground/80" onClick={() => { handleSignOut(); setOpen(false); }}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="ghost" size="sm" className="text-secondary-foreground/80">Login</Button>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}>
                  <Button size="sm" className="bg-accent text-accent-foreground font-semibold">Join Campaign</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
