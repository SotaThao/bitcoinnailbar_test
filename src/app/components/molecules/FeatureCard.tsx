import { motion } from 'motion/react';
import { Bitcoin } from 'lucide-react';

interface FeatureCardProps {
  text?: string;
  icon?: string;
  title?: string;
  description?: string;
  isFullWidth?: boolean;
}

export function FeatureCard({ 
  text, 
  icon, 
  title, 
  description, 
  isFullWidth = false 
}: FeatureCardProps) {
  return (
    <motion.div
      className={`bg-[#1A1F2E] border border-gray-800 rounded-2xl p-8 hover:border-blue-500/50 transition-all duration-300 ${
        isFullWidth ? 'md:col-span-2' : ''
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      {icon === 'bitcoin' && (
        <div className="mb-4">
          <div className="w-12 h-12 rounded-full bg-[#FF9800]/10 flex items-center justify-center">
            <Bitcoin className="w-6 h-6 text-[#FF9800]" />
          </div>
        </div>
      )}
      
      {title && (
        <h3 className="text-white text-xl font-bold mb-3">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-gray-400 leading-relaxed">
          {description}
        </p>
      )}
      
      {text && !title && !description && (
        <p className="text-gray-300 leading-relaxed text-lg">
          {text}
        </p>
      )}
    </motion.div>
  );
}
