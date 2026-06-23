import { useLocation, Link } from 'react-router-dom';
import { useTheme } from '@/components/shared/ThemeProvider';
import { LayoutDashboard, Server, Cpu, Moon, Sun, LogOut, LucideMessageSquareWarning, Clock } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface SidebarProps {
  isExpanded: boolean;
}

export function Sidebar({ isExpanded }: SidebarProps) {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/racks', label: 'Racks', icon: Server },
    { path: '/equipment', label: 'Equipment', icon: Cpu },
    ...(isAdmin ? [
      { path: '/admin/scheduler', label: 'Scheduler', icon: Clock },
      { path: '/admin/warnings', label: 'Warnings', icon: LucideMessageSquareWarning },
    ] : []),
  ];

  return (
    <aside
      className={`fixed md:sticky top-[57px] left-0 h-[calc(100vh-57px)] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/60 flex flex-col py-4 z-40 transition-all duration-300 ease-in-out
      ${isExpanded ? 'w-50 translate-x-0' : 'w-18 -translate-x-full md:translate-x-0'}`}
    >

      {/* Primary Context Navigation Stack */}
      <nav className="flex-1 flex flex-col space-y-1.5 px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center rounded-xl transition-all duration-200 group relative h-10 ${isExpanded
                  ? 'gap-3 px-3 w-full'              
                  : 'justify-center w-12 mx-auto'     
                } ${isActive
                  ? 'bg-gradient-to-r from-sky-600 to-sky-500 text-white shadow-sm shadow-sky-500/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              title={isExpanded ? '' : item.label}
            >
              <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors'}`} />

              {isExpanded && (
                <span className="text-sm font-medium tracking-wide truncate">
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Control Utility Footer Context */}
      <div className="flex flex-col space-y-1 pt-4 px-3 border-t border-slate-200 dark:border-slate-800/60">
        {/* Color Palette Context Filter (Theme Mode) */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 h-10 px-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950/60 hover:text-slate-900 dark:hover:text-slate-200 transition-all ${isExpanded ? '' : 'justify-center'}`}
          title={theme === 'dark' ? 'Activate Light Space' : 'Activate Dark Space'}
        >
          {theme === 'dark' ? <Sun size={18} className="text-amber-500" /> : <Moon size={18} className="text-indigo-500" />}
          {isExpanded && <span className="text-xs font-medium tracking-wide">{theme === 'dark' ? 'Light Spectrum' : 'Dark Spectrum'}</span>}
        </button>
      </div>
    </aside>
  );
}