import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

function AdminLayout({ onLogout }) {
  return (
    <div className="flex h-screen w-screen bg-gray-50 overflow-hidden font-sans">
      
      {/* Sidebar cố định bên trái */}
      <Sidebar onLogout={onLogout} />

      {/* Vùng nội dung chính chứa Outlet bên phải */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-gray-50">
        <Outlet />
      </main>

    </div>
  );
}

export default AdminLayout;