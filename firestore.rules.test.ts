/**
 * FOODOO Pilot V1 — Security Rules Verification & Dirty Dozen Payload Suite
 * Verifies that all 12 adversarial payloads described in security_spec.md
 * are rejected with PERMISSION_DENIED by firestore.rules.
 */

export interface AdversarialTestCase {
  id: number;
  name: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: {
    uid: string;
    email: string;
    email_verified: boolean;
  } | null;
  payload?: Record<string, unknown>;
  expectedOutcome: 'PERMISSION_DENIED';
  enforcedByRuleGate: string;
}

export const DIRTY_DOZEN_SECURITY_TESTS: AdversarialTestCase[] = [
  {
    id: 1,
    name: 'Shadow Field Injection on Order (isVerified: true)',
    collectionPath: '/orders/ord-shadow-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'ord-shadow-1',
      orderNumber: 'FD-1001',
      customerId: 'user-1',
      isVerified: true
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'isValidOrder(data) -> data.keys().hasOnly([...])'
  },
  {
    id: 2,
    name: 'Identity Spoofing on Order Creation (customerId != request.auth.uid)',
    collectionPath: '/orders/ord-spoof-2',
    operation: 'create',
    auth: { uid: 'attacker-1', email: 'attacker@example.com', email_verified: true },
    payload: {
      id: 'ord-spoof-2',
      customerId: 'victim-uid',
      status: 'pending'
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'incoming().customerId == request.auth.uid'
  },
  {
    id: 3,
    name: 'Unverified Admin Email Spoofing (email_verified == false)',
    collectionPath: '/businesses/foodoo-restaurant',
    operation: 'update',
    auth: { uid: 'spoof-admin', email: 'alnatour.m@gmail.com', email_verified: false },
    payload: {
      isOpen: false
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'isVerifiedUser() -> request.auth.token.email_verified == true'
  },
  {
    id: 4,
    name: 'PII Blanket Read on /user_private/victim-uid by non-owner',
    collectionPath: '/user_private/victim-uid',
    operation: 'get',
    auth: { uid: 'attacker-uid', email: 'attacker@example.com', email_verified: true },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'request.auth.uid == userId || isAdmin()'
  },
  {
    id: 5,
    name: 'Cross-Business Menu Tampering (Restaurant Manager editing Cafe product)',
    collectionPath: '/products/cafe-latte-1',
    operation: 'update',
    auth: { uid: 'restaurant-mgr', email: 'mgr@example.com', email_verified: true },
    payload: {
      businessId: 'foodoo-cafe',
      priceSar: 1
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'isAssignedMerchant(existing().businessId)'
  },
  {
    id: 6,
    name: 'Order State Shortcutting (pending directly to completed)',
    collectionPath: '/orders/ord-shortcut-6',
    operation: 'update',
    auth: { uid: 'restaurant-mgr', email: 'mgr@example.com', email_verified: true },
    payload: {
      status: 'completed',
      squadPointAwarded: true
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: "existing().status == 'ready' && incoming().status == 'completed'"
  },
  {
    id: 7,
    name: 'Terminal State Mutation (completed order mutated to cancelled)',
    collectionPath: '/orders/ord-terminal-7',
    operation: 'update',
    auth: { uid: 'restaurant-mgr', email: 'mgr@example.com', email_verified: true },
    payload: {
      status: 'cancelled'
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: "!(existing().status in ['completed', 'cancelled'])"
  },
  {
    id: 8,
    name: 'ID Poisoning Attack (invalid characters & oversized ID)',
    collectionPath: '/squads/invalid$id!@#',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      id: 'invalid$id!@#'
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: "isValidId(squadId) -> id.matches('^[a-zA-Z0-9_\\\\-]+$')"
  },
  {
    id: 9,
    name: 'Denial-of-Wallet Oversized String on Order Notes (>400 chars)',
    collectionPath: '/orders/ord-dow-9',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      notes: 'X'.repeat(1000)
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'data.notes is string && data.notes.size() <= 400'
  },
  {
    id: 10,
    name: 'Unbounded Array Injection on Order itemsSummary (>20 items)',
    collectionPath: '/orders/ord-arr-10',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      itemsSummary: Array.from({ length: 25 }, (_, i) => `Item ${i}`)
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'data.itemsSummary is list && data.itemsSummary.size() <= 20'
  },
  {
    id: 11,
    name: 'Client Timestamp Forgery on Order Creation (createdAt != request.time)',
    collectionPath: '/orders/ord-time-11',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      createdAt: '2020-01-01T00:00:00Z'
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'incoming().createdAt == request.time'
  },
  {
    id: 12,
    name: 'Orphan Squad Member Creation (non-existent parent Squad)',
    collectionPath: '/squads/non-existent-squad/members/user-1',
    operation: 'create',
    auth: { uid: 'user-1', email: 'user1@example.com', email_verified: true },
    payload: {
      userId: 'user-1',
      squadId: 'non-existent-squad',
      role: 'member'
    },
    expectedOutcome: 'PERMISSION_DENIED',
    enforcedByRuleGate: 'exists(/databases/$(database)/documents/squads/$(squadId))'
  }
];
