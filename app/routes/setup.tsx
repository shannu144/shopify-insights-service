import { json, type ActionFunctionArgs, redirect } from "@remix-run/node";
import { Form, useActionData, useNavigation } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
    // Mock success for demo
    return redirect("/dashboard/overview");
}

export default function Setup() {
    const actionData = useActionData<typeof action>();
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Connect your Shopify Store
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Enter your store details to start ingesting data.
                    </p>
                </div>
                <Form method="post" className="mt-8 space-y-6">
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="shopDomain" className="sr-only">
                                Shop Domain
                            </label>
                            <input
                                id="shopDomain"
                                name="shopDomain"
                                type="text"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="my-store.myshopify.com"
                            />
                        </div>
                        <div>
                            <label htmlFor="accessToken" className="sr-only">
                                Admin API Access Token
                            </label>
                            <input
                                id="accessToken"
                                name="accessToken"
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                placeholder="shpat_..."
                            />
                        </div>
                    </div>

                    {actionData?.error && (
                        <div className="text-red-500 text-sm text-center">{actionData.error}</div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isSubmitting ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                        >
                            {isSubmitting ? "Connecting & Syncing..." : "Connect Store"}
                        </button>
                    </div>
                </Form>
            </div>
        </div>
    );
}
