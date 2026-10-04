export default function QtyControl({ qty, onChange, name }) {
  return (
    <div className="qty" role="group" aria-label={`Quantity of ${name}`}>
      <button type="button" onClick={() => onChange(qty - 1)} aria-label={`Remove one ${name}`}>−</button>
      <span aria-live="polite">{qty}</span>
      <button type="button" onClick={() => onChange(qty + 1)} aria-label={`Add one ${name}`} disabled={qty >= 50}>+</button>
    </div>
  );
}
