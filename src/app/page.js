"use client";

import { useState, useEffect } from "react";
import QRCode from "react-qr-code";
import Link from "next/link";

// Sample product data
const PRODUCTS = [
  { "code": "TV-55-SMART-4K", "description": "55\" Smart 4K UHD LED TV", "price": 599.99, "category": "Electronics" },
  { "code": "LAPTOP-15-GAMING", "description": "15.6\" Gaming Laptop, i7, 16GB RAM, RTX 3060", "price": 1299.00, "category": "Electronics" },
  { "code": "PHONE-128GB-5G", "description": "Smartphone 128GB, 5G Enabled", "price": 749.50, "category": "Electronics" },
  { "code": "BT-HEADPHONES-NC", "description": "Bluetooth Noise-Cancelling Headphones", "price": 199.99, "category": "Electronics" },
  { "code": "MOUSE-WL-ERG", "description": "Wireless Ergonomic Mouse", "price": 39.99, "category": "Accessories" },
  { "code": "KEYBOARD-MECH-RGB", "description": "Mechanical Keyboard with RGB Backlight", "price": 89.95, "category": "Accessories" },
  { "code": "MONITOR-27-IPS", "description": "27\" IPS Full HD Monitor", "price": 189.00, "category": "Electronics" },
  { "code": "CAMERA-DSLR-24MP", "description": "DSLR Camera, 24MP, 18-55mm Lens", "price": 649.00, "category": "Electronics" },
  { "code": "TABLET-10-64GB", "description": "10\" Tablet 64GB, Wi-Fi + LTE", "price": 279.99, "category": "Electronics" },
  { "code": "USB-32GB-3.0", "description": "32GB USB 3.0 Flash Drive", "price": 12.99, "category": "Accessories" },
  { "code": "SD-128GB-U3", "description": "128GB SD Card UHS-I U3", "price": 34.50, "category": "Accessories" },
  { "code": "PRINTER-LSR-COLOR", "description": "Color Laser Printer", "price": 229.99, "category": "Electronics" },
  { "code": "ROUTER-WL-AX", "description": "Wi-Fi 6 Dual-Band Router", "price": 149.99, "category": "Electronics" },
  { "code": "SPEAKER-BT-PORT", "description": "Portable Bluetooth Speaker", "price": 59.00, "category": "Electronics" },
  { "code": "SMARTWATCH-GPS", "description": "Smartwatch with GPS & Heart Rate Monitor", "price": 199.00, "category": "Electronics" },
  { "code": "EXT-HD-1TB", "description": "External Hard Drive 1TB USB 3.1", "price": 54.99, "category": "Accessories" },
  { "code": "SSD-500GB-NVME", "description": "500GB NVMe M.2 SSD", "price": 69.99, "category": "Accessories" },
  { "code": "HDMI-CABLE-6FT", "description": "HDMI Cable 6ft, High-Speed 4K", "price": 9.99, "category": "Accessories" },
  { "code": "CHARGER-USB-C-65W", "description": "65W USB-C Fast Charger", "price": 29.99, "category": "Accessories" },
  { "code": "POWERBANK-20K", "description": "20,000mAh Portable Power Bank", "price": 39.50, "category": "Accessories" },
  { "code": "VR-HEADSET", "description": "Virtual Reality Headset", "price": 399.99, "category": "Electronics" },
  { "code": "GAMING-CHAIR-ERG", "description": "Ergonomic Gaming Chair", "price": 179.99, "category": "Furniture" },
  { "code": "WEBCAM-1080P", "description": "Full HD 1080p Webcam", "price": 49.99, "category": "Accessories" },
  { "code": "MIC-USB-STUDIO", "description": "USB Studio Microphone", "price": 89.99, "category": "Accessories" },
  { "code": "DRONE-4K", "description": "4K Camera Drone with GPS", "price": 549.00, "category": "Electronics" },
  { "code": "PROJECTOR-1080P", "description": "1080p Home Theater Projector", "price": 299.99, "category": "Electronics" },
  { "code": "SOUND-BAR-2.1", "description": "2.1 Channel Sound Bar with Subwoofer", "price": 179.50, "category": "Electronics" },
  { "code": "COFFEE-MAKER-SMART", "description": "Smart Coffee Maker with Wi-Fi", "price": 129.00, "category": "Appliances" },
  { "code": "SMARTHOME-HUB", "description": "Smart Home Control Hub", "price": 89.00, "category": "Electronics" }
];

