
import { motion } from 'framer-motion';

const Skeleton = ({ className = '', variant = 'text' }) => {
  const baseClasses = 'bg-gray-200 overflow-hidden relative';
  
  const variants = {
    text: 'h-4 w-full rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      <motion.div
        className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
        animate={{
          translateX: ['-100%', '100%']
        }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          ease: 'easeInOut'
        }}
      />
    </div>
  );
};

export default Skeleton;
