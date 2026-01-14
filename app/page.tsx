import Link from "next/link"
import { ArrowRight, Zap, Sparkles, Box, Shield, Globe } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-background overflow-hidden relative font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[160px] orb-animation" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-primary/5 rounded-full blur-[160px] orb-animation" style={{ animationDelay: '-6s' }} />

      {/* Decorative Grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-4xl w-full text-center space-y-12">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border-white/10 text-xs font-bold uppercase tracking-widest text-primary glow-primary animate-bounce-subtle">
          <Sparkles className="w-3.5 h-3.5" />
          The future of engineering growth
        </div>

        <div className="space-y-6">
          <div className="mx-auto w-24 h-24 bg-primary rounded-[2rem] flex items-center justify-center glow-primary mb-10 rotate-3 transition-transform hover:rotate-6 active:scale-95 cursor-pointer">
            <Zap className="text-black w-12 h-12 fill-black" />
          </div>

          <h1 className="text-7xl md:text-8xl font-black tracking-tighter leading-[0.9] text-gradient pb-2">
            CSC<br />PLATFORM
          </h1>

          <p className="text-xl md:text-2xl font-medium text-muted-foreground max-w-xl mx-auto leading-relaxed">
            The next-generation operating system for high-performance engineering teams.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-6">
          <Link href="/login" className="group relative bg-primary text-black px-10 py-5 rounded-2xl font-bold uppercase tracking-wider transition-all hover:scale-[1.05] active:scale-[0.95] glow-primary flex items-center gap-3">
            Initialize System
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <button className="px-10 py-5 rounded-2xl font-bold uppercase tracking-wider text-white glass-panel hover:bg-white/5 transition-all flex items-center gap-2 border-white/5">
            Documentation
          </button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16">
          {[
            { icon: Box, title: "Modular artifacts", desc: "Build & preserve your knowledge blocks" },
            { icon: Shield, title: "Secure by default", desc: "Enterprise-grade auth & data privacy" },
            { icon: Globe, title: "Collaborative", desc: "Designed for high-trust team environments" }
          ].map((feat, i) => (
            <div key={i} className="glass-card p-6 rounded-[2rem] text-left border-white/5 group hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-black transition-all">
                <feat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">{feat.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="absolute bottom-8 left-0 right-0 text-center text-muted-foreground/30 text-[10px] uppercase tracking-[0.2em] font-bold pointer-events-none">
        © 2026 CSC COGNITIVE SYSTEMS CORP // ALL RIGHTS RESERVED
      </footer>
    </main>
  )
}
