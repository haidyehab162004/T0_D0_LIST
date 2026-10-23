
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Inputs from '../../Login/Shared/Inputs';
import Buttons from '../../../../Components/Ui/Buttons';
// import { useAuth } from '../../../Auth/useAuth';
import { useNavigate, Navigate } from 'react-router-dom';
import { authApi } from '../../../Auth/authApi.js'
import { useEffect } from 'react';
export default function VerifyEmail() {
    const location = useLocation();
    const email = location.state?.email;
    const [otp, setOtp] = useState('');
    // const { verifyEmail } = useAuth()
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [countdown, setCountdown] = useState(60); // Countdown timer in seconds

    const navigate = useNavigate();
    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    async function handleSubmit(event) {
        event.preventDefault();
        setFormError('');
        setSuccessMessage('');
        setLoading(true);

        try {
            await authApi.verifyEmail({ email, otp });
            setSuccessMessage('تم تأكيد الإيميل. تقدري تسجلي الدخول الآن.');
            navigate('/login');
        } catch (error) {
            setFormError(
                error.response?.data?.message || 'حصل خطأ أثناء تأكيد الإيميل.'
                // console.error('Error during email verification:',error);
            );
            console.error('Error during email verification:', error);
        } finally {
            setLoading(false);
        }

    }
    async function handleResend() {
        setFormError('');
        setSuccessMessage('');
        setLoading(true);
        try {
            await authApi.resendVerificationOtp({ email });
            setSuccessMessage('تم إرسال رمز التحقق مرة أخرى.');
        }
        catch (error) {
            setFormError(
                error.response?.data?.message || 'حصل خطأ أثناء إرسال رمز التحقق.'
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center align-center flex-col justify-items-center pt-20 h-full px-4">
            <h1 className="text-2xl font-bold mb-4">Verify your email</h1>
            <p className="text-sm text-gray-600">We sent a verification code to {email}</p>

            <form onSubmit={handleSubmit}>
                <Inputs
                    title="Verification code"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                />

                {formError && (
                    <p className="text-sm text-red-600">{formError}</p>
                )}

                {successMessage && (
                    <p className="text-sm text-green-700">{successMessage}</p>
                )}

                <Buttons type="submit" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify email'}
                </Buttons>
                <Buttons type="button"
                disabled={loading || countdown > 0}
                    onClick={handleResend}>
                    {countdown > 0
                        ? `إعادة الإرسال بعد ${countdown} ثانية`
                        : 'إعادة إرسال الكود'}
                </Buttons>
            </form>
        </div>
    )
}