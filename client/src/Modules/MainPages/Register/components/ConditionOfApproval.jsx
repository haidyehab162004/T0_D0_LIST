import React from 'react'

export default function ConditionOfApproval() {
    return (
        <div>
            <label className="flex items-start gap-2 text-sm text-gray-700">
                <input
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 accent-blue-600"
                />

                <span>
                    I agree to the{" "}
                    <a href="/terms" className="font-semibold text-blue-800 underline">
                        Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="font-semibold text-blue-800 underline">
                        Privacy Policy
                    </a>
                </span>
            </label>
        </div>
    )
}
