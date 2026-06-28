import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";


import { Starfield } from "@/components/Starfield";
import { FloatingNav } from "@/components/FloatingNav";

function NotFoundComponent() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <div className="text-[11px] font-mono tracking-[0.3em] text-[#FF8C1A] mb-3">SIGNAL LOST</div>
        <h1 className="text-7xl font-display font-bold text-gradient-solar">404</h1>
        <p className="mt-3 text-white/60 text-sm">Telemetry off-nominal. The requested vector does not exist in the mission catalog.</p>
        <Link to="/" className="mt-6 inline-flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/15 px-5 py-2.5 text-sm font-medium text-white transition">
          Return to Mission
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 z-10">
      <div className="max-w-md text-center glass rounded-2xl p-10">
        <h1 className="text-xl font-display font-semibold text-white">Subsystem fault detected</h1>
        <p className="mt-2 text-sm text-white/55">A handler raised an exception. Reinitialize the link to continue.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded-lg bg-[#FF8C1A] text-black px-5 py-2 text-sm font-medium hover:brightness-110 transition">Reinitialize</button>
          <a href="/" className="rounded-lg border border-white/10 px-5 py-2 text-sm text-white hover:bg-white/5 transition">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

import { Toaster } from "@/components/ui/sonner";

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <HeadContent />
      <Toaster />
      <div className="relative min-h-screen overflow-x-hidden bg-[#05070D] text-foreground font-sans">
        <Starfield />
        <FloatingNav />
        <Outlet />
        <div className="noise-overlay" />
      </div>
      <Scripts />
    </QueryClientProvider>
  );
}

