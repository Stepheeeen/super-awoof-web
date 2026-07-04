"use client";
import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "danger";
  disabled?: boolean;
  className?: string;
  isLoading?: boolean;
  style?: React.CSSProperties;
}

export const Button = ({
  text,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  className = "",
  isLoading = false,
  style,
}: ButtonProps) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`btn ${variant === "danger" ? "bg-[#FF4D4D] text-white" : "btn-primary"} ${className}`}
      style={style}
    >
      {isLoading ? (
        <div className="spinner" />
      ) : (
        <span>{text}</span>
      )}
    </button>
  );
};
