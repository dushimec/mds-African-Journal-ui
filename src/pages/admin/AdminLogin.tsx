import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Lock, Mail, ShieldCheck } from "lucide-react";
import { toast } from "react-toastify";
import { loginUser } from "@/api/auth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser(form);

      if (res.requiresTwoFactor) {
        toast.info("2FA code sent to your admin email");
        navigate("/admin/verify-2fa", { state: { email: form.email } });
        return;
      }

      localStorage.setItem("access_token", res.token);
      toast.success("Welcome back Admin!");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-gray-200 rounded-3xl shadow-2xl overflow-hidden">
          <CardHeader className="bg-primary text-white py-8 text-center space-y-2">
            <CardTitle className="text-3xl font-extrabold flex items-center justify-center gap-2">
              <ShieldCheck className="h-7 w-7 text-blue-200" />
              Admin Login
            </CardTitle>
            <p className="text-blue-100">Secure access to your dashboard</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  name="email"
                  type="email"
                  placeholder="Admin Email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="text-right">
                <a
                  href="/admin/forgot-password"
                  className="text-blue-600 hover:underline text-sm"
                >
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-900 text-white py-3 text-lg font-semibold rounded-xl"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" /> Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
