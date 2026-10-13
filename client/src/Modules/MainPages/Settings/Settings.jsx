import React from 'react'
import { Icon } from "@iconify/react";
import AppearanceSettings from '../../../Components/Ui/AppearanceSettings';
export default function Settings() {
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
      </main>
    </div>
  )
}
