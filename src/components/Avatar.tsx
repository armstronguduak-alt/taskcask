import React, { useState } from 'react';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = 'User',
  size = 'md',
  className = ''
}) => {
  const [hasError, setHasError] = useState(false);

  // Compute initials (e.g. "John Doe" => "JD", "John" => "J", null => "U")
  // const _initials = (name || 'User')
  //   .replace(/^@/, '')
  //   .trim()
  //   .split(' ')
  //   .filter(Boolean)
  //   .slice(0, 2)
  //   .map(part => part[0]?.toUpperCase() || '')
  //   .join('') || 'U';

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs font-bold',
    md: 'w-10 h-10 text-sm font-bold',
    lg: 'w-12 h-12 text-base font-extrabold',
    xl: 'w-16 h-16 text-xl font-black'
  };

  const gradients = [
    'from-blue-500 to-teal-600',
    'from-primary to-blue-600',
    'from-amber-500 to-orange-600',
    'from-purple-500 to-indigo-600'
  ];

  // Pick deterministic gradient index based on name
  const gradientIndex = Math.abs(
    (name || 'U').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  ) % gradients.length;

  if (src && !hasError) {
    return (
      <div className={`relative flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-800 ${sizeClasses[size]} ${className}`}>
        <img 
          src={src} 
          alt={name || 'Avatar'} 
          className="w-full h-full object-cover"
          onError={() => setHasError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`relative flex-shrink-0 rounded-2xl bg-gradient-to-br ${gradients[gradientIndex]} text-white flex items-center justify-center shadow-sm ${sizeClasses[size]} ${className}`}>
      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: size === 'sm' ? '18px' : size === 'md' ? '24px' : '32px' }}>person</span>
    </div>
  );
};
