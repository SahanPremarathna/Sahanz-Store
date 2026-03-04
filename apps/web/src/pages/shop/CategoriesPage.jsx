import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import Navigation from "../../components/Navigation";
import PageTransition from "../../components/PageTransition";
import { useShop } from "../../shop/ShopContext";

export default function CategoriesPage() {
  const { user } = useAuth();
  const { catalog, catalogState } = useShop();

  if (user?.role === "seller") {
    return <Navigate to="/seller" replace />;
  }

  if (user?.role === "delivery") {
    return <Navigate to="/delivery" replace />;
  }

  return (
    <div className="layout">
      <PageTransition className="page-shell">
        <Navigation />
        <section className="page-card categories-tree-page">
          <div className="categories-tree-header">
            <span className="eyebrow">Browse</span>
            <h1>All Categories</h1>
            <p className="muted">Pick a branch and jump straight into that section.</p>
          </div>

          {catalogState && !catalog.length ? (
            <p className="muted">{catalogState}</p>
          ) : (
            <div className="categories-tree">
              <div className="categories-tree-root">Store</div>
              <ul className="categories-tree-list">
                {catalog.map((category) => (
                  <li className="categories-tree-item" key={category.id}>
                    <Link className="categories-tree-link" to={`/categories/${category.slug}`}>
                      <span>{category.name}</span>
                      <span className="muted">{category.products.length} items</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </PageTransition>
    </div>
  );
}
