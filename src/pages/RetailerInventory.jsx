import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

function RetailerInventory() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">My Inventory</h1>
                    <p className="text-slate-500">Manage your stock and pricing.</p>
                </div>
                <button className="inline-flex items-center gap-2 bg-rose-500 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all hover:-translate-y-0.5">
                    <Plus size={18} />
                    Add New Product
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-rose-50/50 text-slate-700 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Product Name</th>
                                <th className="px-6 py-4">Price</th>
                                <th className="px-6 py-4">Stock</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {/* Mock Data Row 1 */}
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">Organic Apples</td>
                                <td className="px-6 py-4 text-rose-600 font-bold">₹240.00</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        50 units
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
                                    <button className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                            {/* Mock Data Row 2 */}
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">Sourdough Bread</td>
                                <td className="px-6 py-4 text-rose-600 font-bold">₹150.00</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                        Low (5)
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
                                    <button className="text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default RetailerInventory;