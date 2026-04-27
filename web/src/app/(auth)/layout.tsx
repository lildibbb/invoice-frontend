import { type ReactNode } from 'react';
import Link from 'next/link';
import { FileText, CheckCircle2, Shield, Zap, Star } from 'lucide-react';

const features = [
  { icon: CheckCircle2, text: 'LHDN e-Invoice Compliant' },
  { icon: Shield, text: 'Bank-level data security' },
  { icon: Zap, text: 'Smart invoice automation' },
  { icon: FileText, text: 'Professional PDF generation' },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -20px) scale(1.05); }
          66% { transform: translate(-20px, 15px) scale(0.95); }
        }
        @keyframes float-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-25px, 20px) scale(0.97); }
          66% { transform: translate(15px, -25px) scale(1.03); }
        }
        @keyframes shimmer {
          0%, 100% { opacity: 0.04; }
          50% { opacity: 0.08; }
        }
      `}</style>
      <div className="min-h-screen lg:grid lg:grid-cols-2">
        {/* Left brand panel - desktop only */}
        <div className="relative hidden lg:flex flex-col bg-[#0F172A] p-12 text-white overflow-hidden">
          {/* Floating accent orbs */}
          <div
            className="absolute w-[500px] h-[500px] rounded-full opacity-[0.08] blur-[100px] bg-[#3B82F6]"
            style={{
              top: '-10%',
              right: '-10%',
              animation: 'float 20s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.06] blur-[90px] bg-[#3B82F6]"
            style={{
              bottom: '5%',
              left: '-5%',
              animation: 'float-reverse 25s ease-in-out infinite',
            }}
          />

          {/* Logo */}
          <Link href="/" className="relative flex items-center gap-3 mb-auto">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center shadow-lg shadow-black/10">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight">InvoiZ</span>
          </Link>

          {/* Hero content */}
          <div className="relative space-y-6 my-12">
            <h1 className="text-4xl font-bold leading-tight text-white">
              Professional invoicing<br />
              <span className="text-blue-400">made simple.</span>
            </h1>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              The complete invoice management platform for Malaysian businesses. Create, send, and track invoices with full LHDN e-Invoice compliance.
            </p>
          </div>

          {/* Feature bullets */}
          <div className="relative space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-slate-300">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="h-4 w-4 text-blue-400" />
                </div>
                <span className="text-sm font-medium">{text}</span>
              </div>
            ))}
          </div>

          {/* Trust section */}
          <div className="relative mt-10 rounded-xl bg-white/[0.04] p-5">
            <div className="flex gap-0.5 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed italic">
              &ldquo;InvoiZ streamlined our entire invoicing workflow. LHDN compliance is now effortless.&rdquo;
            </p>
            <p className="mt-3 text-xs text-slate-500 font-medium">
              Ahmad R. — CFO, TechServe Solutions
            </p>
          </div>

          {/* Bottom attribution */}
          <p className="relative mt-8 text-xs text-slate-600">
            © 2025 InvoiZ · Trusted by 500+ Malaysian businesses
          </p>
        </div>

        {/* Right form panel */}
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12 lg:px-12 animate-fade-in overflow-hidden">
          {/* Subtle floating accent */}
          <div
            className="absolute w-[600px] h-[600px] rounded-full opacity-[0.03] blur-[120px] pointer-events-none bg-[#3B82F6]"
            style={{
              top: '-20%',
              right: '-20%',
              animation: 'float 22s ease-in-out infinite',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full opacity-[0.02] blur-[100px] pointer-events-none bg-[#3B82F6]"
            style={{
              bottom: '-10%',
              left: '-10%',
              animation: 'float-reverse 28s ease-in-out infinite',
            }}
          />

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-10">
            <div className="w-8 h-8 rounded-lg bg-[#3B82F6] flex items-center justify-center shadow-md shadow-black/10">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold text-[#0F172A]">InvoiZ</span>
          </div>

          <div className="relative w-full max-w-[420px] rounded-2xl shadow-xl shadow-black/[0.06] border-0 p-8 bg-white/80 backdrop-blur-sm animate-scale-in">
            {children}
          </div>
        </div>
      </div>
    </>
  );
}
