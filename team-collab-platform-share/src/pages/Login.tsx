import { useState } from 'react'
import { LayoutGrid, Shield, UserCog, User as UserIcon } from 'lucide-react'
import { useAuth } from '../store/AuthContext'
import { SEED_USERS } from '../data/seed'
import { Button } from '../components/ui/Button'
import { Input, Label } from '../components/ui/Input'
import { useTheme } from '../hooks/useTheme'
import { Moon, Sun } from 'lucide-react'
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";


const QUICK = [
  { role: 'ADMIN' as const, icon: Shield, desc: 'Full access — manage team, delete projects' },
  { role: 'MANAGER' as const, icon: UserCog, desc: 'Create/edit projects, assign tasks' },
  { role: 'MEMBER' as const, icon: UserIcon, desc: 'View projects, work on assigned tasks' },
]

export function Login() {
  const { signIn, signInAs } = useAuth()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [password, setPassword] = useState("")

    const navigate = useNavigate();


    const handleLogin = async () => {
  try {
    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    console.log(
      "Logged in:",
      userCredential.user.email
    );
  } catch (error) {
    console.error(error);
  }
};

async function submit(e: React.FormEvent) {
  e.preventDefault();

  try {
    setError("");

    const userCredential =
      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      // 👇 THIS IS THE LOGIN SUCCESS BLOCK
    console.log("Login successful");
    console.log(userCredential.user);

    const token =
      await userCredential.user.getIdToken();

    console.log("Firebase Token:", token);


    alert("Login successful");

    navigate("/dashboard");

  } catch (err: any) {
    console.error(err);
    setError(err.message);
  }
}

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <button
        onClick={toggle}
        className="absolute right-4 top-4 rounded-md p-2 text-muted-foreground hover:bg-accent"
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
      </button>

      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <LayoutGrid className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">TeamFlow</h1>
          <p className="mt-1 text-sm text-muted-foreground">Real-time team collaboration — demo workspace</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="asha@teamflow.dev"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />
              {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>}
            </div>
            <div>
  <Label htmlFor="password">
    Password
  </Label>

  <Input
    id="password"
    type="password"
    placeholder="Enter password"
    value={password}
    onChange={(e) =>
      setPassword(e.target.value)
    }
  />
</div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

           <form  className="space-y-4">
            <div>
              {/* <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="asha@teamflow.dev"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setError('')
                }}
              />
              {error && <p className="mt-1.5 text-sm text-destructive">{error}</p>} */}
            </div>
            <Button type="button" className="w-full" onClick={() =>{     console.log("clicked");navigate("/signup");     console.log("navigated");
}}>
              Sign Up
            </Button>
          </form>


          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            QUICK DEMO LOGIN
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            {QUICK.map(({ role, icon: Icon, desc }) => {
              const user = SEED_USERS.find((u) => u.role === role)!
              return (
                <button
                  key={role}
                  onClick={() => signInAs(role)}
                  className="flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary hover:bg-accent"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium">
                      {role.charAt(0) + role.slice(1).toLowerCase()} · {user.name}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">{desc}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Demo only — mock authentication, no real accounts or external data.
        </p>
      </div>
    </div>
  )
}
