import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Outlet />
    </div>
  ),
});
