import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  Moon,
  Wallet,
  CheckSquare,
  BarChart3,
  Zap,
  StickyNote,
  CalendarDays,
  Bot,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Study", url: "/study", icon: BookOpen },
  { title: "Gym", url: "/gym", icon: Dumbbell },
  { title: "Sleep", url: "/sleep", icon: Moon },
  { title: "Expenses", url: "/expenses", icon: Wallet },
  { title: "Habits", url: "/habits", icon: CheckSquare },
];

const toolItems = [
  { title: "Notes", url: "/notes", icon: StickyNote },
  { title: "Calendar", url: "/calendar", icon: CalendarDays },
];

const insightItems = [
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "AI Chat", url: "/ai-chat", icon: Bot },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <Sidebar collapsible="icon" className="border-r border-white/10 bg-black/20 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3 group/logo cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_15px_rgba(34,211,238,0.4)] transition-transform duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-12">
            <Zap className="h-5 w-5 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-black tracking-widest text-white uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Focus<span className="text-cyan-400">X</span></h1>
              <p className="text-[9px] uppercase tracking-widest text-cyan-400/70 font-bold">Player Dashboard</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/60">
            Trackers
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white hover:translate-x-1 group/nav"
                      activeClassName="neon-active text-green-400 font-bold tracking-wide"
                    >
                      <item.icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/nav:scale-110 group-hover/nav:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/60">
            Tools
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {toolItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white hover:translate-x-1 group/nav"
                      activeClassName="neon-active text-green-400 font-bold tracking-wide"
                    >
                      <item.icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/nav:scale-110 group-hover/nav:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/60">
            Insights
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {insightItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-all duration-300 hover:bg-white/10 hover:text-white hover:translate-x-1 group/nav"
                      activeClassName="neon-active text-green-400 font-bold tracking-wide"
                    >
                      <item.icon className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover/nav:scale-110 group-hover/nav:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {!collapsed && (
          <div className="flex flex-col gap-4">
            <div className="bg-black/40 border border-purple-500/30 rounded-2xl p-4 text-center relative overflow-hidden group/level">
              <div className="absolute inset-0 bg-purple-500/10 pointer-events-none transition-opacity duration-500 group-hover/level:opacity-50" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-full border-2 border-purple-400 p-0.5 shadow-[0_0_15px_rgba(168,85,247,0.4)] mb-2 relative">
                   <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center overflow-hidden">
                     {/* Placeholder Avatar */}
                     <span className="text-xl">🦊</span>
                   </div>
                   <div className="absolute -bottom-2 -right-2 bg-purple-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm border border-black shadow-[0_0_8px_rgba(168,85,247,0.8)]">
                     Lvl 12
                   </div>
                </div>
                <p className="text-xs font-bold text-purple-300 uppercase tracking-widest drop-shadow-[0_0_5px_rgba(216,180,254,0.5)]">Awakened</p>
                <div className="w-full mt-3">
                  <div className="progress-track bg-black/50 border border-white/10">
                    <div className="progress-fill shadow-[0_0_10px_rgba(168,85,247,0.6)]" style={{ width: "65%", background: "linear-gradient(90deg, #a855f7, #d8b4fe)" }} />
                  </div>
                  <div className="flex justify-between items-center mt-1.5 px-1">
                    <span className="text-[9px] text-white/40 font-bold uppercase">XP</span>
                    <p className="text-[10px] text-white/70 font-mono font-bold">650 / 1000</p>
                  </div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => signOut()}
              className="flex items-center justify-center gap-2 w-full p-2.5 rounded-xl text-xs uppercase tracking-widest text-white/50 transition-all duration-300 hover:bg-red-500/20 hover:text-red-400 border border-transparent hover:border-red-500/30 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] font-bold"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Disconnect</span>
            </button>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
