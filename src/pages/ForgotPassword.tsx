import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      toast.success("✅ Password reset link sent! Check your email.");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "❌ Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 pt-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="border border-gray-200 rounded-3xl overflow-hidden shadow-lg">
          <CardHeader className="text-center space-y-2 bg-primary text-white py-8">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              Forgot Password
            </CardTitle>
            <p className="text-blue-100 text-base">
              Enter your email to receive a reset link
            </p>
          </CardHeader>

          <CardContent className="p-10">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-blue-900 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" /> Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <Button
                variant="ghost"
                onClick={() => navigate("/login")}
                className="text-blue-600 hover:text-blue-800"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
