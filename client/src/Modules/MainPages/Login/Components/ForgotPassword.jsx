import React from 'react'
import Inputs from '../Shared/Inputs'
import Buttons from '../../../../Components/Ui/Buttons'
import { authApi } from '../../../Auth/authApi'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'


export default function ForgotPassword() {

    const [email, setEmail] = useState('');
    const [loding, setLoding] = useState(false)
    const [formError, setFormError] = useState('')
    const navigate = useNavigate();
    // const location = useLocation();
    // const { receivedemail } = location.state?.email ;
    



    async function handleSubmit(event) {
        event.preventDefault();
        setLoding(true);
        setFormError('');

        try {
            await authApi.forgotPassword({ email })
            navigate('/check-email', { state: { email } });
        }
        catch (error) {
            setFormError(
                error.response?.data?.error || "حصل خطأ"
            )
        }
        finally {
            setLoding(false)
        }
    }

    return (
        <div className='flex items-center align-center flex-col justify-items-center pt-20 h-full  px-4'>
            <h1 className='text-2xl font-bold mb-4'>Forgot Password</h1>
            <p className='text-gray-600 mb-6'>Enter your email address and we'll send you a link to reset your password.</p>
            <form onSubmit={handleSubmit} >
                <Inputs
                    title="Email Address"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                />


                {formError && (
                    <p className="text-sm text-red-600">{formError}</p>
                )}
                <Buttons
                    disabled={loding}
                    type="submit"
                    title="Send Reset Link"
                >
                    {loding ? 'Resseting Password ......' : ' Resset Password'}
                </Buttons>




            </form>
            <div className=' p-12 font-semibold '>
                <NavLink to={"/login"}>
                    <p>Back to Login  </p>
                </NavLink>
            </div>


        </div>
    )
}
