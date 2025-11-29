export class ShopifyService {
    private shopDomain: string;
    private accessToken: string;
    private apiVersion = "2024-01";

    constructor(shopDomain: string, accessToken: string) {
        this.shopDomain = shopDomain;
        this.accessToken = accessToken;
    }

    async syncProducts(tenantId: string) {
        // Mock sync
        return 120;
    }

    async syncCustomers(tenantId: string) {
        // Mock sync
        return 45;
    }

    async syncOrders(tenantId: string) {
        // Mock sync
        return 89;
    }
}
