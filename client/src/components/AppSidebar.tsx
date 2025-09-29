import { useState, useEffect } from "react";
import {
    LayoutDashboard,
    ShoppingBag,
    CreditCard,
    Gift,
    MapPin,
    User,
    X,
    ArrowLeft
  } from "lucide-react";
  import { NavLink, useNavigate} from "react-router-dom";
  import { Button } from "@/components/ui/button";

  interface UserData {
    id: string;
    name: string;
    phone: string;
  }
  
  const sidebarItems = [
    { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
    { title: "Orders", url: "/dashboard/orders", icon: ShoppingBag },
    { title: "Transactions", url: "/dashboard/transactions", icon: CreditCard },
    { title: "Rewards", url: "/dashboard/rewards", icon: Gift },
    { title: "Address", url: "/dashboard/address", icon: MapPin },
    { title: "Profile", url: "/dashboard/profile", icon: User },
  ];
  
  interface AppSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
  }
  
  export function AppSidebar({ isOpen, onToggle }: AppSidebarProps) {
    const navigate = useNavigate();
    const [user, setUser] = useState<UserData | null>(null);

    useEffect(() => {
      const fetchUserData = () => {
        try {
          const userData = localStorage.getItem('melita_user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      };

      fetchUserData();
    }, []);
    return (
      <>
        {/* Mobile overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed left-0 top-0 h-screen bg-card border-r border-border shadow-luxury z-50
            w-72 transform transition-transform duration-300 ease-in-out flex flex-col
            ${isOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0 lg:relative lg:z-auto
          `}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">{user?.name[0].toUpperCase()}</span>
              </div>
              <div>
                <h2 className="font-semibold text-foreground">{user?.name || 'Melita'}</h2>
                <p className="text-xs text-muted-foreground">Welcome back!</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggle}
              className="lg:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
  
          {/* Navigation */}
          <nav className="p-4 space-y-2 flex-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.title}
                to={item.url}
                end={item.url === "/dashboard"}
                className={({ isActive }) => `
                  flex items-center space-x-3 px-4 py-3 rounded-2xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-soft" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }
                `}
              >
                <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                <span>{item.title}</span>
              </NavLink>
            ))}
          </nav>
  
     {/* Footer */}
<div className="p-4 border-t border-border mt-auto">
  <Button
    variant="ghost"
    className="w-full flex items-center justify-center space-x-2"
    onClick={() => navigate('/')}
  >
    <ArrowLeft className="h-4 w-4" />
    <span>Go Back</span>
  </Button>
</div>
        </aside>
      </>
    );
  }
  