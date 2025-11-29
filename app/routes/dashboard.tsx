import { Outlet, Link, useLocation } from "@remix-run/react";

export default function DashboardLayout() {
    const location = useLocation();

    const navItems = [
        { name: "Overview", path: "/dashboard/overview" },
        { name: "Orders", path: "/dashboard/orders" },
        { name: "Customers", path: "/dashboard/customers" },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className="w-64 bg-white shadow-md">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-blue-600">Xeno Insights</h1>
                </div>
                <nav className="mt-6">
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            to={item.path}
                            className={`block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 ${location.pathname === item.path ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600" : ""
                                }`}
                        >
                            {item.name}
                        </Link>
                    ))}
                </nav>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm p-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {navItems.find((i) => i.path === location.pathname)?.name || "Dashboard"}
                    </h2>
                    <div className="text-sm text-gray-500">Tenant: Demo Store</div>
                </header>
                <main className="p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
