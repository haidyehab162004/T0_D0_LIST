import React from 'react'
import DescriptionOnForm from './Components/DescriptionOnForm'
import Inputs from './Shared/Inputs'
import { Icon } from '@iconify/react';
import Buttons from '../../../Components/Ui/Buttons';
import { useState } from 'react';
import { supabase } from "../../../lib/supabase"
import { NavLink } from 'react-router-dom';

export default function LoginForm() {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [show, setShow] = useState(false);


    async function handleGoogleSignIn() {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/dashboard`,
            },
        });

        if (error) {
            console.error("Google sign-in error:", error.message);
        }
    }

    return (
        <div className="flex items-center align-top flex-col justify-self-auto pt-20 h-full bg-gray-200">
            <DescriptionOnForm />
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md mt-3">
                <div className="mb-4 p-4">
                    <h1 className="text-2xl font-bold ">Welcome back</h1>
                    <p className="text-gray-600 ">Sign in to your account to continue</p>
                </div>
                <form >
                    <div className="px-4">
                        <Inputs
                            titel="Email address"
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                            onChange={(e) => setPassword(e.target.value)}
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
                    <div className="flex items-center justify-between mt-6 text-sm px-4 pb-4">
                        <label className="flex items-center gap-2">
                            <input type="checkbox"  className="h-4 w-4 rounded border-gray-300 accent-blue-600" />
                            Remember me
                        </label>
                        <a href="#" className="font-semibold text-blue-800">Forgot password?</a>
                    </div>
                    <Buttons type="submit">Sign In →</Buttons>
                </form>
                <div className="flex flex-col items-center justify-center gap-6">
                    <p className="mt-6 text-center text-sm text-gray-600">
                        _____________________________ OR _____________________________
                    </p>
                    <Buttons type="button" 
                    onClick={handleGoogleSignIn}
                    
                    >
                        Sign in with Google →
                    </Buttons>
                </div>
            </div>

            <div>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account? <NavLink to="/register"   className="font-semibold text-blue-800">Create Account</NavLink>
                </p>
            </div>
        </div>

    )
}
