import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Camera, Search, Settings, History } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/camera', icon: Camera, label: 'Camera', isSpecial: true },
  { to: '/history', icon: History, label: 'History' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-lg">
      <div className="max-w-lg mx-auto flex items-end justify-between px-2 h-16 relative">
        {navItems.map(({ to, icon: Icon, label, isSpecial }) => {
          if (isSpecial) {
            return (
              <NavLink
                key={to}
                to={to}
                className="flex-1 flex flex-col items-center justify-center -top-5 relative group"
              >
                {({ isActive }) => (
                  <>
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform group-active:scale-95 ${
                        isActive
                          ? 'bg-brand-mid text-white ring-4 ring-brand-mid/20'
                          : 'bg-brand-mid text-white hover:bg-brand-dark'
                      }`}
                    >
                      <Camera size={26} strokeWidth={2} />
                    </div>
                    <span
                      className={`text-[10px] font-medium mt-1 transition-colors ${
                        isActive ? 'text-brand-mid font-semibold' : 'text-gray-400'
                      }`}
                    >
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            );
          }

          return (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center justify-center h-full gap-1 text-[11px] font-medium transition-colors ${
                  isActive
                    ? 'text-brand-mid'
                    : 'text-gray-400 hover:text-brand-mid'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={22}
                    strokeWidth={isActive ? 2.5 : 1.8}
                    className={isActive ? 'text-brand-mid' : 'text-gray-400'}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}