"use client";

import { useStore } from "./Providers";

export function ProductActions({
  productId,
  productName,
}: {
  productId: string;
  productName: string;
}) {
  const { addToCart, toggleWishlist, wishlist, openCart } = useStore();
  const wished = wishlist.includes(productId);

  return (
    <div className="pdp-actions">
      <button
        className="btn btn-solid"
        type="button"
        onClick={() => {
          addToCart(productId);
          openCart();
        }}
      >
        Add to Bag
      </button>
      <button
        className="btn"
        type="button"
        onClick={() => toggleWishlist(productId, productName)}
        aria-pressed={wished}
      >
        {wished ? "♥ In Wishlist" : "♡ Wishlist"}
      </button>
    </div>
  );
}
