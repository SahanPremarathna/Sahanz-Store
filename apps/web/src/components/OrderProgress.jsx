function getProgressSteps(order, role) {
  const currentStepKey = (() => {
    if (order.status === "delivered" || order.deliveryStatus === "delivered") {
      return "delivered";
    }

    if (order.deliveryStatus === "in_transit" || order.status === "out_for_delivery") {
      return "out_for_delivery";
    }

    if (order.deliveryStatus === "picked_up") {
      return "handed_to_delivery";
    }

    if (order.deliveryStatus === "assigned") {
      return "handed_from_seller";
    }

    if (order.status === "processing") {
      return "seller_preparing";
    }

    return "waiting_confirmation";
  })();

  if (role === "seller") {
    return {
      currentStepKey,
      steps: [
        {
          key: "waiting_confirmation",
          title: "Order received",
          description: "A customer placed the order and it is waiting for seller confirmation."
        },
        {
          key: "seller_preparing",
          title: "Preparing order",
          description: "The seller is packing and preparing the items."
        },
        {
          key: "handed_from_seller",
          title: "Rider assigned",
          description: "A delivery rider is assigned and ready for pickup."
        },
        {
          key: "handed_to_delivery",
          title: "Order handed off",
          description: "The seller handed the order to the rider."
        },
        {
          key: "out_for_delivery",
          title: "Delivery running",
          description: "The order is on the way to the customer."
        },
        {
          key: "delivered",
          title: "Completed",
          description: "The order was delivered successfully."
        }
      ]
    };
  }

  if (role === "delivery") {
    return {
      currentStepKey,
      steps: [
        {
          key: "waiting_confirmation",
          title: "Waiting for seller",
          description: "The seller has not confirmed handoff readiness yet."
        },
        {
          key: "seller_preparing",
          title: "Seller preparing",
          description: "The order is still being prepared before pickup."
        },
        {
          key: "handed_from_seller",
          title: "Pickup assigned",
          description: "The rider is assigned and should head to the seller."
        },
        {
          key: "handed_to_delivery",
          title: "Picked up",
          description: "The rider has collected the order from the seller."
        },
        {
          key: "out_for_delivery",
          title: "Out for delivery",
          description: "The rider is travelling to the customer."
        },
        {
          key: "delivered",
          title: "Delivered",
          description: "The order reached the customer."
        }
      ]
    };
  }

  return {
    currentStepKey,
    steps: [
      {
        key: "waiting_confirmation",
        title: "Waiting for seller confirmation",
        description: "The order was placed and is waiting for the seller to accept it."
      },
      {
        key: "seller_preparing",
        title: "Seller preparing the order",
        description: "The seller is collecting and preparing your items."
      },
      {
        key: "handed_from_seller",
        title: "Handed from the seller",
        description: "The order is ready and has been handed off from the seller side."
      },
      {
        key: "handed_to_delivery",
        title: "Handed to delivery",
        description: "A delivery rider has picked up the order."
      },
      {
        key: "out_for_delivery",
        title: "Currently out for delivery",
        description: "The rider is on the way to your location."
      },
      {
        key: "delivered",
        title: "Delivered",
        description: "The order has been delivered."
      }
    ]
  };
}

export default function OrderProgress({ order, role = "customer", compact = false }) {
  const { currentStepKey, steps } = getProgressSteps(order, role);
  const currentIndex = steps.findIndex((step) => step.key === currentStepKey);

  return (
    <div className={`order-progress ${compact ? "compact" : ""}`}>
      {steps.map((step, index) => {
        const state =
          index < currentIndex ? "complete" : index === currentIndex ? "current" : "upcoming";

        return (
          <article className={`progress-step ${state}`} key={step.key}>
            <div className="progress-marker">
              <span>{index + 1}</span>
            </div>
            <div className="progress-copy">
              <strong>{step.title}</strong>
              {!compact ? <p>{step.description}</p> : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
