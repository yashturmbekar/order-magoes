// Utility function to filter and sort orders
export function getSortedAndFilteredOrders(orders, searchTerm, sortConfig) {
  // Filter orders based on the search term
  const filteredOrders = orders.filter(
    (order) =>
      order.name.toLowerCase().includes(searchTerm) ||
      order.phone.includes(searchTerm)
  );

  // Sort orders based on the sort configuration
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
    }
    return 0;
  });

  return sortedOrders;
}

// Utility function to validate phone numbers
export function validatePhoneNumber(phoneNumber) {
  return /^\d{10}$/.test(phoneNumber);
}

// Utility function to format order dates
export function formatOrderDate(dateString) {
  const date = new Date(dateString);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

// Utility function to get row class based on order status and payment status
export function getOrderRowClass(order) {
  if (
    order.orderStatus === "delivered" &&
    order.paymentStatus === "completed"
  ) {
    return "order-received-payment-completed";
  }
  if (order.orderStatus === "order_received") {
    return "order-received";
  }
  if (order.orderStatus === "in_progress") {
    return "in-progress";
  }
  if (order.orderStatus === "out_for_delivery") {
    return "out-for-delivery";
  }
  if (
    order.orderStatus === "delivered" &&
    order.paymentStatus !== "completed"
  ) {
    return "delivered";
  }
  return "";
}

// Utility function to get display text for order status
export function getOrderStatusText(orderStatus) {
  switch (orderStatus) {
    case "order_received":
      return "Order Received";
    case "in_progress":
      return "In Progress";
    case "out_for_delivery":
      return "Out for Delivery";
    case "delivered":
      return "Delivered Successfully";
    default:
      return "Unknown";
  }
}

// Utility function to get display text for payment status
export function getPaymentStatusText(paymentStatus) {
  switch (paymentStatus) {
    case "pending":
      return "Payment Pending";
    case "completed":
      return "Payment Completed";
    default:
      return "Unknown";
  }
}

// Utility function to generate WhatsApp order message
export function generateWhatsAppMessage(form) {
  return `Hello, I want to order ${form.quantity} dozen(s) of Ratnagiri Hapus mangoes.\n\nName: ${form.name}\nPhone: ${form.phone}\nDelivery Location: ${form.location}`;
}

// Utility function to handle photo carousel index calculation
export function calculatePhotoIndex(currentIndex, totalPhotos) {
  return (currentIndex + 1) % totalPhotos;
}

// Utility function to store tokens in localStorage and cookies
export function storeTokens(accessToken, refreshToken) {
  localStorage.setItem("accessToken", accessToken);
  document.cookie = `refreshToken=${refreshToken}; HttpOnly; Secure; SameSite=Strict; path=/`;
}
