import { apiRequest } from '../../api/apiRequest.js'

export const authApi = {
  register(data) {
    return apiRequest.post('/auth/register', data)
  },

  verifyEmail(data) {
    return apiRequest.post('/auth/verify-email', data)
  },

  resendVerificationOtp(data) {
    return apiRequest.post('/auth/resend-verification-otp', data)
  },

  login(data) {
    return apiRequest.post('/auth/login', data)
  },

  googleLogin(data) {
    return apiRequest.post('/auth/google', data)
  },

  forgotPassword(data) {
    return apiRequest.post('/auth/forgot-password', data)
  },

  verifyResetOtp(data) {
    return apiRequest.post('/auth/verify-reset-otp', data)
  },

  resetPassword(data) {
    return apiRequest.post('/auth/reset-password', data)
  },

  getMe() {
    return apiRequest.get('/auth/me')
  },

  logout() {
    return apiRequest.post('/auth/logout')
  },
}
