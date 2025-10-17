import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, LogIn, Mail, Lock, User, UserPlus } from "lucide-react";
import { loginUser, registerUser } from "../api/auth";
import { useNavigate } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import {toast} from 'react-toastify'

const Auth = () => {
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formType: "login" | "register"
  ) => {
    const { name, value } = e.target;
    formType === "login"
      ? setLoginForm((prev) => ({ ...prev, [name]: value }))
      : setRegisterForm((prev) => ({ ...prev, [name]: value }));
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setMessage("");

  try {
    if (tab === "login") {
      const res = await loginUser(loginForm);

      // If 2FA is required
      if (res.requiresTwoFactor) {
        setMessage("🔒 2FA code sent to your email. Please verify.");
        navigate("/verify-2fa", { state: { email: loginForm.email } });
        return;
      }

      // Save token
      localStorage.setItem("access_token", res.token!);
      toast.success("Login successful!");
      navigate("/submission")

    } else {
      // Register flow
      const res:any  = await registerUser(registerForm);
      if (res.error && res.error === "EMAIL_EXISTS") {
      toast.error("❌ Email already exists. Please login or use another email.");
      return;
       }
      toast.success("✅ Registration successful! Check your email for the code.");
      navigate("/verify-email", { state: { email: registerForm.email } });
       }

  } catch (err: any) {
    toast.error('Invalid Email or Password')
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
        className="w-full max-w-2xl"
      >
        <Card className="border border-gray-200 rounded-3xl overflow-hidden">
          {/* HEADER */}
          <CardHeader className="text-center space-y-2 bg-primary text-white py-8">
            <CardTitle className="text-4xl font-extrabold tracking-tight">
              African Journal
            </CardTitle>
            <p className="text-blue-100 text-lg">
              Your gateway to research & collaboration
            </p>
          </CardHeader>

          <CardContent className="p-10">
            {/* TABS */}
            <Tabs value={tab} onValueChange={setTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-10 rounded-xl bg-gray-100 text-lg font-semibold">
                <TabsTrigger value="login" className="py-3">
                  Login
                </TabsTrigger>
                <TabsTrigger value="register" className="py-3">
                  Register
                </TabsTrigger>
              </TabsList>

              {/* LOGIN TAB */}
              <TabsContent value="login">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      value={loginForm.email}
                      onChange={(e) => handleChange(e, "login")}
                      required
                      className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={loginForm.password}
                      onChange={(e) => handleChange(e, "login")}
                      required
                      className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <a href="#" className="text-blue-600 hover:underline">
                      Forgot password?
                    </a>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-blue-900 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" /> Logging in...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-5 w-5" /> Login
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* REGISTER TAB */}
              <TabsContent value="register">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex gap-4">
                    {/* First Name */}
                    <div className="relative flex-1">
                      <User className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        name="firstName"
                        placeholder="First name"
                        value={registerForm.firstName}
                        onChange={(e) => handleChange(e, "register")}
                        required
                        className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                    </div>

                    {/* Last Name */}
                    <div className="relative flex-1">
                      <User className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <Input
                        name="lastName"
                        placeholder="Last name"
                        value={registerForm.lastName}
                        onChange={(e) => handleChange(e, "register")}
                        required
                        className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <Mail className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Email address"
                      value={registerForm.email}
                      onChange={(e) => handleChange(e, "register")}
                      required
                      className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>

                  {/* Password */}
                  <div className="relative">
                    <Lock className="absolute top-1/2 left-4 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      name="password"
                      type="password"
                      placeholder="Password"
                      value={registerForm.password}
                      onChange={(e) => handleChange(e, "register")}
                      required
                      className="pl-12 py-3 text-lg rounded-xl border border-gray-300 shadow-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-blue-900 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" /> Creating...
                      </>
                    ) : (
                      <>
                        <UserPlus className="mr-2 h-5 w-5" /> Register
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {/* MESSAGE */}
            {message && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`text-center mt-6 text-base font-medium ${
                  message.includes("✅") ? "text-green-600" : "text-red-500"
                }`}
              >
                {message}
              </motion.p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Auth;
