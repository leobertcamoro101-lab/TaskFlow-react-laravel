import { Outlet } from 'react-router-dom';

function RootLayout() {
  return (
    <div className="min-h-screen bg-[#FAF6EF]">
      <Outlet />
    </div>
  );
}

export default RootLayout;
