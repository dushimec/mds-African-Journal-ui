import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// ===== TYPES =====
export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyEmailData {
  email: string;
  code: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

// ===== RESPONSE TYPES =====
export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
  requiresTwoFactor?: boolean;
}

export interface VerifyEmailResponse {
  success: boolean;
  message: string;
}

export interface ResendCodeResponse {
  success: boolean;
  message: string;
}

// ===== API CALLS =====
export const registerUser = async (
  data: RegisterData
): Promise<RegisterResponse> => {
  const res = await axios.post<RegisterResponse>(`${API}/auth/register`, data);
  return res.data;
};

export const loginUser = async (data: LoginData): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(`${API}/auth/login`, data);
  return res.data;
};

export const verifyEmail = async (
  data: VerifyEmailData
): Promise<VerifyEmailResponse> => {
  const res = await axios.post<VerifyEmailResponse>(
    `${API}/auth/verify-email`,
    data
  );
  return res.data;
};

export const verifyTwoFactor = async (data: {
  email: string;
  code: string;
}): Promise<LoginResponse> => {
  const res = await axios.post<LoginResponse>(`${API}/auth/verify-2fa`, data);
  return res.data;
};


export const resendCode = async (email: string): Promise<ResendCodeResponse> => {
  const res = await axios.post<ResendCodeResponse>(`${API}/auth/resend-code`, {
    email,
  });
  return res.data;
};
