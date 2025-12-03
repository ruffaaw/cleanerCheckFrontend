"use client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validatePasswords = () => {
    if (!password || !passwordConfirm) return;
    if (password !== passwordConfirm) setError("Hasła nie są takie same.");
    else setError("");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    validatePasswords();
    if (password !== passwordConfirm) return;

    try {
      await api.post(
        "/auth/changepassword",
        { newPassword: password, confirmPassword: passwordConfirm },
        { withCredentials: true }
      );
      router.push("/pracownicy");
    } catch {
      setError("Nie udało się zmienić hasła.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <Card className="w-full max-w-sm sm:max-w-md md:max-w-lg shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl sm:text-2xl">Zmiana hasła</CardTitle>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <form
            onSubmit={handleChangePassword}
            className="space-y-4 sm:space-y-6"
          >
            <div className="space-y-1">
              <Label className="text-sm sm:text-base">Hasło</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onBlur={validatePasswords}
                className="text-sm sm:text-base"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm sm:text-base">Potwierdź hasło</Label>
              <Input
                type="password"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
                required
                onBlur={validatePasswords}
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
              disabled={loading}
            >
              {loading ? (
                <Spinner className="text-5 sm:size-6 text-white" />
              ) : (
                "Zmień hasło"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter />
      </Card>
    </div>
  );
}
