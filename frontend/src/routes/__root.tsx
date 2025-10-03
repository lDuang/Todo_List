import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="min-h-screen flex flex-col items-center bg-slate-100 py-24 px-8">
        <Outlet />
      </div>
    </>
  ),
});
