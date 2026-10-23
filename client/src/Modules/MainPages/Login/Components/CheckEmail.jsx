import React from 'react'
import OutputOtp from './OutputOtp'
import { useLocation } from 'react-router-dom'
import { authApi } from "../../../Auth/authApi";
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Buttons from '../../../../Components/Ui/Buttons'
export default function CheckEmail() {


    const { state } = useLocation();
    const email = state?.email;
    const [otp, setOtp] = useState('');
    const [formError, setFormError] = useState('');
    // const response = await authApi.forgotPassword({ email });
    const navigate = useNavigate();
    // navigate('/check-email', {email: response.data.email} );

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError('');
        try {
            const response = await authApi.verifyResetOtp({ email, otp });
 console.log("OTP response:", response.data);

            navigate("/reset-password", {
                state: {
                 
                    resetToken: response.data.resetToken,
                },
            });
        }
        catch (error) {
            setFormError(error.response?.data?.message || "الكود غير صحيح أو انتهت صلاحيته");
              console.error("OTP verification failed:", error.response?.data || error);
        }
    }
    // async function handleResend() {
    //     try {
    //         await authApi.resetPassword({ email });
    // }
    //     catch (error) {
    //         error.response?.data?.message 
    //     }
    // }
    function maskEmail(email) {
        const [name, domain] = email.split("@");

        if (!domain) return email;

        const visiblePart = name.slice(0, 2);
        return `${visiblePart}${"*".repeat(Math.max(name.length - 2, 3))}@${domain}`;
    }
    return (
        <div className='flex items-center align-center flex-col justify-items-center pt-20 h-full  px-4'>
            {/* <button onClick={handleResend} className='text-blue-500 hover:text-blue-700'>
                Resend Code
            </button> */}
            <h1 className='text-2xl font-bold mb-4'>Chek Your Email</h1>
            <p className='text-gray-600 mb-6'>input the code that was sent to {email ? maskEmail(email) : ''} </p>
            {formError && (
                <p className="text-sm text-red-600">{formError}</p>)}

            <form onSubmit={handleSubmit}>
                <OutputOtp value={otp} onChange={setOtp} />

                <Buttons type="submit" disabled={otp.length !== 6}>
                    Next
                </Buttons>
            </form>
        </div>
    )
}
