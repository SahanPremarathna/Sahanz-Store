import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Navigation from "../../components/Navigation";
import { useAuth } from "../../auth/AuthContext";
import PageTransition from "../../components/PageTransition";
import SiteFooter from "../../components/SiteFooter";
import {
  deleteSellerProduct,
  getCategories,
  getSellerProducts,
  updateSellerProduct
} from "../../api/client";
import { useNotifications } from "../../notifications/NotificationContext";

function createFormState(product) {
  return {
    categoryId: product?.categoryId || "",
    title: product?.title || "",
    description: product?.description || "",
    price: product ? (product.priceCents / 100).toFixed(2) : "0.00",
    inventoryCount: product ? String(product.inventoryCount) : "0",
    imageUrl: product?.imageUrl || "",
    galleryImages: Array.isArray(product?.galleryImages)
      ? product.galleryImages.join("\n")
      : ""
  };
}

function parseGalleryImages(value) {
  return value
    .split(/\r?\n/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function EditSellerProductPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const notifications = useNotifications();
  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState(null);
  const [form, setForm] = useState(createFormState(null));
  const [statusMessage, setStatusMessage] = useState("Loading listing...");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    let isMounted = true;

    Promise.all([getCategories(), getSellerProducts(token)])
      .then(([categoryData, productData]) => {
        if (!isMounted) {
          return;
        }

        const matchedProduct = productData.find((entry) => entry.id === productId) || null;
        setCategories(categoryData);
        setProduct(matchedProduct);
        setForm(createFormState(matchedProduct));
        setStatusMessage(matchedProduct ? "" : "Listing not found.");
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setStatusMessage(`Failed to load listing: ${error.message}`);
        notifications.error(error.message, "Listing load failed");
      });

    return () => {
      isMounted = false;
    };
  }, [notifications, productId, token, user]);

  function updateField(key, value) {
    setForm((current) => ({
      ...current,
      [key]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      const updated = await updateSellerProduct(
        productId,
        {
          categoryId: form.categoryId,
          title: form.title,
          description: form.description,
          priceCents: Math.round(Number(form.price) * 100),
          inventoryCount: Number(form.inventoryCount),
          imageUrl: form.imageUrl,
          galleryImages: parseGalleryImages(form.galleryImages)
        },
        token
      );
      setProduct(updated);
      setForm(createFormState(updated));
      setStatusMessage("Listing updated.");
      notifications.modalSuccess(
        `${updated.title} was updated successfully.`,
        "Listing updated"
      );
    } catch (error) {
      setStatusMessage(`Failed to update listing: ${error.message}`);
      notifications.modalError(error.message, "Listing update failed");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!product) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSellerProduct(product.id, token);
      notifications.modalSuccess(
        `${product.title} was removed from your live listings.`,
        "Listing deleted"
      );
      navigate("/seller/listings", { replace: true });
    } catch (error) {
      notifications.modalError(error.message, "Listing delete failed");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="page-card">
          <div className="section-heading">
            <div>
              <span className="eyebrow">Listing</span>
              <h2>{product ? `Edit ${product.title}` : "Edit listing"}</h2>
            </div>
            <Link className="ghost-link" to="/seller/listings">
              Back to all listings
            </Link>
          </div>
          {statusMessage ? <p className="muted">{statusMessage}</p> : null}
          {product ? (
            <form className="stack form-grid profile-form" onSubmit={handleSubmit}>
              <label>
                Category
                <select
                  onChange={(event) => updateField("categoryId", event.target.value)}
                  value={form.categoryId}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Product title
                <input
                  onChange={(event) => updateField("title", event.target.value)}
                  value={form.title}
                />
              </label>
              <label>
                Description
                <textarea
                  onChange={(event) => updateField("description", event.target.value)}
                  rows="4"
                  value={form.description}
                />
              </label>
              <label>
                Price (LKR)
                <input
                  min="0"
                  onChange={(event) => updateField("price", event.target.value)}
                  step="0.01"
                  type="number"
                  value={form.price}
                />
              </label>
              <label>
                Stock count
                <input
                  min="0"
                  onChange={(event) => updateField("inventoryCount", event.target.value)}
                  type="number"
                  value={form.inventoryCount}
                />
              </label>
              <label>
                Image URL
                <input
                  onChange={(event) => updateField("imageUrl", event.target.value)}
                  placeholder="Main product image"
                  value={form.imageUrl}
                />
              </label>
              <label>
                Gallery image URLs
                <textarea
                  onChange={(event) => updateField("galleryImages", event.target.value)}
                  placeholder={"One image URL per line"}
                  rows="5"
                  value={form.galleryImages}
                />
              </label>
              <div className="profile-actions listing-editor-actions">
                <button
                  className={`primary-button ${isSaving ? "is-loading" : ""}`}
                  disabled={isSaving}
                  type="submit"
                >
                  {isSaving ? "Saving..." : "Save changes"}
                </button>
                <button
                  className="ghost-button danger-button"
                  disabled={isDeleting}
                  onClick={handleDelete}
                  type="button"
                >
                  {isDeleting ? "Deleting..." : "Delete listing"}
                </button>
              </div>
            </form>
          ) : null}
        </section>
        <SiteFooter />
      </PageTransition>
    </div>
  );
}
