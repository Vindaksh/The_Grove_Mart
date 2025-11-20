import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccessPage() {
    const location = useLocation();
    const orderId = location.state?.orderId || null;

    return (
        <div className="success-container">
            <div className="success-card">
                
                <div className="success-icon">✔</div>

                <h1 className="success-title">Order Placed Successfully!</h1>

                <p className="success-message">
                    Thank you for your purchase. Your order has been confirmed.
                </p>

                {orderId && (
                    <p className="success-order-id">
                        <strong>Order ID:</strong> {orderId}
                    </p>
                )}

                <Link to="/dashboard" className="success-button">
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default OrderSuccessPage;
