import { collection, addDoc, getDocs } from "firebase/firestore";
import db from "./firestore";

export const addSampleData = async () => {
    try {
        // Check if we already have data
        const invoicesSnapshot = await getDocs(collection(db, "invoices"));
        const customersSnapshot = await getDocs(collection(db, "customers"));
        const productsSnapshot = await getDocs(collection(db, "products"));
        const expensesSnapshot = await getDocs(collection(db, "expenses"));

        // Add sample customers if none exist
        if (customersSnapshot.empty) {
            const sampleCustomers = [
                {
                    name: "John Doe",
                    email: "john@example.com",
                    phone: "+1234567890",
                    address: "123 Main St",
                    city: "New York",
                    state: "NY",
                    pincode: "10001",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Jane Smith",
                    email: "jane@example.com",
                    phone: "+1234567891",
                    address: "456 Oak Ave",
                    city: "Los Angeles",
                    state: "CA",
                    pincode: "90210",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Bob Johnson",
                    email: "bob@example.com",
                    phone: "+1234567892",
                    address: "789 Pine St",
                    city: "Chicago",
                    state: "IL",
                    pincode: "60601",
                    createdAt: new Date().toISOString(),
                },
            ];

            for (const customer of sampleCustomers) {
                await addDoc(collection(db, "customers"), customer);
            }
            console.log("Added sample customers");
        }

        // Add sample products if none exist
        if (productsSnapshot.empty) {
            const sampleProducts = [
                {
                    name: "Laptop",
                    description: "High-performance laptop",
                    price: 1200,
                    stock: 10,
                    category: "Electronics",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Mouse",
                    description: "Wireless mouse",
                    price: 25,
                    stock: 50,
                    category: "Electronics",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Keyboard",
                    description: "Mechanical keyboard",
                    price: 80,
                    stock: 30,
                    category: "Electronics",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Monitor",
                    description: "4K Ultra HD Monitor",
                    price: 400,
                    stock: 15,
                    category: "Electronics",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Headphones",
                    description: "Noise-cancelling headphones",
                    price: 150,
                    stock: 25,
                    category: "Electronics",
                    createdAt: new Date().toISOString(),
                },
                {
                    name: "Webcam",
                    description: "HD Webcam for video calls",
                    price: 75,
                    stock: 20,
                    category: "Electronics",
                    createdAt: new Date().toISOString(),
                },
            ];

            for (const product of sampleProducts) {
                await addDoc(collection(db, "products"), product);
            }
            console.log("Added sample products");
        }

        // Add sample invoices if none exist
        if (invoicesSnapshot.empty) {
            const currentDate = new Date();
            const sampleInvoices = [
                {
                    product: "Laptop",
                    quantity: 2,
                    price: 1200,
                    description: "High-performance laptop",
                    buyerName: "John Doe",
                    buyerEmail: "john@example.com",
                    buyerPhone: "+1234567890",
                    buyerAddress: "123 Main St",
                    buyerCity: "New York",
                    buyerState: "NY",
                    buyerPincode: "10001",
                    invoiceDate: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
                    dueDate: new Date(currentDate.getTime() + 25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 25 days from now
                    paymentStatus: "Paid",
                    invoiceNumber: `INV-${Date.now()}-1`,
                    taxRate: 18,
                    discount: 50,
                    notes: "Bulk order discount",
                },
                {
                    product: "Mouse",
                    quantity: 5,
                    price: 25,
                    description: "Wireless mouse",
                    buyerName: "Jane Smith",
                    buyerEmail: "jane@example.com",
                    buyerPhone: "+1234567891",
                    buyerAddress: "456 Oak Ave",
                    buyerCity: "Los Angeles",
                    buyerState: "CA",
                    buyerPincode: "90210",
                    invoiceDate: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
                    dueDate: new Date(currentDate.getTime() + 27 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 27 days from now
                    paymentStatus: "Pending",
                    invoiceNumber: `INV-${Date.now()}-2`,
                    taxRate: 18,
                    discount: 0,
                    notes: "",
                },
                {
                    product: "Keyboard",
                    quantity: 3,
                    price: 80,
                    description: "Mechanical keyboard",
                    buyerName: "Bob Johnson",
                    buyerEmail: "bob@example.com",
                    buyerPhone: "+1234567892",
                    buyerAddress: "789 Pine St",
                    buyerCity: "Chicago",
                    buyerState: "IL",
                    buyerPincode: "60601",
                    invoiceDate: currentDate.toISOString().split('T')[0], // Today
                    dueDate: new Date(currentDate.getTime() + 29 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 29 days from now
                    paymentStatus: "Paid",
                    invoiceNumber: `INV-${Date.now()}-3`,
                    taxRate: 18,
                    discount: 20,
                    notes: "Loyal customer discount",
                },
                {
                    product: "Monitor",
                    quantity: 1,
                    price: 400,
                    description: "4K Ultra HD Monitor",
                    buyerName: "Alice Brown",
                    buyerEmail: "alice@example.com",
                    buyerPhone: "+1234567893",
                    buyerAddress: "321 Elm St",
                    buyerCity: "Boston",
                    buyerState: "MA",
                    buyerPincode: "02101",
                    invoiceDate: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
                    dueDate: new Date(currentDate.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 28 days from now
                    paymentStatus: "Paid",
                    invoiceNumber: `INV-${Date.now()}-4`,
                    taxRate: 18,
                    discount: 0,
                    notes: "",
                },
                {
                    product: "Headphones",
                    quantity: 2,
                    price: 150,
                    description: "Noise-cancelling headphones",
                    buyerName: "Charlie Wilson",
                    buyerEmail: "charlie@example.com",
                    buyerPhone: "+1234567894",
                    buyerAddress: "654 Maple Ave",
                    buyerCity: "Seattle",
                    buyerState: "WA",
                    buyerPincode: "98101",
                    invoiceDate: new Date(currentDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
                    dueDate: new Date(currentDate.getTime() + 26 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 26 days from now
                    paymentStatus: "Paid",
                    invoiceNumber: `INV-${Date.now()}-5`,
                    taxRate: 18,
                    discount: 30,
                    notes: "Bundle discount",
                },
                {
                    product: "Webcam",
                    quantity: 3,
                    price: 75,
                    description: "HD Webcam for video calls",
                    buyerName: "Diana Lee",
                    buyerEmail: "diana@example.com",
                    buyerPhone: "+1234567895",
                    buyerAddress: "987 Cedar Rd",
                    buyerCity: "Austin",
                    buyerState: "TX",
                    buyerPincode: "73301",
                    invoiceDate: new Date(currentDate.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 days ago
                    dueDate: new Date(currentDate.getTime() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 days from now
                    paymentStatus: "Pending",
                    invoiceNumber: `INV-${Date.now()}-6`,
                    taxRate: 18,
                    discount: 0,
                    notes: "",
                },
                {
                    product: "Mouse",
                    quantity: 2,
                    price: 25,
                    description: "Wireless mouse",
                    buyerName: "Eva Martinez",
                    buyerEmail: "eva@example.com",
                    buyerPhone: "+1234567896",
                    buyerAddress: "147 Birch St",
                    buyerCity: "Miami",
                    buyerState: "FL",
                    buyerPincode: "33101",
                    invoiceDate: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
                    dueDate: new Date(currentDate.getTime() + 23 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 23 days from now
                    paymentStatus: "Paid",
                    invoiceNumber: `INV-${Date.now()}-7`,
                    taxRate: 18,
                    discount: 0,
                    notes: "",
                },
                {
                    product: "Laptop",
                    quantity: 1,
                    price: 1200,
                    description: "High-performance laptop",
                    buyerName: "Test User",
                    buyerEmail: "test@example.com",
                    buyerPhone: "+1234567899",
                    buyerAddress: "999 Test St",
                    buyerCity: "Test City",
                    buyerState: "TC",
                    buyerPincode: "99999",
                    invoiceDate: currentDate.toISOString().split('T')[0], // Today
                    dueDate: new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                    paymentStatus: "Paid",
                    invoiceNumber: `INV-${Date.now()}-8`,
                    taxRate: 18,
                    discount: 100,
                    notes: "Test invoice for today",
                },
            ];

            for (const invoice of sampleInvoices) {
                await addDoc(collection(db, "invoices"), invoice);
            }
            console.log("Added sample invoices");
        }

        // Add sample expenses if none exist
        if (expensesSnapshot.empty) {
            const currentDate = new Date();
            const sampleExpenses = [
                {
                    date: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days ago
                    amount: 2000,
                    description: "Office rent for the month",
                    category: "Rent",
                    vendor: "Property Management Co",
                    status: "approved",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    date: new Date(currentDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 8 days ago
                    amount: 5000,
                    description: "Employee salaries",
                    category: "Salaries",
                    vendor: "Payroll Services",
                    status: "approved",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
                    amount: 300,
                    description: "Electricity bill",
                    category: "Utilities",
                    vendor: "Power Company",
                    status: "approved",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    date: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
                    amount: 800,
                    description: "Online advertising campaign",
                    category: "Marketing",
                    vendor: "Digital Marketing Agency",
                    status: "approved",
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];

            for (const expense of sampleExpenses) {
                await addDoc(collection(db, "expenses"), expense);
            }
            console.log("Added sample expenses");
        }

        console.log("Sample data setup completed");
    } catch (error) {
        console.error("Error adding sample data:", error);
    }
};
