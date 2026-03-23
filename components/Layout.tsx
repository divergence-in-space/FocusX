import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import SakuraBackground from "./SakuraBackground";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider>
      <div className="relative min-h-screen flex w-full overflow-hidden bg-[#05070e] text-white selection:bg-cyan-500/30">
        
        {/* Deep Anime Parallax Background */}
        <div 
          className="fixed inset-[-5%] z-0 bg-cover bg-center pointer-events-none hero-camera opacity-60"
          style={{ backgroundImage: `url('/hero-bg.png')` }} 
        />
        
        {/* Dark overlay for readability */}
        <div className="fixed inset-0 z-0 bg-gradient-to-br from-[#090b14]/90 via-black/70 to-[#0a0515]/90 pointer-events-none backdrop-blur-[2px]" />
        
        {/* Magical Sakura petals & Wind layer */}
        <div className="fixed inset-0 z-0 pointer-events-none mix-blend-screen opacity-60">
            <SakuraBackground variant="petals-only" />
        </div>

        <div className="relative z-10 flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            <header className="h-14 flex items-center justify-between border-b border-white/5 px-4 bg-black/20 backdrop-blur-md sticky top-0 z-20">
              <SidebarTrigger className="text-white/60 hover:text-white transition-colors" />
              <div className="flex items-center gap-3">
                 <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1.5 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)]">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                    <span className="text-[9px] text-cyan-100 font-bold uppercase tracking-[0.2em]">Link Start</span>
                 </div>
              </div>
            </header>
            <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden overflow-y-auto custom-scrollbar relative z-10">
              {children}
            </main>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
