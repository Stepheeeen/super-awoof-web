"use client";
import React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmVariant?: "primary" | "danger";
  children?: React.ReactNode;
}

export const Modal = ({
  visible,
  onClose,
  title,
  subtitle,
  confirmText,
  cancelText = "No, Cancel",
  onConfirm,
  onCancel,
  confirmVariant = "primary",
  children,
}: ModalProps) => {
  if (!visible) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-card animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A8A8A8] hover:text-white transition-colors"
        >
          <X size={22} />
        </button>
        <h2 className="text-white text-xl font-semibold mb-3 pr-8">{title}</h2>
        {subtitle && (
          <p className="text-[#A8A8A8] text-[15px] mb-4 leading-relaxed">{subtitle}</p>
        )}
        {children}
        <div className="flex flex-col gap-4 mt-8">
          <Button 
            text={confirmText} 
            onClick={onConfirm} 
            variant={confirmVariant} 
            style={{ height: 56, borderRadius: 16, fontSize: 16, fontWeight: 800 }}
          />
          {cancelText && (
            <button
              onClick={onCancel || onClose}
              className="w-full text-center bg-[#151922] hover:bg-[#1C212E] text-white border border-white/10 transition-all font-bold tracking-wide"
              style={{ height: 56, borderRadius: 16, fontSize: 16 }}
            >
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
