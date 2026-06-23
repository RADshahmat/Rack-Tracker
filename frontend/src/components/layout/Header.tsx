import { Bell, Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface HeaderProps {
  onToggleSidebar: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="w-full bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/60 sticky top-0 z-40 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between mx-auto w-full">

        {/* Left Side: Navigation triggers and branding text */}
        <div className="flex items-center gap-4 max-w-[60%]">
          <button
            onClick={onToggleSidebar}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-700 dark:text-slate-300"
            aria-label="Toggle Navigation Control Menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-xs font-semibold tracking-wider text-slate-900 dark:text-slate-200 truncate hidden md:block">
            GLOBAL DATACENTER INFRASTRUCTURE <span className="text-slate-400 dark:text-slate-500 mx-1.5">|</span>
            <span className="text-sky-600 dark:text-sky-400 font-medium"> REAL-TIME VISUALIZATION</span>
          </h1>
        </div>

        {/* Right Side: Quick controls, notifications, user profiles */}
        <div className="flex items-center gap-3 md:gap-4">
          <div className="text-[11px] font-medium tracking-wide text-slate-500 dark:text-slate-400 space-x-3 hidden sm:flex border-r border-slate-200 dark:border-slate-800 pr-4">
            <button className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors uppercase">Dashboard</button>
            <button className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors uppercase">Data</button>
          </div>

          <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors relative text-slate-700 dark:text-slate-300">
            <Bell size={19} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
          </button>

          <div className="flex items-center gap-3 pl-3 md:pl-4 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{user?.username}</p>
              <p className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 uppercase font-medium">{user?.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
              title="Terminate Active Session"
            >
              <LogOut size={19} />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
}