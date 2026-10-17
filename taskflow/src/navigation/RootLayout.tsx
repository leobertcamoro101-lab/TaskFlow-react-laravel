import { Outlet } from 'react-router-dom';
import { Suspense } from 'react';
import LoadingSpinner from '../components/LoadingSpinner';
import Navbar from './Navbar';

function RootLayout() {
  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      <Suspense fallback={<div className="py-24"><LoadingSpinner/></div>}>
      <Outlet />
      <Navbar/>
      </Suspense>
    </div>
  );
}

export default RootLayout;
