import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";
import { Redirect } from "wouter";
import { Wallet, Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const registerSchema = insertUserSchema.extend({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const { user, loginMutation, registerMutation } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (user) {
    return <Redirect to="/" />;
  }

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
      username: "",
    },
  });

  const handleLogin = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const handleRegister = (data: RegisterFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-success-50 px-4">
      <div className="max-w-md w-full">
        <Card className="shadow-xl">
          <CardContent className="pt-8 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4">
                <Wallet className="text-white text-2xl" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Finance Tracker</h1>
              <p className="text-gray-600 mt-2">Manage your finances with confidence</p>
            </div>

            {/* Auth Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  isLogin
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-600"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 px-4 rounded-md font-medium transition-all ${
                  !isLogin
                    ? "bg-white shadow-sm text-primary"
                    : "text-gray-600"
                }`}
              >
                Sign Up
              </button>
            </div>

            {isLogin ? (
              <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Label>
                  <Input
                    {...loginForm.register("email")}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Label>
                  <Input
                    {...loginForm.register("password")}
                    type="password"
                    placeholder="Enter your password"
                    className="w-full"
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {loginForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </Label>
                  <Input
                    {...registerForm.register("fullName")}
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full"
                  />
                  {registerForm.formState.errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </Label>
                  <Input
                    {...registerForm.register("username")}
                    type="text"
                    placeholder="Choose a username"
                    className="w-full"
                  />
                  {registerForm.formState.errors.username && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerForm.formState.errors.username.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </Label>
                  <Input
                    {...registerForm.register("email")}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full"
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerForm.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </Label>
                  <Input
                    {...registerForm.register("password")}
                    type="password"
                    placeholder="Create a strong password"
                    className="w-full"
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-red-500 text-sm mt-1">
                      {registerForm.formState.errors.password.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={registerMutation.isPending}
                  className="w-full bg-success hover:bg-success/90"
                >
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
