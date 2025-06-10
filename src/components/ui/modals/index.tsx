"use client";
import React, { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  title,
  showCloseButton = true,
  isFullscreen = false,
  size = "md",
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-7xl",
    full: "w-full h-full",
  }[size];

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : `relative w-full ${sizeClass} max-h-[90vh] mx-auto rounded-3xl bg-white dark:bg-gray-900 shadow-lg overflow-y-auto overflow-x-hidden`


  return (
<div className="fixed inset-0 z-[99999] flex items-center justify-center bg-gray-400/50 backdrop-blur-[32px] px-4 overflow-x-hidden">
      <div
        ref={modalRef}
        className={`${contentClasses} ${className}`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className="sticky top-3 right-3 z-50 ml-auto mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04 16.54c-.39.39-.39 1.03 0 1.42.39.39 1.03.39 1.42 0L12 13.41l4.54 4.55c.39.39 1.03.39 1.42 0 .39-.39.39-1.03 0-1.42L13.41 12l4.55-4.54c.39-.39.39-1.03 0-1.42-.39-.39-1.03-.39-1.42 0L12 10.59 7.46 6.04c-.39-.39-1.03-.39-1.42 0-.39.39-.39 1.03 0 1.42L10.59 12 6.04 16.54z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}

        {/* Title */}
        {title && (
          <div className="px-6 pt-6 text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </div>
        )}

        {/* Content */}
        <div className="p-6 break-words whitespace-normal">{children}</div>
      </div>
    </div>
  );
};
