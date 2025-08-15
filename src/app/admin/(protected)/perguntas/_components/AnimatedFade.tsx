'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedFade({
  depKey,
  children,
}: {
  depKey: string | number;
  children: React.ReactNode;
}) {
  // Força “remount” leve quando o filtro muda, garantindo a animação
  const [key, setKey] = useState(depKey);
  useEffect(() => setKey(depKey), [depKey]);

  return (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
