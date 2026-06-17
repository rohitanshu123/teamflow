import { useState } from "react";
import { LayoutGrid, Moon, Sun } from "lucide-react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { Button } from "../components/ui/Button";
import { Input, Label } from "../components/ui/Input";
import { useTheme } from "../hooks/useTheme";
import { useNavigate } from "react-router-dom";

export function Signup() {
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError("");

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

      const token = await userCredential.user.getIdToken();

     const response = await fetch("http://localhost:4000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          email,
        }),
      });
      const data = await response.json();


      console.log("Status:", response.status);
console.log("Response:", data);

      alert("Signup successful");

      navigate("/login");
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <button
        onClick={toggle}
        className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground hover:bg-accent"
        aria-label="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <LayoutGrid className="h-7 w-7" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            Create Account
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Join TeamFlow and start collaborating
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Rohit Yogi"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="rohit@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full">
              Create Account
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </form>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing up, you agree to the TeamFlow terms and policies.
        </p>
      </div>
    </div>
  );
}