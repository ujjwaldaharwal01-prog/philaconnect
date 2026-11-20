// Payment options offered at checkout.
//
// NO online payment is taken. Both options save the order as "Payment pending":
//  - cod:           the customer pays in cash when the stamps are delivered
//  - bank_transfer: "Pay later": the customer pays by bank/UPI transfer after the order is confirmed
// The `value` strings are stored in the database (orders.payment_method) and checked by the server.
export const PAYMENT_METHODS = [
  {
    value: 'cod',
    label: 'Cash on Delivery',
    description: 'Pay in cash when your stamps arrive at your door.',
  },
  {
    value: 'bank_transfer',
    label: 'Pay later (Bank / UPI transfer)',
    description: 'Place your order now. We will message you the transfer details once it is confirmed.',
  },
];
