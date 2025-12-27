import { Navigation } from "@/components/Navigation";

export default function Layout({ children }) {
  return (
    <div className="flex flex-col h-screen">
      <header className="bg-primary text-white shadow-md">
        <div className="px-4 py-3">
          <h1 className="text-xl font-semibold">Golf Score Tracker</h1>
        </div>
      </header>

      <main className="flex-1 overflow-auto bg-gray-100">{children}</main>

      <Navigation />
    </div>
  );
}
