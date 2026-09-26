import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoadingProvider } from './context/LoadingProvider';
import { useSessionWatcher } from './hooks/useSessionWatcher';
import router from './router/AppRoutes';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function App() {
  useSessionWatcher();

  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <RouterProvider router={router}/>
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;


// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { LoadingProvider } from './context/LoadingProvider';
// import AppRoutes from './router/AppRoutes';
// import { BrowserRouter } from 'react-router-dom';
// import { useSessionWatcher } from './hooks/useSessionWatcher';

// const queryClient = new QueryClient({
//   defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
// });

// function App() {
//   useSessionWatcher();

//   return (
//     <QueryClientProvider client={queryClient}>
//       <LoadingProvider>
//         <BrowserRouter>
//           <AppRoutes/>
//         </BrowserRouter>
//       </LoadingProvider>
//     </QueryClientProvider>
//   );
// }

// export default App;
