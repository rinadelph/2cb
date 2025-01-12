'use client'

import { LoginForm } from '@/components/Authentication/LoginForm'
import { motion } from 'framer-motion'

export default function Login() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[400px]"
      >
        <LoginForm />
      </motion.div>
    </div>
  )
}