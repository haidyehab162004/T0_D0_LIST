import React from 'react'
import { Icon } from "@iconify/react";
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';
import { authApi } from '../../Auth/authApi.js';
import { useAuth } from '../../Auth/useAuth.js';
import AppearanceSettings from '../../../Components/Ui/AppearanceSettings';
export default function Settings() {
  const { user } = useAuth();
  const [linkMessage, setLinkMessage] = useState('');
  const [linkError, setLinkError] = useState('');

  async function handleGoogleLink(response) {
    setLinkMessage('');
    setLinkError('');

    if (!response.credential) {
      setLinkError('لم نستطع استلام بيانات Google. حاولي مرة أخرى.');
      return;
    }

    try {
      const result = await authApi.linkGoogleAccount({ credential: response.credential });
      setLinkMessage(result.data.message || 'تم ربط حساب Google بنجاح.');
    } catch (error) {
      setLinkError(error.response?.data?.message || 'تعذر ربط حساب Google.');
    }
  }

  return (
    <div >
       <main className="mx-auto max-w-5xl p-6">
      <header className="app-border mb-7 flex items-center gap-3 border-b pb-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-blue-600">
          <Icon icon="lucide:settings" width="28" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="app-muted mt-1">Customize your experience</p>
        </div>
      </header>
      <AppearanceSettings/>

      <section className="app-card app-border mt-6 rounded-2xl border p-6">
        <h2 className="text-lg font-semibold">Account sign-in</h2>
        <p className="app-muted mt-1 text-sm">
          Link Google to this account so you can use either sign-in method.
        </p>

        {!user ? (
          <p className="mt-4 text-sm text-amber-700">
            سجّلي الدخول بالطريقة الحالية أولًا لربط Google بحسابك.
          </p>
        ) : import.meta.env.VITE_GOOGLE_CLIENT_ID ? (
          <div className="mt-4">
            <GoogleLogin
              onSuccess={handleGoogleLink}
              onError={() => setLinkError('لم يكتمل تسجيل الدخول عبر Google.')}
              text="continue_with"
              shape="rectangular"
            />
          </div>
        ) : (
          <p className="mt-4 text-sm text-amber-700">
            Google sign-in is not configured for this client.
          </p>
        )}

        {linkMessage && <p role="status" className="mt-3 text-sm text-green-700">{linkMessage}</p>}
        {linkError && <p role="alert" className="mt-3 text-sm text-red-600">{linkError}</p>}
      </section>
      </main>
    </div>
  )
}
