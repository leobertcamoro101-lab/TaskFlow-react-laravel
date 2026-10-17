import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';

function RootLayout() {
  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <Outlet />
      </Suspense>
    </div>
  );
}

export default RootLayout;
