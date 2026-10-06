import { type CSSProperties, type ReactNode } from 'react';

interface CardProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
  /** 'sm' for compact list items (e.g. TaskCard), 'lg' for panels (default). */
  padding?: 'sm' | 'lg';
}

function Card({ className, style, children, padding = 'lg' }: CardProps) {
  const paddingClass = padding === 'sm' ? 'p-4 sm:p-5' : 'p-6 sm:p-8';

  return (
    <div
      className={`relative bg-white border border-[#E9E0CF] rounded-2xl ${paddingClass} shadow-sm ${className ?? ''}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Card;
