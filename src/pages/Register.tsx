// import { useState } from "react";
// import { motion } from "framer-motion";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
// import { Loader2, LogIn, Mail, Lock, User } from "lucide-react";
// import { loginUser, registerUser } from "../api/auth";
// import { useNavigate } from "react-router-dom";

// const Auth = () => {
//   const [tab, setTab] = useState("login");
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const navigate = useNavigate();

//   const [loginForm, setLoginForm] = useState({ email: "", password: "" });
//   const [registerForm, setRegisterForm] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>, formType: "login" | "register") => {
//     const { name, value } = e.target;
//     formType === "login"
//       ? setLoginForm((prev) => ({ ...prev, [name]: value }))
//       : setRegisterForm((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     try {
//       if (tab === "login") {
//         const res = await loginUser(loginForm);
//         localStorage.setItem("access_token", res.token);
//         setMessage("✅ Login successful!");
//       } else {
//         await registerUser(registerForm);
//         setMessage("✅ Registration successful! Check your email for the code.");
//         navigate("/verify-email", { state: { email: registerForm.email } });
//       }
//     } catch (err: any) {
//       setMessage(err.response?.data?.message || "❌ Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex items-start justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-50 pt-12 px-4">
//       <motion.div
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.4 }}
//         className="w-full max-w-2xl"
//       >
//         <Card className="shadow-2xl border border-gray-200 rounded-3xl overflow-hidden">
//           <CardHeader className="text-center space-y-2 bg-blue-600 text-white py-8">
//             <CardTitle className="text-4xl font-extrabold tracking-tight">
//               ScholarHub
//             </CardTitle>
//             <p className="text-blue-100 text-lg">
//               Your gateway to research & collaboration
//             </p>
//           </CardHeader>

//           <CardContent className="p-10">
//             <Tabs value={tab} onValueChange={setTab} className="w-full">
//               <TabsList className="grid w-full grid-cols-2 mb-10 rounded-xl bg-gray-100 text-lg font-semibold">
//                 <TabsTrigger value="login" className="py-3">Login</TabsTrigger>
//                 <TabsTrigger value="register" className="py-3">Register</TabsTrigger>
//               </TabsList>

//               {/* LOGIN TAB */}
//               <TabsContent value="login">
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="relative">
//                     <Mail className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
//                     <Input
//                       name="email"
//                       type="email"
//                       placeholder="Email address"
//                       value={loginForm.email}
//                       onChange={(e) => handleChange(e, "login")}
//                       required
//                       className="pl-12 py-3 text-lg rounded-xl"
//                     />
//                   </div>
//                   <div className="relative">
//                     <Lock className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
//                     <Input
//                       name="password"
//                       type="password"
//                       placeholder="Password"
//                       value={loginForm.password}
//                       onChange={(e) => handleChange(e, "login")}
//                       required
//                       className="pl-12 py-3 text-lg rounded-xl"
//                     />
//                   </div>

//                   <div className="flex justify-between items-center text-sm">
//                     <a href="#" className="text-blue-600 hover:underline">
//                       Forgot password?
//                     </a>
//                   </div>

//                   <Button
//                     type="submit"
//                     className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="animate-spin mr-2 h-5 w-5" /> Logging in...
//                       </>
//                     ) : (
//                       <>
//                         <LogIn className="mr-2 h-5 w-5" /> Login
//                       </>
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>

//               {/* REGISTER TAB */}
//               <TabsContent value="register">
//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   <div className="flex gap-4">
//                     <div className="relative flex-1">
//                       <User className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
//                       <Input
//                         name="firstName"
//                         placeholder="First name"
//                         value={registerForm.firstName}
//                         onChange={(e) => handleChange(e, "register")}
//                         required
//                         className="pl-12 py-3 text-lg rounded-xl"
//                       />
//                     </div>
//                     <div className="relative flex-1">
//                       <User className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
//                       <Input
//                         name="lastName"
//                         placeholder="Last name"
//                         value={registerForm.lastName}
//                         onChange={(e) => handleChange(e, "register")}
//                         required
//                         className="pl-12 py-3 text-lg rounded-xl"
//                       />
//                     </div>
//                   </div>
//                   <div className="relative">
//                     <Mail className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
//                     <Input
//                       name="email"
//                       type="email"
//                       placeholder="Email address"
//                       value={registerForm.email}
//                       onChange={(e) => handleChange(e, "register")}
//                       required
//                       className="pl-12 py-3 text-lg rounded-xl"
//                     />
//                   </div>
//                   <div className="relative">
//                     <Lock className="absolute top-4 left-4 h-5 w-5 text-gray-400" />
//                     <Input
//                       name="password"
//                       type="password"
//                       placeholder="Password"
//                       value={registerForm.password}
//                       onChange={(e) => handleChange(e, "register")}
//                       required
//                       className="pl-12 py-3 text-lg rounded-xl"
//                     />
//                   </div>
//                   <Button
//                     type="submit"
//                     className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold rounded-xl transition-colors"
//                     disabled={loading}
//                   >
//                     {loading ? (
//                       <>
//                         <Loader2 className="animate-spin mr-2 h-5 w-5" /> Creating...
//                       </>
//                     ) : (
//                       <>Register</>
//                     )}
//                   </Button>
//                 </form>
//               </TabsContent>
//             </Tabs>

//             {message && (
//               <motion.p
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className={`text-center mt-6 text-base font-medium ${
//                   message.includes("✅") ? "text-green-600" : "text-red-500"
//                 }`}
//               >
//                 {message}
//               </motion.p>
//             )}
//           </CardContent>
//         </Card>
//       </motion.div>
//     </div>
//   );
// };

// export default Auth;
