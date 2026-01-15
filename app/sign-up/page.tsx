'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Zap, Mail, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff, Loader2, KeyRound, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function SignUpPage() {
    const router = useRouter()
    const [step, setStep] = useState<'REGISTER' | 'VERIFY'>('REGISTER')
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [otp, setOtp] = useState('')

    const [isPending, setIsPending] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setErrorMessage(null)

        try {
            const { data, error } = await authClient.signUp.email({
                email,
                password,
                name,
                callbackURL: '/dashboard' // Optional, but good practice
            }, {
                onSuccess: async () => {
                    // User created. Now send OTP.
                    // Note: better-auth might send it automatically if configured, 
                    // but explicit sending ensures we trigger the flow we want.
                    try {
                        await authClient.emailOtp.sendVerificationOtp({
                            email,
                            type: "email-verification"
                        })
                        setStep('VERIFY')
                        setIsPending(false)
                    } catch (otpError) {
                        setErrorMessage("Account created but failed to send OTP. Please try logging in.")
                        setIsPending(false)
                    }
                },
                onError: async (ctx: any) => {
                    // Check if error is due to existing email
                    if (ctx.error.status === 422 || ctx.error.message?.toLowerCase().includes("already in use") || ctx.error.message?.toLowerCase().includes("exists")) {
                        try {
                            // Try to resend verification OTP in case the user exists but isn't verified
                            await authClient.emailOtp.sendVerificationOtp({
                                email,
                                type: "email-verification"
                            })
                            // If successful, move to verify step just like a new user
                            setErrorMessage("Account already exists. Verification code sent.")
                            setStep('VERIFY')
                            setIsPending(false)
                            return
                        } catch (resendError) {
                            // If resend fails (e.g. user is already verified), fall back to original error
                            // User likely needs to just login
                        }
                    }

                    setErrorMessage(ctx.error.message || 'Registration failed.')
                    setIsPending(false)
                }
            })
        } catch (err) {
            setErrorMessage('An unexpected error occurred.')
            setIsPending(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setErrorMessage(null)

        try {
            const { data, error } = await authClient.emailOtp.verifyEmail({
                email,
                otp
            }, {
                onSuccess: () => {
                    router.push('/dashboard')
                    router.refresh()
                },
                onError: (ctx: any) => {
                    setErrorMessage(ctx.error.message || 'Invalid code. Please try again.')
                    setIsPending(false)
                }
            })
        } catch (err) {
            setErrorMessage('Verification failed.')
            setIsPending(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative font-sans">
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] orb-animation" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] orb-animation" style={{ animationDelay: '-4s' }} />

            <div className="w-full max-w-md relative z-10 px-4">
                <div className="glass-panel rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                    {/* Top Accent Decoration */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

                    <div className="mb-10 text-center">
                        <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center glow-primary mb-6 rotate-3">
                            <Zap className="text-black w-8 h-8 fill-black" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tighter mb-2 text-gradient">
                            {step === 'REGISTER' ? 'Create Account' : 'Verify Identity'}
                        </h1>
                        <p className="text-muted-foreground font-medium">
                            {step === 'REGISTER'
                                ? 'Join the platform to verify your skills.'
                                : 'Enter the 5-digit code sent to your email.'}
                        </p>
                    </div>

                    {step === 'REGISTER' ? (
                        <form onSubmit={handleRegister} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block font-semibold text-sm text-foreground/80 px-1 text-white">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-white placeholder:text-muted-foreground/50"
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block font-semibold text-sm text-foreground/80 px-1 text-white">Email address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-white placeholder:text-muted-foreground/50"
                                        placeholder="name@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block font-semibold text-sm text-foreground/80 px-1 text-white">Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-12 pr-12 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-white"
                                        placeholder="••••••••"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-primary text-black py-4 rounded-2xl font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] glow-primary flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Initiate Registration
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <label className="block font-semibold text-sm text-foreground/80 px-1 text-white">Verification Code</label>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                    <input
                                        name="otp"
                                        type="text"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.slice(0, 5))}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30 transition-all text-white placeholder:text-muted-foreground/50 text-center tracking-[1em] text-lg font-mono uppercase"
                                        placeholder="•••••"
                                        required
                                        maxLength={5}
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground text-center mt-2">
                                    Check your email ({email}) for the code.
                                    <br />
                                    <span className="text-primary/70 italic">(Check console logs in dev mode)</span>
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-primary text-black py-4 rounded-2xl font-bold uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98] glow-primary flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale"
                            >
                                {isPending ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Verify & Complete
                                        <CheckCircle2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </>
                                )}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('REGISTER')}
                                className="w-full text-muted-foreground text-sm hover:text-white transition-colors"
                            >
                                Incorrect email? Go back
                            </button>
                        </form>
                    )}

                    {errorMessage && (
                        <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            {errorMessage}
                        </div>
                    )}
                </div>

                <p className="mt-8 text-center text-muted-foreground text-sm">
                    Already have an account? <Link href="/login" className="text-primary hover:underline cursor-pointer font-semibold">Login securely</Link>
                </p>
            </div>
        </div>
    )
}
