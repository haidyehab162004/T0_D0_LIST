import React from 'react'

export default function Buttons({
    children,
    type = "button",
    onClick,
    className = "",
    disabled = false,
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            className={`w-full rounded-xl bg-blue-800 px-4 py-3.5 mt-4 font-bold text-white transition hover:bg-blue-900 ${className}`}
            disabled={disabled}
        >
            {children}
        </button>
    );
}