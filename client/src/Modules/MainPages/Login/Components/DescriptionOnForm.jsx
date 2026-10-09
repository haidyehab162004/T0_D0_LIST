import React from 'react'
import { Icon } from '@iconify/react';
export default function DescriptionOnForm() {
  return (
    <div>
      <div className="flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 bg-blue-800 rounded-3xl flex items-center justify-center mb-4">
                     <Icon icon="lucide:list-todo" width="36" height="36" className="text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-800">DoList</h1>
                <p className="text-gray-600 ">Your personal task manager
                </p>
            </div>
    </div>
  )
}
