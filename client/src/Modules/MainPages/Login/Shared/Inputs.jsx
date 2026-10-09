import React from 'react'

export default function Inputs({
  titel,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
  rightElement,
}) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-bold text-gray-900 mb-2" htmlFor={titel}>
        {titel}
      </label>

      <div className="relative flex items-center">
        {icon && (
          <span className="absolute text-gray-500 pointer-events-none">
            {icon}
          </span>
        )}

        <input
          id={titel}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full rounded-xl border border-gray-300 bg-gray-200 py-3 pl-12 pr-12
                     text-gray-900 placeholder-gray-400 outline-none transition
                     focus:border-violet-500 focus:ring-4 focus:ring-violet-200"
        />

        {rightElement && (
          <span className="absolute right-4 text-gray-500">
            {rightElement}
          </span>
        )}
      </div>
    </div>
  );
}
