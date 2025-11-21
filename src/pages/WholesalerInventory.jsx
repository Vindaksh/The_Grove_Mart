import React from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';

function WholesalerInventory() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">Bulk Inventory</h1>
                    <p className="text-slate-500">Manage stock available for retailers.</p>
                </div>
                <button className="inline-flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-0.5">
                    <Plus size={18} />
                    Add Bulk Item
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-indigo-50/50 text-slate-700 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Item Name</th>
                                <th className="px-6 py-4">Case Price</th>
                                <th className="px-6 py-4">Stock Level</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-slate-900">Apples (Crate of 50)</td>
                                <td className="px-6 py-4 text-indigo-600 font-bold">₹2,500.00</td>
                                <td className="px-6 py-4">
                                    <div className="w-full bg-slate-100 rounded-full h-2.5 max-w-[100px]">
                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '80%' }}></div>
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1 block">200 Crates left</span>
                                </td>
                                <td className="px-6 py-4 text-right space-x-3">
                                    <button className="text-slate-400 hover:text-indigo-600 transition-colors"><Edit2 size={18} /></button>
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

export default WholesalerInventory;