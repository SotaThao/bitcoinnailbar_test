import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface IconFeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  accentColor?: string;
}

export function IconFeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  accentColor = '#f7931a'
}: IconFeatureCardProps) {
  return (
    <motion.div
      className="relative group"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {/* Card Container */}
      <div 
        className="relative h-full p-6 md:p-8 rounded-2xl backdrop-blur-md border border-white/10 transition-all duration-300 hover:border-white/20"
        style={{
          background: 'rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Gradient Glow on Hover */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10"
          style={{
            background: `radial-gradient(circle at center, ${accentColor}15 0%, transparent 70%)`
          }}
        />

        {/* Icon Container */}
        <motion.div
          className="mb-5 inline-flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-xl backdrop-blur-sm border-2 transition-all duration-300 group-hover:scale-110"
          style={{
            background: 'rgba(0, 0, 0, 0.6)',
            borderColor: `${accentColor}40`,
            boxShadow: `0 0 20px ${accentColor}20`
          }}
          whileHover={{ rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
        >
          <Icon 
            className="w-7 h-7 md:w-8 md:h-8" 
            style={{ color: accentColor }}
          />
        </motion.div>

        {/* Title */}
        <h3 
          className="text-xl md:text-2xl font-bold mb-3 transition-colors duration-300 group-hover:text-white"
          style={{ color: '#ffffff' }}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm md:text-base text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
          {description}
        </p>
      </div>
    </motion.div>
  );
}
