const TAX_RATE = 0.18;
const FREE_SHIPPING_ABOVE = 499;
const SHIPPING_FEE = 40;

const calcPrices = (items, coupon = null) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const shippingPrice = subtotal >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  const taxPrice = parseFloat((subtotal * TAX_RATE).toFixed(2));

  let discountAmount = 0;
  if (coupon) {
    if (coupon.type === 'percentage') {
      discountAmount = parseFloat(((subtotal * coupon.value) / 100).toFixed(2));
      if (coupon.maxDiscountAmount) discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }
  }

  const totalPrice = parseFloat((subtotal + shippingPrice + taxPrice - discountAmount).toFixed(2));
  return { subtotal, shippingPrice, taxPrice, discountAmount, totalPrice };
};

module.exports = calcPrices;
