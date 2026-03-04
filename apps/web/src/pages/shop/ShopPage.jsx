import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import CartDrawer from "../../components/CartDrawer";
import FloatingCartButton from "../../components/FloatingCartButton";
import Navigation from "../../components/Navigation";
import PageTransition from "../../components/PageTransition";
import SmartImage from "../../components/SmartImage";
import { useShop } from "../../shop/ShopContext";

function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

const PRODUCT_MIN_WIDTH = 236;
const INITIAL_ROWS = 6;
const PRELOAD_ROWS = 5;
const BATCH_ROWS = 3;
const CATEGORY_PREVIEW_ROWS = 2;
const FOR_YOU_LIMIT = 4;
const FOR_YOU_FALLBACK_LIMIT = 4;
const INTERACTION_STORAGE_KEY = "sahanz-store-interactions";
const HERO_SCENES = [
  {
    headline: "Shop what matters.",
    imageUrl:
      "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80"
  },
  {
    headline: "Find Daily Essentials.",
    imageUrl:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1600&q=80"
  },
  {
    headline: "Everything You Need.",
    imageUrl:
      "https://images.unsplash.com/photo-1579113800032-c38bd7635818?auto=format&fit=crop&w=1600&q=80"
  },
  {
    headline: "Better Shopping Faster.",
    imageUrl:
      "https://images.unsplash.com/photo-1604719312566-8912e9c8a213?auto=format&fit=crop&w=1600&q=80"
  }
];

function limitCatalog(categories, maxProducts) {
  let remaining = maxProducts;

  return categories
    .map((category) => {
      if (remaining <= 0) {
        return null;
      }

      const products = category.products.slice(0, remaining);
      remaining -= products.length;

      return products.length
        ? {
            ...category,
            products
          }
        : null;
    })
    .filter(Boolean);
}

function loadInteractionStore() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(INTERACTION_STORAGE_KEY) || "{}");
  } catch (_error) {
    return {};
  }
}

function saveInteractionStore(store) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(store));
}

function buildInteractionKey(userId) {
  return userId || "guest";
}

function sortProductsForYou(products, interactionState) {
  const searches = interactionState?.searches || {};
  const productInteractions = interactionState?.products || {};
  const activeSearchTerms = Object.keys(searches)
    .sort((left, right) => (searches[right]?.lastAt || 0) - (searches[left]?.lastAt || 0))
    .slice(0, 8);

  return products
    .map((product) => {
      const productState = productInteractions[product.slug] || {};
      const productText = `${product.name} ${product.description} ${product.categoryName || ""}`.toLowerCase();
      const searchBoost = activeSearchTerms.reduce((sum, term) => {
        if (!term || !productText.includes(term)) {
          return sum;
        }

        return sum + (searches[term]?.count || 0) * 3;
      }, 0);
      const score =
        (productState.views || 0) * 3 +
        (productState.adds || 0) * 5 +
        (productState.searchHits || 0) * 2 +
        searchBoost;

      return {
        ...product,
        score,
        lastAt: productState.lastAt || 0
      };
    })
    .filter((product) => product.score > 0)
    .sort((left, right) => right.score - left.score || right.lastAt - left.lastAt)
    .slice(0, FOR_YOU_LIMIT);
}

