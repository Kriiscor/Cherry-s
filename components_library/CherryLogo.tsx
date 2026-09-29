import React from "react";

interface CherryLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showText?: boolean;
}

export const CherryLogo: React.FC<CherryLogoProps> = ({
  size = "md",
  className = "",
  showText = true,
}) => {
  const sizeMap = {
    sm: "w-7 h-7 text-sm rounded-xl",
    md: "w-10 h-10 text-xl rounded-2xl",
    lg: "w-14 h-14 text-3xl rounded-3xl",
    xl: "w-20 h-20 text-4xl rounded-[28px]",
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        className={`${sizeMap[size]} bg-gradient-to-br from-[#C9184A] to-[#590D22] text-white flex items-center justify-center font-bold shadow-md shadow-rose-900/20`}
      >
        🍒
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold tracking-tight text-slate-900 text-lg leading-none">
            Cherry's
          </span>
          <span className="text-[10px] text-slate-400 font-semibold tracking-wide">
            Nutrition & Fitness
          </span>
        </div>
      )}
    </div>
  );
};
