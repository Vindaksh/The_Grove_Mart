import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import './Checkout.css';
import {
    createOrder,
    createPayment,
    addOrderItems,
    createReimbursements,
    decrementStock,
    clearUserCart
} from "../utils/OrderDB";
import { getUserDetails } from "../utils/Database";

function CheckoutPage() {
    const { cartItems, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();

    // NEW SHIPPING FIELDS
    const [address1, setAddress1] = useState('');
    const [address2, setAddress2] = useState('');
    const [city, setCity] = useState('');
    const [pincode, setPincode] = useState('');
    const [country, setCountry] = useState('');

    const [paymentMethod, setPaymentMethod] = useState('cod');

    const handleSubmitOrder = async (e) => {
    e.preventDefault();

    const user = await getUserDetails();
    if (!user) {
        alert("You must be logged in.");
        return;
    }

    // 1. Create Payment
    const payment = await createPayment(totalPrice);
    if (!payment) return;

    // 2. Create Order
    const order = await createOrder(user.id, payment.payment_id, {
    address1,
    address2,
    city,
    pincode,
    country
});
    if (!order) return;

    // 3. Insert order_items
    await addOrderItems(order.order_id, cartItems);

    // 4. Create reimbursements
    await createReimbursements(cartItems, order.order_id);

    // 5. Update stock
    await decrementStock(cartItems);

    // 6. Empty Cart
    await clearUserCart(user.id);
    clearCart(); // local state

    // 7. Redirect to success page
    navigate("/order-success", { state: { orderId: order.order_id } });

};

    if (!cartItems || cartItems.length === 0) {
        return (
            <div className="checkout-container">
                <h2>Your Cart is Empty</h2>
                <p>You can't check out with an empty cart.</p>
            </div>
        );
    }
    const fetchLocationFromPincode = async () => {
    if (pincode.length < 6) return; // Indian PIN = 6 digits

    try {
        const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await res.json();

        if (!data || data[0].Status !== "Success") {
            console.log("Invalid pincode");
            return;
        }

        const postOffice = data[0].PostOffice?.[0];

        if (postOffice) {
            setCity(postOffice.District);
            setCountry(postOffice.Country);     // always India
            // (optional) setState(postOffice.State)
        }

    } catch (err) {
        console.error("Pincode lookup failed:", err);
    }
};

    return (
        <div className="checkout-container">
            <h1>Checkout</h1>

            <div className="checkout-content">

                {/* SHIPPING FORM */}
                <form className="checkout-form" onSubmit={handleSubmitOrder}>
                    <h2>Shipping Details</h2>

                    {/* Address Line 1 */}
                    <div className="form-group">
                        <label>Address Line 1</label>
                        <input
                            type="text"
                            value={address1}
                            onChange={(e) => setAddress1(e.target.value)}
                            required
                        />
                    </div>

                    {/* Address Line 2 (optional) */}
                    <div className="form-group">
                        <label>Address Line 2 (Optional)</label>
                        <input
                            type="text"
                            value={address2}
                            onChange={(e) => setAddress2(e.target.value)}
                        />
                    </div>

                    

                    {/* Pincode */}
                    <div className="form-group">
                        <label>Pincode</label>
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            onBlur={fetchLocationFromPincode}   // ⭐ auto-fill trigger
                            required
                        />
                    </div>

                    {/* City */}
                    <div className="form-group">
                        <label>City</label>
                        <input
                            type="text"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                        />
                    </div>

                    {/* Country */}
                    <div className="form-group">
                        <label>Country</label>
                        <input
                            type="text"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            required
                        />
                    </div>

                    <h2>Payment Method</h2>
                    <div className="payment-options">

                        <label className="payment-option">
                            <input
                                type="radio"
                                value="cod"
                                checked={paymentMethod === 'cod'}
                                onChange={() => setPaymentMethod('cod')}
                            />
                            Cash on Delivery
                        </label>

                        <label className="payment-option disabled">
                            <input
                                type="radio"
                                value="online"
                                disabled
                            />
                            Online Payment (Coming Soon)
                        </label>
                    </div>

                    <button type="submit" className="place-order-btn">
                        Place Order
                    </button>
                </form>

                {/* ORDER SUMMARY */}
                <div className="order-summary">
                    <h2>Your Order</h2>

                    {cartItems.map((item) => {
                        const listing = item.product_listings;
                        const product = listing.products;

                        return (
                            <div key={item.cart_item_id} className="summary-item">
                                <span>{product.name} (x{item.quantity})</span>
                                <span>₹{(listing.price * item.quantity).toFixed(2)}</span>
                            </div>
                        );
                    })}

                    <hr />

                    <div className="summary-total">
                        <strong>Total</strong>
                        <strong>₹{totalPrice.toFixed(2)}</strong>
                    </div>
                </div>

            </div>
        </div>
    );
}

export default CheckoutPage;
