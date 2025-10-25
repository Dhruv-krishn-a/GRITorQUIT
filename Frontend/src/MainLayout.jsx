import Sidebar from "../src/Components/Sidebar/Sidebar";
import Header from "../src/Components/Header/Header";

export default function MainLayout({ children, username, onLogout }) {
  return (
    <div className="flex h-screen bg-[#0e0e0e] text-gray-100">
      <Sidebar username={username} onLogout={onLogout} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header username={username} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}