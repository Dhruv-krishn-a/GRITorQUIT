import Sidebar from "../src/Components/Sidebar/Sidebar";
import Header from "../src/Components/Header/Header";

export default function MainLayout({ children, username, onLogout }) {
  return (
    <div className="flex h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Sidebar username={username} onLogout={onLogout} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header username={username} onLogout={onLogout} />
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-primary)]">
          {children}
        </main>
      </div>
    </div>
  );
}