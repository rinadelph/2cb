import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { isEmailVerified } from '../../lib/auth'

export default function VerifyEmail() {
  const [isVerified, setIsVerified] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function checkVerification() {
      try {
        const verified = await isEmailVerified()
        setIsVerified(verified)
        if (verified) {
          setTimeout(() => {
            router.push('/dashboard')
          }, 3000)
        }
      } catch (error) {
        console.error('Verification check failed', error)
      } finally {
        setIsChecking(false)
      }
    }

    checkVerification()
  }, [router])

  if (isChecking) {
    return <div>Checking verification status...</div>
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">Email Verification</h1>
      {isVerified ? (
        <p>Your email has been verified. Redirecting to dashboard...</p>
      ) : (
        <>
          <p>Please check your email and click the verification link.</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            I've verified my email
          </button>
        </>
      )}
    </div>
  )
}