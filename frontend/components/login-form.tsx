"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, Github } from "lucide-react";

interface LoginFormProps {
  onLoginSuccess: (token: string, user: any) => void;
}

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOIDC, setShowOIDC] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const redirectUri = `${window.location.origin}/auth/callback`;
      const response = await fetch(`/api/v1/auth/oidc/login?redirect_uri=${encodeURIComponent(redirectUri)}`);
      
      if (!response.ok) {
        throw new Error('Failed to start OIDC login');
      }
      
      const data = await response.json();
      
      // Store state for CSRF protection
      localStorage.setItem('oidc_state', data.state);
      
      // Redirect to Google OAuth
      window.location.href = data.authorization_url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimpleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      const response = await fetch('/api/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`,
      });
      
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      
      const data = await response.json();
      onLoginSuccess(data.access_token, { email: username });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Anmelden</CardTitle>
          <CardDescription className="text-center">
            Melde dich bei deinem AI Gateway an
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* OIDC Login Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              Mit Google Workspace anmelden
            </Button>
            
            <Button
              onClick={() => setShowOIDC(!showOIDC)}
              variant="ghost"
              className="w-full text-sm"
            >
              {showOIDC ? 'Einfache Anmeldung' : 'OIDC-Konfiguration'}
            </Button>
          </div>

          {/* Simple Login Form */}
          {showOIDC && (
            <form onSubmit={handleSimpleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">E-Mail</Label>
                <Input
                  id="username"
                  name="username"
                  type="email"
                  placeholder="deine.email@duh.de"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Anmelden
              </Button>
            </form>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Info */}
          <div className="text-xs text-muted-foreground text-center">
            <p>Für DUH-Mitarbeiter mit Google Workspace-Account</p>
            <p>Oder verwende die einfache Anmeldung für Tests</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
