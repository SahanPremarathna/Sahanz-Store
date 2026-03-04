import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const NotificationContext = createContext(null);

function createToast(message, type = "info", title = "") {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    message,
    type,
    title
  };
}

function normalizeModalAction(action, dismissModal) {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label: action.label,
    variant: action.variant || "ghost",
    onClick: () => {
      action.onClick?.();

      if (action.closeOnClick !== false) {
        dismissModal();
      }
    }
  };
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [modal, setModal] = useState(null);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const dismissModal = useCallback(() => {
    setModal(null);
  }, []);

  const notify = useCallback(
    ({ message, type = "info", title = "" }) => {
      const nextToast = createToast(message, type, title);
      setToasts((current) => [...current, nextToast]);

      window.setTimeout(() => {
        dismissToast(nextToast.id);
      }, 2800);
    },
    [dismissToast]
  );

  const showModal = useCallback(
    ({ message, type = "info", title = "", actions, illustration = null }) => {
      const resolvedActions =
        actions?.length
          ? actions.map((action) => normalizeModalAction(action, dismissModal))
          : [
              normalizeModalAction(
                {
                  label: "OK",
                  variant: "primary"
                },
                dismissModal
              )
            ];

      setModal({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message,
        type,
        title,
        actions: resolvedActions,
        illustration
      });
    },
    [dismissModal]
  );

  const value = useMemo(
    () => ({
      toasts,
      modal,
      dismissToast,
      dismissModal,
      notify,
      showModal,
      success: (message, title = "Success") =>
        notify({ message, title, type: "success" }),
      error: (message, title = "Error") =>
        notify({ message, title, type: "error" }),
      info: (message, title = "Info") =>
        notify({ message, title, type: "info" }),
      warning: (message, title = "Attention") =>
        notify({ message, title, type: "warning" }),
      modalSuccess: (message, title = "Success", actions, illustration) =>
        showModal({ message, title, type: "success", actions, illustration }),
      modalError: (message, title = "Error", actions, illustration) =>
        showModal({ message, title, type: "error", actions, illustration }),
      modalInfo: (message, title = "Info", actions, illustration) =>
        showModal({ message, title, type: "info", actions, illustration }),
      modalWarning: (message, title = "Attention", actions, illustration) =>
        showModal({ message, title, type: "warning", actions, illustration })
    }),
    [dismissModal, dismissToast, modal, notify, showModal, toasts]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function NotificationViewport() {
  const context = useNotifications();

  useEffect(() => {
    function handleEscape(event) {
      if (event.key === "Escape") {
        if (context.modal) {
          context.dismissModal();
          return;
        }

        if (context.toasts.length) {
          context.dismissToast(context.toasts[0].id);
        }
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [context]);

  return (
    <>
      <div className="toast-stack" aria-live="polite" aria-atomic="true">
        {context.toasts.map((notification) => (
          <article
            key={notification.id}
            className={`toast toast-${notification.type}`}
            role="status"
          >
            <div className="toast-copy">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
            <button
              aria-label="Dismiss notification"
              className="toast-dismiss"
              onClick={() => context.dismissToast(notification.id)}
              type="button"
            >
              x
            </button>
          </article>
        ))}
      </div>

      {context.modal ? (
        <div className="notice-overlay" role="presentation">
          <section
            aria-labelledby="main-notice-title"
            aria-modal="true"
            className={`notice-modal notice-${context.modal.type}`}
            role="dialog"
          >
            {context.modal.illustration ? (
              <div aria-hidden="true" className="notice-illustration">
                {context.modal.illustration}
              </div>
            ) : null}
            <div className="toast-copy">
              <strong id="main-notice-title">{context.modal.title}</strong>
              <p>{context.modal.message}</p>
            </div>
            <div className="notice-actions">
              {context.modal.actions.map((action) => (
                <button
                  key={action.id}
                  className={action.variant === "primary" ? "primary-button" : "ghost-button"}
                  onClick={action.onClick}
                  type="button"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }

  return context;
}
