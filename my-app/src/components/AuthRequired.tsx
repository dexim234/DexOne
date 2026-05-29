"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Lock, UserPlus, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";

interface AuthRequiredProps {
  children?: React.ReactNode;
  title?: string;
  message?: string;
}

export default function AuthRequired({ 
  children, 
  title = "Authentication Required",
  message = "Please sign in or create an account to access this feature"
}: AuthRequiredProps) {
  const { isAuthenticated, setAuthenticated } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowModal(true);
    }
  }, [isAuthenticated]);

  const handleSubmit = async () => {
    if (!email || !password || (mode === 'signup' && !nickname)) {
      return;
    }
    setIsLoading(true);
    // TODO: Implement actual auth
    await new Promise(resolve => setTimeout(resolve, 1000));
    setAuthenticated(true);
    setIsLoading(false);
    setShowModal(false);
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md">
            <Card className="relative">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="p-6 space-y-6">
                <div className="text-center space-y-2">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-teal-500 to-purple-600 flex items-center justify-center mx-auto shadow-lg">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold">{title}</h2>
                  <p className="text-sm text-muted-foreground">{message}</p>
                </div>

                <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                  <button
                    onClick={() => setMode('signup')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      mode === 'signup'
                        ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <UserPlus className="h-4 w-4" />
                    Sign Up
                  </button>
                  <button
                    onClick={() => setMode('login')}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      mode === 'login'
                        ? 'bg-gradient-to-r from-teal-500 to-purple-600 text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <LogIn className="h-4 w-4" />
                    Log In
                  </button>
                </div>

                {mode === 'signup' && (
                  <div className="space-y-2">
                    <Label htmlFor="nickname">Nickname</Label>
                    <Input
                      id="nickname"
                      placeholder="Enter your nickname"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={mode === 'signup' ? "Create a password" : "Enter your password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      {mode === 'signup' ? "Creating account..." : "Logging in..."}
                    </span>
                  ) : (
                    mode === 'signup' ? "Sign Up" : "Log In"
                  )}
                </Button>

                <div className="text-center text-sm text-muted-foreground">
                  {mode === 'signup' ? (
                    <>Already have an account?{" "}
                      <button
                        onClick={() => setMode('login')}
                        className="text-teal-500 hover:text-teal-400 font-semibold"
                      >
                        Log In
                      </button>
                    </>
                  ) : (
                    <>Don't have an account?{" "}
                      <button
                        onClick={() => setMode('signup')}
                        className="text-teal-500 hover:text-teal-400 font-semibold"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </div>

                <div className="pt-4 border-t border-border/30 text-center">
                  <p className="text-xs text-muted-foreground mb-2">Or continue as guest</p>
                  <Link href="/market-hub">
                    <Button variant="outline" size="sm" className="w-full">
                      Go to Market Hub
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Content behind overlay */}
      {children && <div className="opacity-30 pointer-events-none">{children}</div>}
    </>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-card rounded-2xl shadow-2xl border border-border/50 ${className}`}>
      {children}
    </div>
  );
}