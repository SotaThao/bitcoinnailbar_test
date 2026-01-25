import * as React from "react";
import { Link } from "react-router-dom";
import { Button, ButtonProps } from "./button";
import { cn } from "./utils";

interface AnimatedButtonProps extends ButtonProps {
  to?: string;
  onClick?: React.MouseEventHandler;
}

export function AnimatedButton({ 
  className, 
  children, 
  to, 
  onClick, 
  variant = "outline",
  ...props 
}: AnimatedButtonProps) {
  
  // Base classes that define the "orange outline with slide fill" style
  const baseClasses = "relative overflow-hidden group bg-transparent hover:bg-transparent border-[#FF9800] text-[#FF9800] hover:text-white transition-colors duration-300";

  const content = (
    <>
      <span className="absolute inset-0 w-full h-full bg-[#FF9800] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />
      <span className="relative z-10 flex items-center justify-center gap-2 w-full">{children}</span>
    </>
  );

  const mergedClassName = cn(baseClasses, className);

  // Helper to scroll to top if it's a link
  const handleClick = (e: React.MouseEvent<any>) => {
    if (to) window.scrollTo(0, 0);
    if (onClick) onClick(e);
  };

  if (to) {
    return (
      <Button 
        asChild 
        variant={variant} 
        className={mergedClassName} 
        {...props}
      >
        <Link to={to} onClick={handleClick}>
          {content}
        </Link>
      </Button>
    );
  }

  return (
    <Button 
      variant={variant} 
      className={mergedClassName} 
      onClick={handleClick} 
      {...props}
    >
      {content}
    </Button>
  );
}