function pickRandomProducts(products, count) {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

function fillProducts(products, preferredProducts, targetCount) {
  const selected = preferredProducts.slice(0, targetCount);
  const selectedIds = new Set(selected.map((product) => product.id));
  const remainingProducts = products.filter((product) => !selectedIds.has(product.id));
  const preferredCategories = preferredProducts.map((product) => product.categorySlug);
  const sameCategoryProducts = remainingProducts.filter((product) =>
    preferredCategories.includes(product.categorySlug)
  );
  const otherProducts = remainingProducts.filter(
    (product) => !preferredCategories.includes(product.categorySlug)
  );

  if (selected.length >= targetCount) {
    return selected;
  }

  const sameCategoryFill = sameCategoryProducts.slice(0, targetCount - selected.length);

  if (selected.length + sameCategoryFill.length >= targetCount) {
    return [...selected, ...sameCategoryFill];
  }

  return [
    ...selected,
    ...sameCategoryFill,
    ...pickRandomProducts(
      otherProducts,
      targetCount - selected.length - sameCategoryFill.length
    )
  ];
}

function buildForYouProductQueue(products, preferredProducts) {
  const firstGroup = fillProducts(products, preferredProducts, FOR_YOU_LIMIT);
  const selectedIds = new Set(firstGroup.map((product) => product.id));
  const remainingProducts = products.filter((product) => !selectedIds.has(product.id));
  const preferredCategories = new Set(
    (preferredProducts.length ? preferredProducts : firstGroup)
      .map((product) => product.categorySlug)
      .filter(Boolean)
  );

  const sameCategoryProducts = remainingProducts.filter((product) =>
    preferredCategories.has(product.categorySlug)
  );
  const otherProducts = remainingProducts.filter(
    (product) => !preferredCategories.has(product.categorySlug)
  );

  return [...firstGroup, ...sameCategoryProducts, ...otherProducts];
}

function chunkProducts(products, chunkSize) {
  const chunks = [];

  for (let index = 0; index < products.length; index += chunkSize) {
    const group = products.slice(index, index + chunkSize);

    if (group.length) {
      chunks.push(group);
    }
  }

  return chunks;
}

export default function ShopPage() {
  const navigate = useNavigate();
  const { categorySlug } = useParams();
  const { user } = useAuth();
  const {
    addToCart,
    catalog,
    catalogState,
    filters,
    updateFilters,
    visibleCatalog
  } = useShop();
  const [productsPerRow, setProductsPerRow] = useState(4);
  const [renderedCount, setRenderedCount] = useState(INITIAL_ROWS * 4);
  const [interactionState, setInteractionState] = useState({});
  const [forYouPageIndex, setForYouPageIndex] = useState(0);
  const [heroHeadlineIndex, setHeroHeadlineIndex] = useState(0);
  const catalogCardRef = useRef(null);
  const loadMoreRef = useRef(null);
  const categorySectionRefs = useRef({});
  const lastRouteCategoryRef = useRef(null);
  const isCategoryPage = Boolean(categorySlug);
  const totalVisibleProducts = visibleCatalog.reduce(
    (sum, category) => sum + category.products.length,
    0
  );
  const renderedCatalog = useMemo(
    () => limitCatalog(visibleCatalog, renderedCount),
    [renderedCount, visibleCatalog]
  );
  const normalizedSearchTerm = filters.searchTerm.trim();
  const hasActiveSearch = Boolean(normalizedSearchTerm);
  const hasEmptySearchResults =
    hasActiveSearch && !visibleCatalog.length && !catalogState;
  const hasMoreProducts = renderedCount < totalVisibleProducts;
  const allProducts = useMemo(
    () =>
      catalog.flatMap((category) =>
        category.products.map((product) => ({
          ...product,
          categoryName: category.name,
          categorySlug: category.slug
        }))
      ),
    [catalog]
  );
  const forYouProducts = useMemo(
    () => sortProductsForYou(allProducts, interactionState),
    [allProducts, interactionState]
  );
  const displayedForYouProducts = useMemo(
    () => fillProducts(allProducts, forYouProducts, FOR_YOU_LIMIT),
    [allProducts, forYouProducts]
  );
  const forYouProductQueue = useMemo(
    () => buildForYouProductQueue(allProducts, forYouProducts),
    [allProducts, forYouProducts]
  );
  const forYouPages = useMemo(
    () => chunkProducts(forYouProductQueue, FOR_YOU_LIMIT),
    [forYouProductQueue]
  );
  const activeCategory = catalog.find((category) => category.slug === categorySlug) || null;

  useEffect(() => {
    setForYouPageIndex(0);
  }, [forYouProductQueue]);

  useEffect(() => {
    if (forYouPages.length <= 1) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      startTransition(() => {
        setForYouPageIndex((current) => (current + 1) % forYouPages.length);
      });
    }, 5600);

    return () => {
      window.clearInterval(interval);
    };
  }, [forYouPages.length]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      startTransition(() => {
        setHeroHeadlineIndex((current) => (current + 1) % HERO_SCENES.length);
      });
    }, 4200);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const store = loadInteractionStore();
    setInteractionState(store[buildInteractionKey(user?.id)] || {});
  }, [user?.id]);

  useEffect(() => {
    if (categorySlug) {
      lastRouteCategoryRef.current = categorySlug;

      if (filters.category !== categorySlug) {
        updateFilters({ category: categorySlug });
      }

      return;
    }

    if (lastRouteCategoryRef.current && filters.category === lastRouteCategoryRef.current) {
      updateFilters({ category: "" });
    }

    lastRouteCategoryRef.current = null;
  }, [categorySlug, filters.category, updateFilters]);

  useEffect(() => {
    const element = catalogCardRef.current;

    if (!element || typeof ResizeObserver === "undefined") {
      return undefined;
    }

    const resizeObserver = new ResizeObserver(([entry]) => {
      const nextProductsPerRow = Math.max(
        1,
        Math.floor(entry.contentRect.width / PRODUCT_MIN_WIDTH)
      );
      setProductsPerRow(nextProductsPerRow);
    });

    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    setRenderedCount(Math.min(totalVisibleProducts, productsPerRow * INITIAL_ROWS));
  }, [productsPerRow, totalVisibleProducts, filters]);

  useEffect(() => {
    const normalizedSearch = filters.searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return;
    }

    const matchedProducts = allProducts.filter((product) =>
      `${product.name} ${product.description} ${product.sellerName}`
        .toLowerCase()
        .includes(normalizedSearch)
    );

    setInteractionState((current) => {
      const next = {
        searches: {
          ...(current.searches || {}),
          [normalizedSearch]: {
            count: (current.searches?.[normalizedSearch]?.count || 0) + 1,
            lastAt: Date.now()
          }
        },
        products: { ...(current.products || {}) }
      };

      matchedProducts.forEach((product) => {
        next.products[product.slug] = {
          ...(next.products[product.slug] || {}),
          searchHits: (next.products[product.slug]?.searchHits || 0) + 1,
          lastAt: Date.now()
        };
      });

      const store = loadInteractionStore();
      store[buildInteractionKey(user?.id)] = next;
      saveInteractionStore(store);
      return next;
    });
  }, [allProducts, filters.searchTerm, user?.id]);

  useEffect(() => {
    const sentinel = loadMoreRef.current;

    if (!sentinel || !hasMoreProducts || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        setRenderedCount((current) =>
          Math.min(totalVisibleProducts, current + productsPerRow * BATCH_ROWS)
        );
      },
      {
        rootMargin: `0px 0px ${PRELOAD_ROWS * 340}px 0px`
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [hasMoreProducts, productsPerRow, totalVisibleProducts]);

  function recordProductInteraction(product, type) {
    setInteractionState((current) => {
      const next = {
        searches: { ...(current.searches || {}) },
        products: {
          ...(current.products || {}),
          [product.slug]: {
            ...(current.products?.[product.slug] || {}),
            [type]:
              ((current.products?.[product.slug] || {})[type] || 0) + 1,
            lastAt: Date.now()
          }
        }
      };
      const store = loadInteractionStore();
      store[buildInteractionKey(user?.id)] = next;
      saveInteractionStore(store);
      return next;
    });
  }

  function openCategoryPage(slug) {
    navigate(`/categories/${slug}`);
  }

  function showFullCategory(category) {
    navigate(`/categories/${category.slug}`);
  }

  function showNextForYouPage() {
    if (!forYouPages.length) {
      return;
    }

    setForYouPageIndex((current) => (current + 1) % forYouPages.length);
  }

  function showPreviousForYouPage() {
    if (!forYouPages.length) {
      return;
    }

    setForYouPageIndex((current) => (current - 1 + forYouPages.length) % forYouPages.length);
  }

  function renderForYouSection() {
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
              onClick={showPreviousForYouPage}
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
                      <article key={`for-you-${groupIndex}-${product.id}`} className="product-card featured-product-card">
                        <Link
                          className="product-link"
                          onClick={() => recordProductInteraction(product, "views")}
                          to={`/products/${product.slug}`}
                        >
                          <SmartImage
                            alt={product.name}
                            className="product-image"
                            src={product.imageUrl}
                          />
                          <div className="product-meta">
                            <span className="muted">{product.categoryName}</span>
                            <h3>{product.name}</h3>
                            <p>{product.description}</p>
                          </div>
                        </Link>
                        <div className="product-footer">
                          <strong>{formatMoney(product.currency, product.priceCents)}</strong>
                          <span className="muted">Stock {product.inventoryCount}</span>
                        </div>
                        <button
                          aria-label={`Add ${product.name} to cart`}
                          className="quick-add-button"
                          onClick={() => {
                            recordProductInteraction(product, "adds");
                            addToCart(product, { openCart: true });
                          }}
                          type="button"
                        >
                          +
                        </button>
                      </article>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <button
              aria-label="Next recommendations"
              className="for-you-arrow for-you-arrow-right"
              onClick={showNextForYouPage}
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

  if (user?.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  if (user?.role === "delivery") {
    return <Navigate to="/delivery" replace />;
  }

  const activeHeroScene = HERO_SCENES[heroHeadlineIndex];

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        {!isCategoryPage ? (
          <section className="hero hero-showcase">
            <div
              className="hero-background-layer"
              key={activeHeroScene.imageUrl}
              style={{ backgroundImage: `url("${activeHeroScene.imageUrl}")` }}
            />
            <div className="hero-background-tint" />
            <div className="hero-lead">
              <span className="eyebrow">Customer storefront</span>
              <h1 className="hero-rotating-title" key={activeHeroScene.headline}>
                {activeHeroScene.headline.split(" ").map((word, index) => (
                  <span
                    className={`hero-word hero-word-${index + 1}`}
                    key={`${activeHeroScene.headline}-${word}-${index}`}
                  >
                    {word}
                  </span>
                ))}
              </h1>
              <p className="hero-copy">
                Everyday essentials, without the drag.
              </p>
            </div>
            <div className="hero-panel">
              <h2>Shop faster</h2>
              <ul className="feature-list">
                <li>Browse smarter with picks shaped by your activity</li>
                <li>Jump straight into the category you want</li>
                <li>Add fast and check out in seconds</li>
              </ul>
            </div>
          </section>
        ) : null}
        {!isCategoryPage && visibleCatalog.length ? (
          <div className="category-marquee-block">
            <Link className="all-categories-link" to="/categories">
              All categories
            </Link>
            <div className="category-marquee-shell">
              <div className="category-marquee-track">
                {[...visibleCatalog, ...visibleCatalog].map((category, index) => (
                  <button
                    className="category-chip"
                    key={`${category.slug}-${index}`}
                    onClick={() => openCategoryPage(category.slug)}
                    type="button"
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <section className="page-card" ref={catalogCardRef}>
          {!isCategoryPage && !hasEmptySearchResults ? (
            <div className="section-heading">
              <div>
                <span className="eyebrow">Catalog</span>
                <h2>
                  {filters.searchTerm || filters.category || filters.inStockOnly
                    ? "Filtered results"
                    : "Shop Anything You Wish"}
                </h2>
              </div>
              {catalogState ? <span className="muted">{catalogState}</span> : null}
            </div>
          ) : null}
          {!hasActiveSearch ? renderForYouSection() : null}
          {isCategoryPage ? (
            <div className="category-page-actions">
              <div className="category-page-heading">
                <span className="eyebrow">Category</span>
                <h2>{activeCategory ? activeCategory.name : "Category items"}</h2>
              </div>
              <Link className="ghost-link" to="/">
                Back to all categories
              </Link>
            </div>
          ) : null}
          {renderedCatalog.map((category) => (
            <section
              key={category.id}
              className="catalog-section"
              ref={(element) => {
                categorySectionRefs.current[category.slug] = element;
              }}
            >
              <div className="section-heading compact">
                <h3>{category.name}</h3>
                <span className="muted">{category.products.length} listings</span>
              </div>
              <div className={`product-grid ${hasActiveSearch ? "search-results-grid" : ""}`}>
                {category.products
                  .slice(
                    0,
                    isCategoryPage || filters.category
                      ? category.products.length
                      : productsPerRow * CATEGORY_PREVIEW_ROWS
                  )
                  .map((product) => (
                  <article key={product.id} className="product-card">
                    <Link
                      className="product-link"
                      onClick={() => recordProductInteraction(product, "views")}
                      to={`/products/${product.slug}`}
                    >
                      <SmartImage
                        alt={product.name}
                        className="product-image"
                        src={product.imageUrl}
                      />
                      <div className="product-meta">
                        <span className="muted">Seller: {product.sellerName}</span>
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                      </div>
                    </Link>
                    <div className="product-footer">
                      <strong>{formatMoney(product.currency, product.priceCents)}</strong>
                      <span className="muted">Stock {product.inventoryCount}</span>
                    </div>
                    <button
                      aria-label={`Add ${product.name} to cart`}
                      className="quick-add-button"
                      onClick={() => {
                        recordProductInteraction(product, "adds");
                        addToCart(product, { openCart: true });
                      }}
                      type="button"
                    >
                      +
                    </button>
                  </article>
                ))}
              </div>
              {!isCategoryPage && !filters.category && category.products.length > productsPerRow * CATEGORY_PREVIEW_ROWS ? (
                <div className="category-section-actions">
                  <button
                    className="see-more-button"
                    onClick={() => showFullCategory(category)}
                    type="button"
                  >
                    See more...
                  </button>
                </div>
              ) : null}
            </section>
          ))}
          {!visibleCatalog.length && !catalogState ? (
            hasActiveSearch ? (
              <p className="search-empty-state">
                No products related to "{normalizedSearchTerm}"
              </p>
            ) : (
              <p className="muted">
                No products matched the current search and filter combination.
              </p>
            )
          ) : null}
          {hasActiveSearch ? renderForYouSection() : null}
          {hasMoreProducts ? (
            <>
              <p className="catalog-loading-note muted">
                Loading more products as you scroll.
              </p>
              <div aria-hidden="true" className="catalog-load-trigger" ref={loadMoreRef} />
            </>
          ) : null}
          {!visibleCatalog.length && catalogState.startsWith("Loading") ? (
            <div className="loading-grid">
              {Array.from({ length: 6 }).map((_, index) => (
                <article className="product-card skeleton-card" key={`catalog-skeleton-${index}`}>
                  <div className="skeleton-block skeleton-image" />
                  <div className="skeleton-block skeleton-line short" />
                  <div className="skeleton-block skeleton-line" />
                  <div className="skeleton-block skeleton-line medium" />
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </PageTransition>
      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
}
