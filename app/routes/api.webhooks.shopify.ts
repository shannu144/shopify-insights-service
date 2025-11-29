import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import crypto from "crypto";

// Webhook event types
type WebhookTopic =
    | "orders/create"
    | "orders/updated"
    | "customers/create"
    | "customers/update"
    | "products/create"
    | "products/update";

interface ShopifyWebhookPayload {
    id: number;
    [key: string]: any;
}

/**
 * Verify Shopify webhook HMAC signature
 */
function verifyWebhook(body: string, hmacHeader: string | null): boolean {
    if (!hmacHeader) return false;

    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;
    if (!secret) {
        console.error("SHOPIFY_WEBHOOK_SECRET not configured");
        return false;
    }

    const hash = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("base64");

    return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(hmacHeader)
    );
}

/**
 * Process webhook based on topic
 */
async function processWebhook(
    topic: WebhookTopic,
    shopDomain: string,
    payload: ShopifyWebhookPayload
) {
    console.log(`Processing webhook: ${topic} for shop: ${shopDomain}`);

    // TODO: Import Prisma client when database is ready
    // const prisma = new PrismaClient();

    try {
        // Find tenant by shop domain
        // const tenant = await prisma.tenant.findUnique({
        //   where: { shopDomain }
        // });

        // if (!tenant) {
        //   console.error(`Tenant not found for shop: ${shopDomain}`);
        //   return;
        // }

        switch (topic) {
            case "orders/create":
            case "orders/updated":
                await handleOrderWebhook(payload);
                break;

            case "customers/create":
            case "customers/update":
                await handleCustomerWebhook(payload);
                break;

            case "products/create":
            case "products/update":
                await handleProductWebhook(payload);
                break;

            default:
                console.log(`Unhandled webhook topic: ${topic}`);
        }
    } catch (error) {
        console.error(`Error processing webhook:`, error);
        throw error;
    }
}

async function handleOrderWebhook(payload: any) {
    console.log("Processing order webhook:", payload.id);

    // TODO: Implement order upsert
    // const orderData = {
    //   shopifyId: String(payload.id),
    //   orderNumber: payload.order_number,
    //   totalPrice: parseFloat(payload.total_price),
    //   currency: payload.currency,
    //   processedAt: new Date(payload.processed_at),
    //   tenantId: tenant.id,
    //   customerId: payload.customer?.id ? await getOrCreateCustomer(payload.customer) : null
    // };

    // await prisma.order.upsert({
    //   where: {
    //     shopifyId_tenantId: {
    //       shopifyId: orderData.shopifyId,
    //       tenantId: orderData.tenantId
    //     }
    //   },
    //   update: orderData,
    //   create: orderData
    // });
}

async function handleCustomerWebhook(payload: any) {
    console.log("Processing customer webhook:", payload.id);

    // TODO: Implement customer upsert
    // const customerData = {
    //   shopifyId: String(payload.id),
    //   firstName: payload.first_name,
    //   lastName: payload.last_name,
    //   email: payload.email,
    //   totalSpent: parseFloat(payload.total_spent || "0"),
    //   tenantId: tenant.id
    // };

    // await prisma.customer.upsert({
    //   where: {
    //     shopifyId_tenantId: {
    //       shopifyId: customerData.shopifyId,
    //       tenantId: customerData.tenantId
    //     }
    //   },
    //   update: customerData,
    //   create: customerData
    // });
}

async function handleProductWebhook(payload: any) {
    console.log("Processing product webhook:", payload.id);

    // TODO: Implement product upsert
    // const productData = {
    //   shopifyId: String(payload.id),
    //   title: payload.title,
    //   price: parseFloat(payload.variants?.[0]?.price || "0"),
    //   tenantId: tenant.id
    // };

    // await prisma.product.upsert({
    //   where: {
    //     shopifyId_tenantId: {
    //       shopifyId: productData.shopifyId,
    //       tenantId: productData.tenantId
    //     }
    //   },
    //   update: productData,
    //   create: productData
    // });
}

/**
 * Webhook endpoint handler
 */
export async function action({ request }: ActionFunctionArgs) {
    // Get headers
    const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
    const topic = request.headers.get("X-Shopify-Topic") as WebhookTopic | null;
    const shopDomain = request.headers.get("X-Shopify-Shop-Domain");

    if (!topic || !shopDomain) {
        return json({ error: "Missing required headers" }, { status: 400 });
    }

    // Get raw body for HMAC verification
    const body = await request.text();

    // Verify webhook signature
    if (!verifyWebhook(body, hmacHeader)) {
        console.error("Invalid webhook signature");
        return json({ error: "Invalid signature" }, { status: 401 });
    }

    // Parse payload
    const payload: ShopifyWebhookPayload = JSON.parse(body);

    // Process webhook asynchronously (don't block response)
    processWebhook(topic, shopDomain, payload).catch((error) => {
        console.error("Webhook processing failed:", error);
    });

    // Return 200 OK immediately to Shopify
    return json({ success: true }, { status: 200 });
}
