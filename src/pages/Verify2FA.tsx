import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ShieldCheck } from "lucide-react";
import { verifyTwoFactor } from "../api/auth";

const Verify2FA = () => {
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
      const res = await verifyTwoFactor({ email, code });

      if (res.token) {
        localStorage.setItem("access_token", res.token);
        setMessage("✅ 2FA verification successful!");
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage("❌ Invalid code. Try again.");
      }
    } catch (err: any) {
      setMessage(err.response?.data?.message || "❌ Code expired or incorrect.");
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
        className="w-full max-w-md"
      >
        <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-2xl">
          <CardHeader className="text-center space-y-2 bg-primary text-white py-8">
            <CardTitle className="text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
              <ShieldCheck className="h-7 w-7 text-blue-200" />
              Two-Factor Verification
            </CardTitle>
            <p className="text-blue-100 text-lg">
              Enter the 6-digit code sent to <b>{email}</b>
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="py-3 text-center text-lg tracking-widest rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  maxLength={6}
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
                  "Verify Code"
                )}
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

export default Verify2FA;
