import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { loginSchema } from "../schemas";
import type { LoginInput } from "../schemas";

import FormField from "../components/FormField";
import { inputClass } from "../components/FormField/inputClass";
import Card from "../components/Card";

const LoginPage = () => {
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      await login(data);
      navigate("/");
    } catch (err: any) {
      setError("root", {
        message:
          err.response?.data?.message ||
          "Login failed. Check your credentials.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">✅ TaskFlow</h1>
          <p className="text-gray-400">Sign in to manage your tasks</p>
        </div>
        <Card>
          <h2 className="text-white font-bold text-xl mb-6">Sign In</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Email" error={errors.email}>
              <input
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className={inputClass(!!errors.email)}
              />
            </FormField>
            <FormField label="Password" error={errors.password}>
              <input
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className={inputClass(!!errors.password)}
              />
            </FormField>
            {errors.root && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-3 text-sm">
                ⚠️ {errors.root.message}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-violet-500 hover:bg-violet-400 disabled:opacity-50
                         text-white font-bold py-3 rounded-xl transition-colors"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            No account?{" "}
            <Link
              to="/register"
              className="text-violet-400 hover:text-violet-300 font-medium"
            >
              Register
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
