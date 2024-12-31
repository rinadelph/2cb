import { Layout } from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/router'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  const router = useRouter()

  return (
    <Layout>
      <div className="container flex flex-col items-center justify-center min-h-[80vh] gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 text-center"
        >
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
            404 - Page Not Found
          </h1>
          <p className="text-muted-foreground max-w-[600px] text-lg">
            Oops! The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have permission to view it.
            Please sign in or return to the homepage.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mt-8"
        >
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Button
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Return Home
          </Button>
        </motion.div>
      </div>
    </Layout>
  )
}
