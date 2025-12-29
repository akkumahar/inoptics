import { motion } from 'framer-motion';

const pageVariants = {
  initial: {
    opacity: 0,
    y: 50, // subtle slide
  },
  in: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
  out: {
    opacity: 0,
    y: -50, // subtle slide out
    transition: { duration: 0.6, ease: 'easeInOut' },
  },
};

const PageWrapper = ({ children }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      minHeight: '100vh',
    }}
  >
    {children}
  </motion.div>
);

export default PageWrapper;
