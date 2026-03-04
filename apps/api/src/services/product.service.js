const store = require("../data/store");
const dbStore = require("../data/db-store");

function getDataSource() {
  return dbStore.isSupabaseConfigured() ? dbStore : store;
}

function groupCatalog(categories, products) {
  const productMap = new Map();

  for (const category of categories) {
    productMap.set(category.id, {
      id: category.id,
      name: category.name,
      slug: category.slug,
      products: []
    });
  }

  for (const product of products) {
    const category = productMap.get(product.category_id);

    if (!category) {
      continue;
    }

    category.products.push({
      id: product.id,
      sellerId: product.seller_id,
      sellerName: product.seller_name || product.sellerName,
      name: product.title,
      slug: product.slug,
      description: product.description,
      priceCents: product.price_cents,
      currency: product.currency,
      imageUrl: product.image_url,
      inventoryCount: product.inventory_count
    });
  }

  return Array.from(productMap.values()).filter(
    (category) => category.products.length > 0
  );
}

function toCatalogProduct(product) {
  return {
    id: product.id,
    seller_id: product.sellerId,
    seller_name: product.sellerName,
    category_id: product.categoryId,
    title: product.title,
    slug: product.slug,
    description: product.description,
    price_cents: product.priceCents,
    currency: product.currency,
    image_url: product.imageUrl,
    inventory_count: product.inventoryCount
  };
}

async function getCategories() {
  return getDataSource().listCategories().then((categories) =>
    categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    }))
  );
}

async function getCatalog() {
  const categories = (await getDataSource().listCategories()).map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug
  }));
  const products = (await getDataSource().listActiveSellerProducts()).map(
    toCatalogProduct
  );
  return groupCatalog(categories, products);
}

async function getSellerProducts(sellerId) {
  return getDataSource().listSellerProductsBySeller(sellerId).then((products) =>
    products.map((product) => ({
      id: product.id,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      categoryId: product.categoryId,
      title: product.title,
      slug: product.slug,
      description: product.description,
      priceCents: product.priceCents,
      currency: product.currency,
      imageUrl: product.imageUrl,
      inventoryCount: product.inventoryCount,
      isActive: product.isActive
    }))
  );
}

async function createSellerProduct(input) {
  if (!input.title?.trim()) {
    throw new Error("Title is required");
  }

  if (!input.categoryId) {
    throw new Error("Category is required");
  }

  if (!input.description?.trim()) {
    throw new Error("Description is required");
  }

  if (Number.isNaN(Number(input.priceCents)) || Number(input.priceCents) < 0) {
    throw new Error("Price must be valid");
  }

  if (
    Number.isNaN(Number(input.inventoryCount)) ||
    Number(input.inventoryCount) < 0
  ) {
    throw new Error("Inventory count must be valid");
  }

  const slug =
    input.slug ||
    input.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  return getDataSource().createSellerProduct({
    sellerId: input.sellerId,
    categoryId: input.categoryId,
    title: input.title,
    slug,
    description: input.description,
    priceCents: Number(input.priceCents),
    currency: input.currency || "LKR",
    imageUrl: input.imageUrl || "",
    inventoryCount: Number(input.inventoryCount)
  });
}

module.exports = {
  createSellerProduct,
  getCatalog,
  getCategories,
  getSellerProducts
};
