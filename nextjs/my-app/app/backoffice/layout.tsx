import "../../public/plugins/fontawesome-free/css/all.min.css";
import "../../public/plugins/tempusdominus-bootstrap-4/css/tempusdominus-bootstrap-4.min.css";
import "../../public/dist/css/adminlte.min.css";
import Sidebar from "./components/sidebar";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <div className="min-h-screen flex flex-row bg-gray-100">
        <Sidebar />
        <div className="w-60"></div>
        <div className="flex-1 mx-3">{children}</div>
      </div>
    </>
  );
}
