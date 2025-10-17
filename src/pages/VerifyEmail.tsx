import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail } from "lucide-react";
import { verifyEmail, resendCode } from "../api/auth";

const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = (location.state as any)?.email || "";
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleVerify = async () => {
    setLoading(true);
    setMessage("");
    try {
      await verifyEmail({ email, code });
      setMessage("✅ Email verified successfully!");
      // Redirect to submission page after verification
      setTimeout(() => navigate("/submission"), 1000);
    } catch (err: any) {
      setMessage(err.response?.data?.message || "❌ Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendCode(email);
      setMessage("✅ Verification code resent!");
    } catch {
      setMessage("❌ Could not resend code. Try again later.");
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 pt-16 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="border border-gray-200 rounded-3xl overflow-hidden shadow-2xl">
          <CardHeader className="text-center space-y-2 bg-primary text-white py-8">
            <CardTitle className="text-3xl font-extrabold tracking-tight">
              Verify Email
            </CardTitle>
            <p className="text-blue-100 text-lg">
              Enter the code sent to <b>{email}</b>
            </p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Verification Code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>

              <Button
                onClick={handleVerify}
                className="w-full bg-primary hover:bg-blue-900 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-5 w-5" /> Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>

              <Button
                onClick={handleResend}
                className="w-full bg-primary hover:bg-blue-900 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
              >
                Resend Code
              </Button>

              {message && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-center mt-4 text-base font-medium ${
                    message.includes("✅") ? "text-black" : "text-red-500"
                  }`}
                >
                  {message}
                </motion.p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmail;
