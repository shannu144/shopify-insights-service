export const MOCK_DATA = {
    stats: {
        customers: 1250,
        orders: 3400,
        revenue: 154300.50,
    },
    ordersByDate: [
        { date: "2023-11-01", count: 45 },
        { date: "2023-11-02", count: 52 },
        { date: "2023-11-03", count: 38 },
        { date: "2023-11-04", count: 65 },
        { date: "2023-11-05", count: 48 },
        { date: "2023-11-06", count: 59 },
        { date: "2023-11-07", count: 62 },
    ],
    topCustomers: [
        { firstName: "Alice", lastName: "Smith", email: "alice@example.com", totalSpent: 5400.00 },
        { firstName: "Bob", lastName: "Jones", email: "bob@example.com", totalSpent: 4300.50 },
        { firstName: "Charlie", lastName: "Brown", email: "charlie@example.com", totalSpent: 3200.00 },
        { firstName: "Diana", lastName: "Prince", email: "diana@example.com", totalSpent: 2800.75 },
        { firstName: "Evan", lastName: "Wright", email: "evan@example.com", totalSpent: 2100.25 },
    ],
    orders: [
        { id: "1", orderNumber: 1001, processedAt: "2023-11-07T10:00:00Z", totalPrice: 150.00, currency: "USD", customer: { firstName: "Alice", lastName: "Smith" } },
        { id: "2", orderNumber: 1002, processedAt: "2023-11-07T11:30:00Z", totalPrice: 85.50, currency: "USD", customer: { firstName: "Bob", lastName: "Jones" } },
        { id: "3", orderNumber: 1003, processedAt: "2023-11-06T09:15:00Z", totalPrice: 200.00, currency: "USD", customer: { firstName: "Charlie", lastName: "Brown" } },
        { id: "4", orderNumber: 1004, processedAt: "2023-11-06T14:20:00Z", totalPrice: 45.00, currency: "USD", customer: { firstName: "Diana", lastName: "Prince" } },
        { id: "5", orderNumber: 1005, processedAt: "2023-11-05T16:45:00Z", totalPrice: 120.00, currency: "USD", customer: { firstName: "Evan", lastName: "Wright" } },
    ]
};
