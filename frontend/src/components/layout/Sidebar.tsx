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
    <aside className={`fixed left-0 top-0 h-full bg-white dark:bg-dark-surface border-r border-gray-200 dark:border-dark-border flex flex-col py-4 z-40 transition-all duration-300 ${isExpanded ? 'w-64' : 'w-20'
      }`}>
      {/* Logo section - only visible when NOT expanded */}
      {!isExpanded && (
        <div className="px-2 mb-6 flex justify-center">
          <div className="w-12 h-12 bg-sky-600 dark:bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            DC
          </div>
        </div>
      )}

      {/* Expanded header with logo + name */}
      {isExpanded && (
        <div className="px-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-600 dark:bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0">
              DC
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">DataCenter</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Infrastructure</span>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 flex flex-col space-y-2 px-2">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 h-10 px-3 rounded-lg transition-all ${isActive
                  ? 'bg-sky-600 dark:bg-sky-600 text-white dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border'
                }`}
              title={isExpanded ? '' : item.label}
            >
              <Icon size={20} className="shrink-0" />
              {isExpanded && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex flex-col space-y-2 pt-4 px-2 border-t border-gray-200 dark:border-dark-border">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={`flex items-center gap-3 h-10 px-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-all ${isExpanded ? '' : 'justify-center'}`}
          title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          {isExpanded && <span className="text-sm">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
        </button>

        {/* Logout */}
        <button
          className={`flex items-center gap-3 h-10 px-3 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-border transition-all ${isExpanded ? '' : 'justify-center'}`}
          title="Logout"
        >
          <LogOut size={20} />
          {isExpanded && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
}