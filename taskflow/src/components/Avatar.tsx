import { type CSSProperties } from 'react';

interface AvatarProps {
  className?: string;
  style?: CSSProperties;
  image?: string | null;
  name?: string | null;
  alt?: string;
  width?: string;
}

const getInitials = (name?: string | null): string => {
  if (!name) return '?';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

function Avatar({ className, style, image, name, alt, width }: AvatarProps) {
  const sizeClasses = 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24';
  const sizeStyle = width ? { width, height: width } : undefined;

  if (!image) {
    // Smaller circles (e.g. width="32px" in a navbar) get compact text;
    // the default larger sizes (e.g. ProfilePage) get bigger text.
    const textClass = width ? 'text-xs' : 'text-2xl';

    return (
      <div
        className={`flex justify-center items-center w-full h-full ${className ?? ''}`}
        style={style}
      >
        <div
          className={`rounded-full bg-[#B8862E]/10 border border-[#B8862E]/30 flex items-center justify-center ${sizeClasses}`}
          style={sizeStyle}
        >
          <span className={`font-bold text-[#9C7226] ${textClass}`}>{getInitials(name)}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex justify-center items-center w-full h-full ${className ?? ''}`}
      style={style}
    >
      <img
        src={image}
        alt={alt}
        className={`block rounded-full object-cover ${sizeClasses}`}
        style={sizeStyle}
      />
    </div>
  );
}

export default Avatar;
