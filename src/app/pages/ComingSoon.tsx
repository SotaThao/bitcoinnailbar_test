import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { PrimaryButton } from '../components/PrimaryButton';
import { useLanguage } from '../context/LanguageContext';

export default function ComingSoon() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#1A1F2E] to-[#0B0F19] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl"
      >
        {/* Animated Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF9800] to-[#F7931A] blur-2xl opacity-30"
            />
            <div className="relative bg-[#1A1F2E] rounded-full p-8 border border-[#FF9800]/20">
              <Sparkles className="h-16 w-16 text-[#FF9800]" />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl md:text-7xl font-serif font-bold mb-6"
        >
          <span className="text-white">Coming</span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF9800] to-[#F7931A]">
            Soon
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-xl text-gray-300 mb-8 leading-relaxed"
        >
          We're working hard to bring you something amazing. 
          <br className="hidden md:block" />
          This page will be available soon!
        </motion.p>

        {/* Decorative Elements */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="flex items-center justify-center gap-2 mb-12"
        >
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
              className="w-2 h-2 rounded-full bg-[#FF9800]"
            />
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <Link to="/">
            <PrimaryButton
              size="lg"
              startIcon={<ArrowLeft className="h-5 w-5" />}
              className="shadow-[0_0_30px_rgba(255,152,0,0.3)] hover:shadow-[0_0_50px_rgba(255,152,0,0.5)]"
            >
              Back to Home
            </PrimaryButton>
          </Link>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-16 text-sm text-gray-500"
        >
          <p>Stay tuned for updates • Follow us on social media</p>
        </motion.div>
      </motion.div>

      {/* Background Animation */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 20 + 10,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="absolute w-1 h-1 rounded-full bg-[#FF9800]/20"
          />
        ))}
      </div>
    </div>
  );
}
