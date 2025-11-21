import React from 'react';
import { Check } from 'lucide-react';

function WholesalerOrders() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-extrabold text-slate-900">Retailer Orders</h1>
                <p className="text-slate-500">Manage bulk fulfillment requests.</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-indigo-50/50 text-slate-700 font-bold uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Order ID</th>
                                <th className="px-6 py-4">Retailer</th>
                                <th className="px-6 py-4">Items</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            <tr className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 font-mono text-slate-500">#1002</td>
                                <td className="px-6 py-4 font-bold text-slate-800">Local Grocers Inc.</td>
                                <td className="px-6 py-4 text-slate-600">5x Apple Crates</td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                                        New
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="inline-flex items-center gap-1 text-xs font-bold bg-slate-900 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-600 transition-colors">
                                        <Check size={14} /> Fulfill
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default WholesalerOrders;