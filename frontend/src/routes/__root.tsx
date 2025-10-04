import { createRootRoute, Outlet } from '@tanstack/react-router';
import { Toaster } from 'sonner';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Outlet />
      <Toaster />
    </div>
  ),
});
