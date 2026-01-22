import { Link } from 'react-router-dom';
import bitcoinLogo from 'figma:asset/2e1db8bc09ca3990d8353e1709360b43f3caa800.png';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  linkTo?: string;
  showText?: boolean;
}

export function BrandLogo({ 
  className = '', 
  size = 'md',
  linkTo = '/',
  showText = true 
}: BrandLogoProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const textSizeClasses = {
    sm: 'text-lg md:text-xl',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl'
  };

  const logoContent = (
    <>
      <div className="flex items-center justify-center rounded-full transition-transform group-hover:scale-110 shadow-[0_0_15px_rgba(255,152,0,0.5)]">
        <img 
          src={bitcoinLogo} 
          alt="Bitcoin Nail Bar Logo" 
          className={`${sizeClasses[size]} object-contain flex-shrink-0`}
          style={{ maxWidth: '100%', height: 'auto' }}
        />
      </div>
      {showText && (
        <div className="flex items-baseline gap-1.5 text-[14px]">
          <span className={`font-serif font-bold ${textSizeClasses[size]} text-white tracking-widest group-hover:text-[#FF9800] transition-colors whitespace-nowrap`}>
            BITCOIN
          </span>
          <span className={`font-serif font-bold ${textSizeClasses[size]} text-[#FF9800] tracking-widest group-hover:text-white transition-colors whitespace-nowrap`}>
            NAIL BAR
          </span>
        </div>
      )}
    </>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className={`flex items-center gap-3 group ${className}`}>
        {logoContent}
      </Link>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoContent}
    </div>
  );
}