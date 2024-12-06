import Sidebar from "./components/Sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen flex  bg-gray-100">
        <Sidebar />
        <div className="w-60"></div>
        <div className="flex-1 m-3">{children}</div>
      </div>
    </>
  );
}
