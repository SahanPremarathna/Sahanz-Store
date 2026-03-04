import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import CartDrawer from "../../components/CartDrawer";
import FloatingCartButton from "../../components/FloatingCartButton";
import Navigation from "../../components/Navigation";
import PageTransition from "../../components/PageTransition";
import SiteFooter from "../../components/SiteFooter";
import { useShop } from "../../shop/ShopContext";
import ForYouSection from "./components/ForYouSection";
import ShopCategorySection from "./components/ShopCategorySection";
import {
  BATCH_ROWS,
  CATEGORY_PREVIEW_ROWS,
  FOR_YOU_LIMIT,
  HERO_SCENES,
  INITIAL_ROWS,
  PRELOAD_ROWS,
  PRODUCT_MIN_WIDTH
} from "./shopPage.constants";
import {
  buildForYouProductQueue,
  buildInteractionKey,
  chunkProducts,
  formatMoney,
  limitCatalog,
  loadInteractionStore,
  saveInteractionStore,
  sortProductsForYou
} from "./shopPage.utils";

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
          {!hasActiveSearch ? (
            <ForYouSection
              addToCart={addToCart}
              forYouPageIndex={forYouPageIndex}
              forYouPages={forYouPages}
              formatMoney={formatMoney}
              hasActiveSearch={hasActiveSearch}
              isCategoryPage={isCategoryPage}
              onNext={showNextForYouPage}
              onPrevious={showPreviousForYouPage}
              onRecordProductInteraction={recordProductInteraction}
            />
          ) : null}
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
            <ShopCategorySection
              addToCart={addToCart}
              category={category}
              categoryPreviewRows={CATEGORY_PREVIEW_ROWS}
              filters={filters}
              formatMoney={formatMoney}
              hasActiveSearch={hasActiveSearch}
              isCategoryPage={isCategoryPage}
              key={category.id}
              onRecordProductInteraction={recordProductInteraction}
              onShowFullCategory={showFullCategory}
              productsPerRow={productsPerRow}
              setCategoryRef={(slug, element) => {
                categorySectionRefs.current[slug] = element;
              }}
            />
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
          {hasActiveSearch ? (
            <ForYouSection
              addToCart={addToCart}
              forYouPageIndex={forYouPageIndex}
              forYouPages={forYouPages}
              formatMoney={formatMoney}
              hasActiveSearch={hasActiveSearch}
              isCategoryPage={isCategoryPage}
              onNext={showNextForYouPage}
              onPrevious={showPreviousForYouPage}
              onRecordProductInteraction={recordProductInteraction}
            />
          ) : null}
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
        <SiteFooter />
      </PageTransition>
      <FloatingCartButton />
      <CartDrawer />
    </div>
  );
}
