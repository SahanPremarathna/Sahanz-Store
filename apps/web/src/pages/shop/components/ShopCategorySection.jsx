import ShopProductCard from "./ShopProductCard";

export default function ShopCategorySection({
  addToCart,
  category,
  categoryPreviewRows,
  filters,
  formatMoney,
  hasActiveSearch,
  isCategoryPage,
  onRecordProductInteraction,
  onShowFullCategory,
  productsPerRow,
  setCategoryRef
}) {
  const visibleProducts = category.products.slice(
    0,
    isCategoryPage || filters.category
      ? category.products.length
      : productsPerRow * categoryPreviewRows
  );
  const hasSeeMore =
    !isCategoryPage &&
    !filters.category &&
    category.products.length > productsPerRow * categoryPreviewRows;

  return (
    <section
      className="catalog-section"
      ref={(element) => {
        setCategoryRef(category.slug, element);
      }}
    >
      <div className="section-heading compact">
        <h3>{category.name}</h3>
        <span className="muted">{category.products.length} listings</span>
      </div>
      <div className={`product-grid ${hasActiveSearch ? "search-results-grid" : ""}`}>
        {visibleProducts.map((product) => (
          <ShopProductCard
            addToCart={addToCart}
            formatMoney={formatMoney}
            key={product.id}
            onRecordProductInteraction={onRecordProductInteraction}
            product={product}
            showSeller
          />
        ))}
      </div>
      {hasSeeMore ? (
        <div className="category-section-actions">
          <button
            className="see-more-button"
            onClick={() => onShowFullCategory(category)}
            type="button"
          >
            See more...
          </button>
        </div>
      ) : null}
    </section>
  );
}
