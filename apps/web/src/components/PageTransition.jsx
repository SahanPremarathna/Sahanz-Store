export default function PageTransition({ children, className = "" }) {
  return <div className={`page-transition ${className}`.trim()}>{children}</div>;
}
