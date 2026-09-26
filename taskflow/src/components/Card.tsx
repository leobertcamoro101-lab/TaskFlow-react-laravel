import { type CSSProperties, type ReactNode } from 'react';

interface CardProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function Card({ className, style, children }: CardProps) {
  return (
    <div
      className={`relative bg-white border border-[#E9E0CF] rounded-2xl p-6 sm:p-8 shadow-sm ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Card;
