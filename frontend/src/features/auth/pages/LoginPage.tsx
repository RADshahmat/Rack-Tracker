import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Server, User, Lock, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password');
      return;
    }

    setIsLoading(true);
    try {
      await login(username, password);
      toast.success('Authentication successful');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-tr from-slate-50 via-slate-100 to-amber-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Soft Multi-Layered Glow Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-amber-500/[0.03] dark:bg-amber-500/[0.02] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-sky-500/[0.02] dark:bg-sky-500/[0.01] blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Console Emblem */}
        <div className="text-center mb-8 space-y-2">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/10 mx-auto mb-3 border border-amber-400/20">
            <Server size={24} className="animate-pulse" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
            Rack <span className="text-amber-500">Tracker</span>
          </h1>
          <p className="text-xs font-mono tracking-wider text-slate-400 dark:text-slate-500 uppercase font-semibold">
            Enterprise Infrastructure Console
          </p>
        </div>

        {/* Premium Dashboard Style Credentials Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-amber-500/20 dark:border-amber-500/10 rounded-2xl p-6 md:p-8 space-y-5 shadow-xl shadow-amber-500/[0.02]"
        >
          {/* Username Input Field */}
          <div className="space-y-1.5">
            <Label
              htmlFor="username"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              Username
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-600">
                <User size={16} />
              </span>
              <Input
                id="username"
                type="text"
                placeholder="Enter core system username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                className="pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-xs font-medium focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all placeholder:text-slate-400/70"
              />
            </div>
          </div>

          {/* Password Input Field with Interactive Eye Toggle */}
          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500"
            >
              Password
            </Label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-600">
                <Lock size={16} />
              </span>
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter terminal authorization key"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                className="pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/40 text-xs font-medium focus-visible:ring-amber-500/30 focus-visible:border-amber-500 transition-all placeholder:text-slate-400/70"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:text-slate-600 dark:hover:text-slate-400 focus:outline-none transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Premium Core Action Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-amber-500/10 active:scale-[0.99] disabled:opacity-50 mt-2"
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Logging in...</span>
              </div>
            ) : (
              'Initialize Session'
            )}
          </Button>
        </form>

        {/* Demo Credentials Context Block */}
        <div className="mt-6 p-4 rounded-xl bg-amber-500/1 dark:bg-amber-500/2 border border-amber-500/10 flex items-start gap-3 max-w-sm mx-auto">
          <ShieldAlert size={16} className="text-amber-500/70 shrink-0 mt-0.5" />
          <div className="space-y-1.5 text-[11px] font-mono font-medium text-slate-400 dark:text-slate-500 leading-none">
            <span className="block text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider mb-1 text-[10px]">Demo credentials for testing:</span>
            <div><span className="text-amber-600 dark:text-amber-400 font-bold">admin</span> / <span className="text-slate-600 dark:text-slate-400">password123</span></div>
            <div><span className="text-amber-600 dark:text-amber-400 font-bold">operator</span> / <span className="text-slate-600 dark:text-slate-400">password123</span></div>
            <div><span className="text-amber-600 dark:text-amber-400 font-bold">viewer</span> / <span className="text-slate-600 dark:text-slate-400">password123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}