const CATEGORIES = ["All", "Electronics", "Accessories", "Furniture", "Appliances"];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showCart, setShowCart] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter products based on category and search
  const filteredProducts = PRODUCTS.filter(product => {
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Add item to cart
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.code === product.code);
      if (existingItem) {
        return prevCart.map(item =>
          item.code === product.code
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // Remove item from cart
  const removeFromCart = (productCode) => {
    setCart(prevCart => prevCart.filter(item => item.code !== productCode));
  };

  // Update quantity
  const updateQuantity = (productCode, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productCode);
      return;
    }
    setCart(prevCart =>
      prevCart.map(item =>
        item.code === productCode
          ? { ...item, quantity: newQuantity }
          : item
      )
    );
  };

  // Calculate totals
  const calculateTotals = () => {
    const subTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxRate = 0.07; // 7% tax
    const taxTotal = subTotal * taxRate;
    const grandTotal = subTotal + taxTotal;
    return { subTotal, taxTotal, grandTotal };
  };

  // Checkout function
  const checkout = async () => {
    if (cart.length === 0) return;

    const { subTotal, taxTotal, grandTotal } = calculateTotals();
    const now = new Date();

    const receipt = {
      "receiptId": `POS-${now.getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`,
      "store": {
        "name": "Tech World Electronics",
        "address": "123 Main Street, Springfield, USA",
        "phone": "+1-555-123-4567",
        "taxId": "US-12-3456789",
        "website": "https://techworld.com"
      },
      "cashier": {
        "id": "CASH-004",
        "name": "John Doe"
      },
      "transaction": {
        "date": now.toISOString().split('T')[0],
        "time": now.toTimeString().split(' ')[0],
        "currency": "USD",
        "items": cart.map(item => ({
          "code": item.code,
          "description": item.description,
          "quantity": item.quantity,
          "unitPrice": item.price,
          "taxRate": 0.07,
          "taxAmount": parseFloat((item.price * item.quantity * 0.07).toFixed(2)),
          "lineTotal": parseFloat((item.price * item.quantity * 1.07).toFixed(2))
        })),
        "totals": {
          "subTotal": parseFloat(subTotal.toFixed(2)),
          "taxTotal": parseFloat(taxTotal.toFixed(2)),
          "grandTotal": parseFloat(grandTotal.toFixed(2))
        },
        "payment": {
          "method": "Credit Card",
          "cardType": "Visa",
          "last4": "1234",
          "amountPaid": parseFloat(grandTotal.toFixed(2)),
          "changeDue": 0.00
        }
      },
      "footer": {
        "message": "Thank you for shopping with us!",
        "returnPolicy": "Returns accepted within 30 days with receipt.",
        "fiscalSignature": "abc123xyz987",
        "qrCodeData": `https://taxauthority.gov/verify?receiptId=POS-${now.getFullYear()}-${String(Math.floor(Math.random() * 999999)).padStart(6, '0')}`
      }
    };

    // Save to blockchain (existing functionality)
    try {
      const { symkeyString, timestamp, txid } = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/create-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ receiptData: receipt }),
      }).then((res) => res.json());

      setReceiptData({ ...receipt, symkeyString, timestamp, txid });
    } catch (error) {
      console.error("Error saving to blockchain:", error);
      setReceiptData(receipt);
    }

    setShowReceipt(true);
    setShowCart(false);
    setCart([]);
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const { subTotal, taxTotal, grandTotal } = calculateTotals();

  // Receipt Modal Component
  const ReceiptModal = () => {
    if (!showReceipt || !receiptData) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto">
          {/* Receipt Header */}
          <div className="p-6 text-center border-b">
            <h2 className="text-xl font-bold text-gray-800">Receipt</h2>
            <p className="text-sm text-gray-600">{receiptData.transaction.date} {receiptData.transaction.time}</p>
          </div>

          {/* Store Info */}
          <div className="p-4 text-center border-b">
            <h3 className="font-bold text-gray-800">{receiptData.store.name}</h3>
            <p className="text-sm text-gray-600">{receiptData.store.address}</p>
            <p className="text-sm text-gray-600">{receiptData.store.phone}</p>
          </div>

          {/* Items */}
          <div className="p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 text-gray-800">Item</th>
                  <th className="text-right py-2 text-gray-800">Price</th>
                  <th className="text-right py-2 text-gray-800">VAT</th>
                  <th className="text-right py-2 text-gray-800">Total</th>
                </tr>
              </thead>
              <tbody>
                {receiptData.transaction.items.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="py-2 text-gray-800">
                      <div className="font-medium">{item.description}</div>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </td>
                    <td className="text-right py-2 text-gray-800">${item.unitPrice.toFixed(2)}</td>
                    <td className="text-right py-2 text-gray-800">{(item.taxRate * 100).toFixed(0)}%</td>
                    <td className="text-right py-2 text-gray-800">${item.lineTotal.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="p-4 border-t">
            <div className="flex justify-between py-1">
              <span className="text-gray-800">Sum total exc VAT</span>
              <span className="text-gray-800">${receiptData.transaction.totals.subTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">Payment method</span>
              <span className="text-gray-600">{receiptData.transaction.payment.method}</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-gray-600">VAT 7%</span>
              <span className="text-gray-600">${receiptData.transaction.totals.taxTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1 font-bold text-lg border-t pt-2">
              <span className="text-gray-800">CASH</span>
              <span className="text-gray-800">${receiptData.transaction.totals.grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* QR Code */}
          <div className="p-6 text-center border-t">
            <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
              <QRCode
                value={receiptData.txid ? JSON.stringify({
                  txid: receiptData.txid,
                  symkeyString: receiptData.symkeyString,
                  timestamp: receiptData.timestamp
                }) : receiptData.footer.qrCodeData}
                size={120}
              />
            </div>
            <p className="text-xs text-gray-600 mb-4">{receiptData.footer.message}</p>
            <div className="bg-green-100 p-3 rounded-lg">
              <p className="text-xs text-green-800 font-medium">🌱 With this receipt you save 0.5 g of paper and 0.5 g of CO₂</p>
              <p className="text-xs text-green-600 mt-1">Let's keep our planet green - Thank you!</p>
            </div>
          </div>

          {/* Close Button */}
          <div className="p-4 border-t">
            <button
              onClick={() => setShowReceipt(false)}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
            >
              Close Receipt
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-white">Tech World POS</h1>
          </div>
          <button
            onClick={() => setShowCart(true)}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 flex items-center gap-2 relative hover:cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            Cart ({cartItemCount})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Categories & Search */}
          <div className="lg:col-span-1">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-4">Store</h2>

              {/* Search */}
              <div className="mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <svg className="absolute right-3 top-3.5 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Categories */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">All Categories</h3>
                <div className="space-y-2">
                  {CATEGORIES.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex items-center gap-3 ${selectedCategory === category
                          ? 'bg-purple-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                        }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Products Grid */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map(product => (
                <div
                  key={product.code}
                  className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-4 border border-slate-700/50 shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 flex flex-col h-full"
                >
                  <div className="text-center flex flex-col flex-grow">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mx-auto mb-3 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-2 h-10 flex items-center justify-center">{product.description}</h3>
                    <p className="text-purple-400 font-bold text-lg mb-3">${product.price.toFixed(2)}</p>
                    <div className="mt-auto">
                      <button
                        onClick={() => addToCart(product)}
                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium py-2 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 hover:cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-700">
            <div className="p-6 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">My Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8m-8 0a2 2 0 100 4 2 2 0 000-4zm8 0a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  <p className="text-slate-400 text-lg">Your cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.code} className="flex items-center justify-between bg-slate-700/50 rounded-xl p-4">
                        <div className="flex-1">
                          <h3 className="font-medium text-white">{item.description}</h3>
                          <p className="text-slate-400 text-sm">${item.price.toFixed(2)} each</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateQuantity(item.code, item.quantity - 1)}
                              className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-white rounded-lg flex items-center justify-center transition-colors hover:cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.code, item.quantity + 1)}
                              className="w-8 h-8 bg-slate-600 hover:bg-slate-500 text-white rounded-lg flex items-center justify-center transition-colors hover:cursor-pointer"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            </button>
                          </div>
                          <p className="text-white font-semibold w-20 text-right">${(item.price * item.quantity).toFixed(2)}</p>
                          <button
                            onClick={() => removeFromCart(item.code)}
                            className="text-red-400 hover:text-red-300 transition-colors hover:cursor-pointer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-slate-700 pt-4">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-slate-300">
                        <span>Subtotal:</span>
                        <span>${subTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-300">
                        <span>Tax (7%):</span>
                        <span>${taxTotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-white font-bold text-lg border-t border-slate-700 pt-2">
                        <span>Total:</span>
                        <span>${grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={checkout}
                      className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:cursor-pointer"
                    >
                      Checkout
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <ReceiptModal />
    </main>
  );
}