import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogIn, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect if already logged in
  if (user) {
    navigate("/dashboard", { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);

    if (error) {
      toast({ title: "Login failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Welcome back!" });
      navigate("/dashboard");
    }
  };

  return (
    <Layout>
      <section className="py-20 min-h-[80vh] flex items-center bg-muted">
        <div className="container mx-auto px-4 max-w-md">
          <div className="card-political p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-bold text-card-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground mt-1">Sign in to your campaign account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" placeholder="you@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10" required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Login;
