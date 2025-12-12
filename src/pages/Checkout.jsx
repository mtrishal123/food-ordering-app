import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useCart } from "../context/CartContext";
import { useAuth } from "../hooks/useAuth";
import { useWallet } from "../context/WalletContext";
import Cart from "../components/Cart";
import "./Checkout.css";

function Checkout() {
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { balance, deductMoney } = useWallet();
  const navigate = useNavigate();

  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  const totalAmount = parseFloat(getTotalPrice());

  const validateForm = () => {
    const newErrors = {};

    if (!deliveryAddress.trim()) {
      newErrors.deliveryAddress = "Delivery address is required";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ""))) {
      newErrors.phoneNumber = "Please enter a valid 10-digit phone number";
    }

    if (paymentMethod === "card" && !cardNumber.trim()) {
      newErrors.cardNumber = "Card number is required";
    } else if (
      paymentMethod === "card" &&
      !/^\d{16}$/.test(cardNumber.replace(/\s/g, ""))
    ) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (paymentMethod === "wallet" && balance < totalAmount) {
      newErrors.wallet = `Insufficient balance. You have $${balance.toFixed(
        2
      )} but need $${totalAmount.toFixed(2)}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setProcessing(true);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Process wallet payment if selected
    if (paymentMethod === "wallet") {
      const result = deductMoney(totalAmount);
      if (!result.success) {
        setErrors({ wallet: result.error });
        setProcessing(false);
        return;
      }
    }

    // Create order object
    const order = {
      id: `ORDER-${Date.now()}`,
      userId: user.id,
      items: cart,
      totalPrice: totalAmount.toFixed(2),
      deliveryAddress,
      phoneNumber,
      specialInstructions,
      paymentMethod,
      status: "confirmed",
      orderDate: new Date().toISOString(),
      estimatedDelivery: new Date(Date.now() + 45 * 60000).toISOString(),
    };

    // Save order to localStorage
    const existingOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    existingOrders.push(order);
    localStorage.setItem("orders", JSON.stringify(existingOrders));

    // Clear cart
    clearCart();

    setProcessing(false);

    // Navigate to order history with success message
    navigate("/orders", { state: { newOrder: order } });
  };

  const formatCardNumber = (value) => {
    const numbers = value.replace(/\D/g, "");
    const groups = numbers.match(/.{1,4}/g);
    return groups ? groups.join(" ") : numbers;
  };

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    if (formatted.replace(/\s/g, "").length <= 16) {
      setCardNumber(formatted);
    }
  };

  if (cart.length === 0) {
    return (
      <>
        <Helmet>
          <title>Checkout - FoodOrder</title>
          <meta
            name="description"
            content="Complete your food order checkout"
          />
        </Helmet>

        <div className="checkout-container">
          <div className="empty-cart">
            <h2>Your cart is empty 🛒</h2>
            <p>Add some delicious items to your cart before checking out!</p>
            <button onClick={() => navigate("/")} className="btn btn-primary">
              Browse Restaurants
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>Checkout - FoodOrder</title>
        <meta name="description" content="Complete your food order checkout" />
      </Helmet>

      <div className="checkout-container">
        <h1 className="checkout-title">Checkout</h1>

        <div className="checkout-grid">
          <div className="checkout-form-section">
            <form onSubmit={handlePlaceOrder} className="checkout-form">
              <div className="form-section">
                <h2>Delivery Information</h2>

                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    value={user?.name || ""}
                    disabled
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="(555) 123-4567"
                    className={`form-input ${
                      errors.phoneNumber ? "error" : ""
                    }`}
                    required
                  />
                  {errors.phoneNumber && (
                    <span className="error-message">{errors.phoneNumber}</span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="address">Delivery Address *</label>
                  <textarea
                    id="address"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="123 Main St, Apt 4B, City, State ZIP"
                    rows="3"
                    className={`form-input ${
                      errors.deliveryAddress ? "error" : ""
                    }`}
                    required
                  />
                  {errors.deliveryAddress && (
                    <span className="error-message">
                      {errors.deliveryAddress}
                    </span>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="instructions">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    id="instructions"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g., Ring doorbell, leave at door, etc."
                    rows="2"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-section">
                <h2>Payment Method</h2>

                <div className="payment-methods">
                  <label
                    className={`payment-option ${
                      paymentMethod === "wallet" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="wallet"
                      checked={paymentMethod === "wallet"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💰 Wallet (Balance: ${balance.toFixed(2)})</span>
                  </label>

                  <label
                    className={`payment-option ${
                      paymentMethod === "card" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💳 Credit/Debit Card</span>
                  </label>

                  <label
                    className={`payment-option ${
                      paymentMethod === "cash" ? "active" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                    />
                    <span>💵 Cash on Delivery</span>
                  </label>
                </div>

                {errors.wallet && (
                  <div className="wallet-error">
                    <p className="error-message">{errors.wallet}</p>
                    <button
                      type="button"
                      onClick={() => navigate("/wallet")}
                      className="btn btn-secondary"
                      style={{ marginTop: "1rem" }}
                    >
                      Add Money to Wallet
                    </button>
                  </div>
                )}

                {paymentMethod === "card" && (
                  <div className="form-group">
                    <label htmlFor="cardNumber">Card Number *</label>
                    <input
                      type="text"
                      id="cardNumber"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      placeholder="1234 5678 9012 3456"
                      className={`form-input ${
                        errors.cardNumber ? "error" : ""
                      }`}
                      required
                    />
                    {errors.cardNumber && (
                      <span className="error-message">{errors.cardNumber}</span>
                    )}
                    <p className="fake-payment-note">
                      ℹ️ This is a fake payment. Use any 16-digit number.
                    </p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary checkout-submit"
                disabled={processing}
              >
                {processing
                  ? "Processing..."
                  : `Place Order - $${getTotalPrice()}`}
              </button>
            </form>
          </div>

          <div className="checkout-cart-section">
            <Cart showCheckoutButton={false} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Checkout;
