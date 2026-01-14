'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { Zap, Mail, Lock, ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function LoginPage() {
    const router = useRouter()
    const [email, setEmail] = useState('student@csc.com')
    const [password, setPassword] = useState('password123')
    const [isPending, setIsPending] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsPending(true)
        setErrorMessage(null)

        const { data, error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: '/dashboard'
        }, {
            onSuccess: () => {
                router.push('/dashboard')
                router.refresh()
            },
            onError: (ctx) => {
                setErrorMessage(ctx.error.message || 'Invalid credentials.')
            }
        })

        setIsPending(false)
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
                        <h1 className="text-4xl font-extrabold tracking-tighter mb-2 text-gradient">Welcome back</h1>
                        <p className="text-muted-foreground font-medium">Please enter your details to initialize session.</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block font-semibold text-sm text-foreground/80 px-1">Email address</label>
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

                        {/* Demo Credentials Section */}
                        <div className="glass-card rounded-2xl p-4 border border-white/5 space-y-2 text-xs">
                            <p className="font-bold text-primary/80 uppercase tracking-widest text-[10px]">Demo Access Credentials</p>
                            <button
                                type="button"
                                onClick={() => { setEmail('student@csc.com'); setPassword('password123'); }}
                                className="w-full flex justify-between items-center text-muted-foreground hover:text-white transition-colors text-left"
                            >
                                <span>student@csc.com / password123</span>
                                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 scale-90">Student</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => { setEmail('mentor@csc.com'); setPassword('password123'); }}
                                className="w-full flex justify-between items-center text-muted-foreground hover:text-white transition-colors text-left"
                            >
                                <span>mentor@csc.com / password123</span>
                                <span className="px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 scale-90 text-[10px]">Mentor</span>
                            </button>
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
                                    Initialize System
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        {errorMessage && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                {errorMessage}
                            </div>
                        )}
                    </form>
                </div>

                <p className="mt-8 text-center text-muted-foreground text-sm">
                    Don't have an account? <span className="text-primary hover:underline cursor-pointer font-semibold">Request clearance</span>
                </p>
            </div>
        </div>
    )
}
