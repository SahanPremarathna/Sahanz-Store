import ShopProductCard from "./ShopProductCard";

export default function ForYouSection({
  addToCart,
  forYouPageIndex,
  forYouPages,
  formatMoney,
  hasActiveSearch,
  isCategoryPage,
  onNext,
  onPrevious,
  onRecordProductInteraction
}) {
  if (isCategoryPage) {
    return null;
  }

  return (
    <section className={`catalog-section for-you-panel ${hasActiveSearch ? "for-you-panel-after-search" : ""}`}>
      {forYouPages.length ? (
        <div className="for-you-carousel">
          <button
            aria-label="Previous recommendations"
            className="for-you-arrow for-you-arrow-left"
            onClick={onPrevious}
            type="button"
          >
            &#8249;
          </button>
          <div className="for-you-viewport">
            <div
              className="for-you-track"
              style={{ transform: `translateX(-${forYouPageIndex * 100}%)` }}
            >
              {forYouPages.map((group, groupIndex) => (
                <div className="product-grid for-you-grid" key={`for-you-group-${groupIndex}`}>
                  {group.map((product) => (
                    <ShopProductCard
                      addToCart={addToCart}
                      className="featured-product-card"
                      formatMoney={formatMoney}
                      key={`for-you-${groupIndex}-${product.id}`}
                      onRecordProductInteraction={onRecordProductInteraction}
                      product={product}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <button
            aria-label="Next recommendations"
            className="for-you-arrow for-you-arrow-right"
            onClick={onNext}
            type="button"
          >
            &#8250;
          </button>
        </div>
      ) : (
        <p className="muted">
          No products are available yet.
        </p>
      )}
    </section>
  );
}
