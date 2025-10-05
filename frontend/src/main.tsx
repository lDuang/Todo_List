// import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  RouterProvider,
  Router,
  createHashHistory,
} from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

import './index.css';

const queryClient = new QueryClient();

// Create a hash history for Electron
const hashHistory = createHashHistory();

const router = new Router({
  routeTree,
  history: hashHistory,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    // <StrictMode>
    //   <QueryClientProvider client={queryClient}>
    //     <RouterProvider router={router} />
    //   </QueryClientProvider>
    // </StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
  );
}
