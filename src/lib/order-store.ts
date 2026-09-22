import "server-only";
import type { Attribution } from "./analytics";

/**
 * Order persistence.
 *
 * ⚠️ THE DEFAULT IMPLEMENTATION IS IN-MEMORY AND IS NOT PRODUCTION-SAFE.
 *
 * On Vercel/Lambda-style hosting each request may hit a different instance and
 * memory is wiped on cold start, so an order created by one request may be
 * invisible to the verification request that follows. That means a real buyer
 * could pay and then be told the order was not found.
 *
 * Before taking real payments, replace `store` with a real database
 * (Postgres/Supabase/Mongo/Upstash Redis). The `OrderStore` interface below is
 * intentionally tiny so swapping it is a contained change — see DEPLOYMENT.md.
 */

export type OrderStatus = "created" | "paid" | "failed";

export interface OrderRecord {
  orderId: string;
  amount: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
  paidAt?: string;
  paymentId?: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  attribution?: Attribution;
  notes?: Record<string, string>;
}

export interface OrderStore {
  create(record: OrderRecord): Promise<void>;
  get(orderId: string): Promise<OrderRecord | null>;
  markPaid(orderId: string, paymentId: string): Promise<OrderRecord | null>;
  markFailed(orderId: string, reason?: string): Promise<void>;
}

const memory = new Map<string, OrderRecord>();

const inMemoryStore: OrderStore = {
  async create(record) {
    memory.set(record.orderId, record);
  },
  async get(orderId) {
    return memory.get(orderId) ?? null;
  },
  async markPaid(orderId, paymentId) {
    const existing = memory.get(orderId);
    if (!existing) return null;

    // IDEMPOTENT. Razorpay retries webhooks until it receives a 2xx, so this
    // runs more than once for a single payment — and the browser verify call
    // hits it too. Re-applying the write would move `paidAt` forward on every
    // retry and, worse, let a later event overwrite the original paymentId.
    // An already-paid order is therefore returned unchanged.
    if (existing.status === "paid") {
      if (existing.paymentId && existing.paymentId !== paymentId) {
        // Two different payments against one order: never silently overwrite.
        console.warn(
          "[order-store] markPaid called with a different paymentId for an " +
            "already-paid order; keeping the original.",
          { orderId, existing: existing.paymentId, incoming: paymentId }
        );
      }
      return existing;
    }

    const updated: OrderRecord = {
      ...existing,
      status: "paid",
      paymentId,
      paidAt: new Date().toISOString(),
    };
    memory.set(orderId, updated);
    return updated;
  },
  async markFailed(orderId, reason) {
    const existing = memory.get(orderId);
    if (!existing) return;

    // A paid order is terminal. Razorpay can deliver a `payment.failed` for an
    // earlier declined attempt AFTER a later attempt on the same order
    // succeeded; letting that downgrade the record would deny access to
    // someone who actually paid. Record the reason, keep the paid status.
    if (existing.status === "paid") {
      console.warn("[order-store] markFailed on an already-paid order; keeping paid.", {
        orderId,
        reason,
      });
      memory.set(orderId, {
        ...existing,
        notes: { ...(existing.notes || {}), lateFailureEvent: reason || "unknown" },
      });
      return;
    }

    memory.set(orderId, {
      ...existing,
      status: "failed",
      notes: { ...(existing.notes || {}), failureReason: reason || "unknown" },
    });
  },
};

export const store: OrderStore = inMemoryStore;

/**
 * Verification must not hard-fail simply because an in-memory record was lost
 * to a cold start: the Razorpay signature is the real proof of payment. This
 * flag lets the verify route treat a missing record as non-fatal while still
 * logging it loudly for the operator.
 */
export const STORE_IS_EPHEMERAL = store === inMemoryStore;
