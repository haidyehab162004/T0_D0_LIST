import React from 'react'
import DescriptionOnForm from './Components/DescriptionOnForm'
import Inputs from './Shared/Inputs'
import { Icon } from '@iconify/react';
import Buttons from '../../../Components/Ui/Buttons';
import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../Auth/useAuth.js'
import { useNavigate } from 'react-router-dom';
// import ForgotPassword from './Components/ForgotPassword.jsx';

export default function LoginForm() {

    const [email, setEmail] = useState(
        () => localStorage.getItem("rememberedEmail") || ""
    );
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [show, setShow] = useState(false);
    const { login, googleLogin } = useAuth()
    const [loading, setLoading] = useState(false)
    const [formError, setFormError] = useState('')
    const [needsEmailVerification, setNeedsEmailVerification] = useState(false)


    const navigate = useNavigate();


    async function handleSubmit(event) {
        event.preventDefault();

        setLoading(true);
        setFormError('');
        setNeedsEmailVerification(false);

        try {
            await login({ email, password });
            if (rememberMe) {
                localStorage.setItem("rememberedEmail", email);
            } else {
                localStorage.removeItem("rememberedEmail");
            }
            navigate("/dashboard");
        }
        catch (error) {
            const apiError = error.response?.data;
            const emailIsUnverified = apiError?.code === 'EMAIL_NOT_VERIFIED';

            setNeedsEmailVerification(emailIsUnverified);
            setFormError(
                apiError?.message || 'تعذر تسجيل الدخول. تأكدي من البريد الإلكتروني وكلمة المرور.'
            );
            console.error("Login error:", apiError?.message || error.message);
        }
        finally {
            setLoading(false);
        }
    }
    async function handleGoogleSuccess(response) {
        if (!response.credential) {
            setFormError('لم نستطع استلام بيانات تسجيل الدخول من Google. حاولي مرة أخرى.');
            return;
        }

        setLoading(true);
        setFormError('');
        setNeedsEmailVerification(false);
        try {
            await googleLogin(response.credential);
            navigate('/dashboard');
        } catch (error) {
            const message = error.response?.data?.message || 'تعذر تسجيل الدخول باستخدام Google.';
            setFormError(message);
            console.error('Google login error:', message);
        } finally {
            setLoading(false);
        }
    }

    function handleGoogleError() {
        setFormError('لم يكتمل تسجيل الدخول عبر Google. حاولي مرة أخرى.');
    }

    return (
        <div className="flex items-center align-top flex-col justify-self-auto pt-20 h-full bg-gray-200">
            <DescriptionOnForm />
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md mt-3">
                <div className="mb-4 p-4">
                    <h1 className="text-2xl font-bold ">Welcome back</h1>
                    <p className="text-gray-600 ">Sign in to your account to continue</p>
                </div>
                <form onSubmit={handleSubmit}  >
                    <div className="px-4">
                        <Inputs
                            titel="Email address"
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            icon={
                                <Icon
                                    icon="mdi:email-outline"
                                    width="20"
                                    height="20"
                                    className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-500"
                                />
                            }
                        />
                        <Inputs
                            titel="Password"
                            required
                            type={show ? "text" : "password"}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            icon={
                                <Icon
                                    icon="mdi:lock-outline"
                                    width="20"
                                    height="20"
                                    className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-500"
                                />
                            }
                            rightElement={
                                <Icon
                                    icon="mdi:eye-outline"
                                    width="20"
                                    height="20"
                                    onClick={() => setShow(!show)}
                                />
                            }
                        />
                    </div>
                    {formError && (
                        <div role="alert" className="mx-4 mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                            <p>{formError}</p>
                            {needsEmailVerification && (
                                <button
                                    type="button"
                                    onClick={() => navigate('/verify-email', { state: { email } })}
                                    className="mt-2 font-semibold text-blue-800 underline"
                                >
                                    Verify your email
                                </button>
                            )}
                        </div>
                    )}
                    <div className="flex items-center justify-between mt-6 text-sm px-4 pb-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) => setRememberMe(event.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                            />
                            Remember me
                        </label>
                        <NavLink to="/forgotPassword" className="font-semibold text-blue-800">Forgot password?</NavLink>
                    </div>
                    <Buttons type="submit" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In →"}
                    </Buttons>
                </form>
                <div className="flex flex-col items-center justify-center gap-6">
                    <p className="mt-6 text-center text-sm text-gray-600">
                        _____________________________ OR _____________________________
                    </p>
                    {import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
                        <GoogleLogin
                            onSuccess={handleGoogleSuccess}
                            onError={handleGoogleError}
                            text="signin_with"
                            shape="rectangular"
                            width="350"
                        />
                    ) : (
                        <p role="status" className="px-4 text-center text-sm text-amber-700">
                            Google sign-in is not configured. Set VITE_GOOGLE_CLIENT_ID in the client environment.
                        </p>
                    )}
                </div>
            </div>

            <div>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account? <NavLink to="/register" className="font-semibold text-blue-800">Create Account</NavLink>
                </p>
            </div>
        </div>

    )
}
