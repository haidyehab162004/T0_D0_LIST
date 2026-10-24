import { useRef } from "react";

export default function OutputOtp({ value = "", onChange }) {
    const inputsRefs = useRef([]);

    function handleChange(inputValue, index) {
        const digit = inputValue.replace(/\D/g, "").slice(-1);

        const otpArray = value.split("");
        otpArray[index] = digit;

        const newOtp = otpArray.join("").slice(0, 6);
        onChange?.(newOtp);

        if (digit && index < 5) {
            inputsRefs.current[index + 1]?.focus();
        }
    }

    function handleKeyDown(event, index) {
        if (event.key === "Backspace" && !value[index] && index > 0) {
            inputsRefs.current[index - 1]?.focus();
        }
    }

    function handlePaste(event, index) {
        const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "");
        if (!pastedDigits) return;

        event.preventDefault();
        const digits = pastedDigits.slice(0, 6 - index).split("");
        const otpArray = value.split("");
        digits.forEach((digit, offset) => {
            otpArray[index + offset] = digit;
        });
        onChange?.(otpArray.join("").slice(0, 6));
        inputsRefs.current[Math.min(index + digits.length, 5)]?.focus();
    }

    return (
        <div className="flex justify-center gap-2">
            {Array.from({ length: 6 }, (_, index) => (
                <input
                    key={index}
                    ref={(element) => {
                        inputsRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={value[index] || ""}
                    onChange={(event) => handleChange(event.target.value, index)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    onPaste={(event) => handlePaste(event, index)}
                    className="h-12 w-12 rounded border text-center text-xl"
                />
            ))}
        </div>
    );
}
