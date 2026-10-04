// Change these to match your restaurant.
export const RESTAURANT = {
  name: "Marwa",
  tagline: "A short menu, cooked fresh every day.",
  phone: "+998 90 000 00 00",
  hours: "Every day, 10:00–22:00",
  currency: "so'm",
};

export function formatPrice(value) {
  return `${Math.round(value).toLocaleString("ru-RU")} ${RESTAURANT.currency}`;
}
