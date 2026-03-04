import {
  FOR_YOU_LIMIT,
  INTERACTION_STORAGE_KEY
} from "./shopPage.constants";

export function formatMoney(currency, cents) {
  return `${currency} ${(cents / 100).toFixed(2)}`;
}

export function limitCatalog(categories, maxProducts) {
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

export function loadInteractionStore() {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(INTERACTION_STORAGE_KEY) || "{}");
  } catch (_error) {
    return {};
  }
}

export function saveInteractionStore(store) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INTERACTION_STORAGE_KEY, JSON.stringify(store));
}

export function buildInteractionKey(userId) {
  return userId || "guest";
}

export function sortProductsForYou(products, interactionState) {
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

export function pickRandomProducts(products, count) {
  const shuffled = [...products];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export function fillProducts(products, preferredProducts, targetCount) {
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

export function buildForYouProductQueue(products, preferredProducts) {
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

export function chunkProducts(products, chunkSize) {
  const chunks = [];

  for (let index = 0; index < products.length; index += chunkSize) {
    const group = products.slice(index, index + chunkSize);

    if (group.length) {
      chunks.push(group);
    }
  }

  return chunks;
}
