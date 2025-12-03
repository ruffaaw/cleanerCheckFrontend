// Next.js + shadcn/ui Login component with httpOnly cookie auth
// File: src/app/login/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const [name, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post(
        "/auth/login",
        { name, password },
        { withCredentials: true }
      );

      response.data.resetPassword
        ? router.push("/zmiana-hasla")
        : router.push("/pracownicy");
    } catch (err: any) {
      setError("Nieprawidłowy email lub hasło");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">Logowanie</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
            <div className="space-y-1">
              <Label className="text-sm sm:text-base">Login</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="text-sm sm:text-base"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-sm sm:text-base">Hasło</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm sm:text-base"
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button
              className="w-full py-2 sm:py-3 text-sm sm:text-base"
              type="submit"
            >
              Zaloguj
            </Button>
          </form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}

// axios instance for cookies (src/lib/api.ts)
// import axios from "axios";
// const api = axios.create({
//   baseURL: process.env.NEXT_PUBLIC_API_URL,
//   withCredentials: true,
// });
// export default api;

// backend should respond with Set-Cookie: token=JWT; HttpOnly; Secure; SameSite=Strict;
