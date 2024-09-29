// components/Form.tsx
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import db from "@utils/firestore";

interface FormData {
    name: string;
    product: string;
    quantity: number;
    invoiceDate: string;
    paymentStatus: string;
}

const Form = () => {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        product: "",
        quantity: 0,
        invoiceDate: "",
        paymentStatus: "",
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const docRef = await addDoc(collection(db, "invoices"), formData);
            console.log("Document written with ID: ", docRef.id);
            alert("Form submitted successfully!");
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="w-full mx-auto p-6 bg-white dark:bg-slate-700 shadow-lg rounded-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                User Information Form
            </h2>

            {/* Name Field */}
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Name:
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    required
                />
            </label>

            {/* Product Field */}
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Product:
                <input
                    type="text"
                    name="product"
                    value={formData.product}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    required
                />
            </label>

            {/* Quantity Field */}
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Quantity:
                <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    required
                />
            </label>

            {/* Invoice Date Field */}
            <label className="block mb-2 text-gray-700 dark:text-gray-300">
                Invoice Date:
                <input
                    type="date"
                    name="invoiceDate"
                    value={formData.invoiceDate}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    required
                />
            </label>

            {/* Payment Status Field */}
            <label className="block mb-4 text-gray-700 dark:text-gray-300">
                Payment Status:
                <select
                    name="paymentStatus"
                    value={formData.paymentStatus}
                    onChange={handleChange}
                    className="mt-1 w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200"
                    required>
                    <option value="">Select Status</option>
                    <option value="Paid">Paid</option>
                    <option value="Pending">Pending</option>
                    <option value="Overdue">Overdue</option>
                </select>
            </label>

            {/* Submit Button */}
            <button
                type="submit"
                className="w-full bg-blue-500 dark:bg-blue-600 text-white py-2 rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition duration-300">
                Submit
            </button>
        </form>
    );
};

export default Form;
