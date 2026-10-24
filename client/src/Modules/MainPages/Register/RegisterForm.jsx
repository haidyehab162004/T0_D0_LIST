import React from 'react'
import DescriptionOnForm from '../Login/Components/DescriptionOnForm'
import { Icon } from '@iconify/react';
import Inputs from '../Login/Shared/Inputs';
import { useState } from 'react';
import ConditionOfApproval from './components/ConditionOfApproval';
import { NavLink ,useNavigate} from 'react-router-dom';
import Buttons from '../../../Components/Ui/Buttons';
import PasswordStrength from './components/PasswordStrength';
import { authApi } from '../../Auth/authApi.js'
export default function RegisterForm() {
    const [show, setShow] = useState(false);
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');

    const [confirmPassword, setConfirmPassword] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const [loading, setLoading] = useState(false);
    // const [awaitingVerification, setAwaitingVerification] = useState(false);
    
    const navigate = useNavigate();
    
    const [formError, setFormError] = useState("");

    async function handleSubmit(event) {
        event.preventDefault();

        if (password !== confirmPassword) {
            setFormError("كلمتا المرور غير متطابقتين");
            return;
        }

        setFormError("");
        setLoading(true);

        try {
            await authApi.register({ name, email, password });
          navigate('/verify-email', { state: { email } });
        } catch (error) {
            setFormError(
                error.response?.data?.message || "حصل خطأ أثناء إنشاء الحساب."
            );
        } finally {
            setLoading(false);
        }
    }



    return (
        <div className="flex items-center align-top flex-col justify-self-auto pt-20 h-full bg-gray-200">
            <DescriptionOnForm />
            <div className="flex flex-col gap-6 justify-center items-center ">
                <div className="flex gap-10">
                    <p className="flex items-center gap-2 text-gray-600"> <Icon icon="lucide:circle-chevron-down" width="10" height="10" className="text-green-500" />Organize tasks by category</p>
                    <p className="flex items-center gap-2 text-gray-600"> <Icon icon="lucide:circle-chevron-down" width="10" height="10" className="text-green-500" />Star important items</p>
                </div>
                <div>
                    <p className="flex items-center gap-2 text-gray-600"> <Icon icon="lucide:circle-chevron-down" width="10" height="10" className="text-green-500" />Track your progress</p>
                </div>
            </div>
            <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md mt-3">
                <div className="mb-4 p-4">
                    <h1 className="text-2xl font-bold ">Create your account</h1>
                    <p className="text-gray-600 ">A calmer, clearer day starts with one task.</p>
                </div>
                <form onSubmit={handleSubmit}  >
                    <div className="px-4">
                        <Inputs
                            titel="Full Name"
                            type="Text"
                            required
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            icon={
                                <Icon
                                    icon="mdi:user-outline"
                                    width="20"
                                    height="20"
                                    className="absolute -right-8 top-1/2 -translate-y-1/2 text-gray-500"
                                />
                            }
                        />

                        <Inputs
                            titel="Email address"
                            required
                            type="email"
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
                           placeholder="Min. 8 characters"
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

                        <PasswordStrength password={password} />
                        <Inputs
                            required
                            titel="Confirm password"
                            type={showConfirm ? "text" : "password"}
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
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
                                    onClick={() => setShowConfirm(!showConfirm)}
                                />
                            }
                        />
                        <div>
                            <ConditionOfApproval />
                            {formError && <p className="mt-3 text-sm text-red-600">{formError}</p>}

                            <Buttons type="submit" disabled={loading}>
                                {loading ? "Creating account..." : "Create Account →"}
                            </Buttons>
                        </div>

                    </div>
                </form>
            </div>
            <p className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <NavLink to="/login" className="font-semibold text-blue-800">
                    Sign in
                </NavLink>
            </p>

        </div>
    )
}
