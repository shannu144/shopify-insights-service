import { json, type ActionFunctionArgs } from "@remix-run/node";

export async function action({ request }: ActionFunctionArgs) {
    // Mock success for demo
    return json({
        success: true,
        tenantId: "mock-tenant-id",
        stats: {
            products: 120,
            customers: 45,
            orders: 89,
        },
    });
}
