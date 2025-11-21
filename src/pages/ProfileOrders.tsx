import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext"
import { OrderInterface } from "../utils/Interfaces";
import { getOrders } from "../utils/OrderDB";

export const ProfileOrdersPage = () => {
    const { user } = useAuth();
    const [ orders, setOrders ] = useState<OrderInterface[]>([]);
    
    useEffect( () => {
        if(user) {
            getOrders(user!)
            .then(items => setOrders(items));
        }
    }, [user]);

    return (
        <div>
            <h1>My Orders</h1>
            <ul>
                {orders.map(order => (
                <li key={order.order_id}>
                    Order {order.order_id}:
                    <ul>
                    {order.order_items.map(item => (
                        <li key={item.listing_id}>
                        {item.name} - {item.quantity} x ${item.price} ({item.order_status})
                        </li>
                    ))}
                    </ul>
                </li>
                ))}
            </ul>
        </div>
    );
}