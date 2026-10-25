# FOODOO Pilot V1 — Firestore Security Specification (Phase 0 & Phase 5 Audit)

## 1. Data Invariants

1. **Default-Deny Catch-All**: All paths not explicitly matched in `/databases/{database}/documents` are unconditionally denied (`allow read, write: if false;`).
2. **Verified Identity Mandate**: All write operations require `isSignedIn() && request.auth.token.email_verified == true`.
3. **Business Isolation**: Only two valid pilot businesses exist (`foodoo-restaurant` and `foodoo-cafe`). A merchant can only update a business, its products, or its orders if their `user_profiles/$(request.auth.uid).assignedBusinessId` matches that `businessId` (or if they are the verified bootstrapped admin `alnatour.m@gmail.com`).
4. **PII Isolation**: User contact details (`email`, `phone`, `defaultAddress`) live in `/user_private/{userId}`, readable and writable strictly by `request.auth.uid == userId`. Orders (`/orders/{orderId}`) are readable/listable ONLY by `resource.data.customerId == request.auth.uid`, `resource.data.merchantUid == request.auth.uid`, or `isAdmin()`.
5. **Strict Order State Machine & Terminal Locking**:
   - Orders must be created with `status == 'pending'` and `squadPointAwarded == false`.
   - Legal transitions:
     - `pending` -> `accepted` or `cancelled`
     - `accepted` -> `preparing` or `cancelled`
     - `preparing` -> `ready` or `cancelled`
     - `ready` -> `completed`
   - Once `existing().status in ['completed', 'cancelled']`, the order is in a terminal state and cannot be updated by non-admins.
6. **Master Gate for Squad Members**: `/squads/{squadId}/members/{memberId}` requires `exists(/databases/$(database)/documents/squads/$(squadId))` on read and write.
7. **Temporal Integrity**: Every `createdAt` on create and `updatedAt` on create/update must equal `request.time`.

## 2. The "Dirty Dozen" Payloads (Designed to Fail with PERMISSION_DENIED)

1. **Shadow Field Injection on Order (`isVerified: true`)**:
   ```json
   { "id": "ord-1", "orderNumber": "FD-1001", "customerId": "user-1", "isVerified": true }
   ```
   *Rejected by*: `data.keys().hasOnly(...)` inside `isValidOrder()`.

2. **Identity Spoofing on Order Creation (`customerId != request.auth.uid`)**:
   ```json
   { "id": "ord-2", "customerId": "victim-uid", "status": "pending" }
   ```
   *Rejected by*: `incoming().customerId == request.auth.uid`.

3. **Unverified Admin Email Spoofing (`email == 'alnatour.m@gmail.com'`, `email_verified == false`)**:
   ```json
   { "auth": { "uid": "attacker", "token": { "email": "alnatour.m@gmail.com", "email_verified": false } } }
   ```
   *Rejected by*: `request.auth.token.email_verified == true` check in `isAdmin()` and `isVerifiedUser()`.

4. **PII Blanket Read on `/user_private/victim-uid` by `attacker-uid`**:
   *Rejected by*: `allow get: if isSignedIn() && isValidId(userId) && request.auth.uid == userId;`.

5. **Cross-Business Menu Tampering (Restaurant Manager editing `foodoo-cafe` product)**:
   ```json
   { "businessId": "foodoo-cafe", "priceSar": 1 }
   ```
   *Rejected by*: `isAssignedMerchant(incoming().businessId)` checking `/user_profiles/$(request.auth.uid).data.assignedBusinessId == 'foodoo-cafe'`.

6. **Order State Shortcutting (`pending` directly to `completed`)**:
   ```json
   { "status": "completed", "squadPointAwarded": true }
   ```
   *Rejected by*: Legal state transition gate requiring `existing().status == 'ready'` to transition to `'completed'`.

7. **Terminal State Mutation (`completed` order changed to `cancelled`)**:
   ```json
   { "status": "cancelled" }
   ```
   *Rejected by*: `!(existing().status in ['completed', 'cancelled'])`.

8. **ID Poisoning Attack (2KB document ID with special characters)**:
   *Rejected by*: `isValidId(id)` enforcing `id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`.

9. **Denial-of-Wallet Oversized String (`notes` with 50,000 characters)**:
   *Rejected by*: `data.notes is string && data.notes.size() <= 400`.

10. **Unbounded Array Injection (`itemsSummary` with 100 items)**:
    *Rejected by*: `data.itemsSummary is list && data.itemsSummary.size() >= 1 && data.itemsSummary.size() <= 20`.

11. **Client Timestamp Forgery (`createdAt` set to past date)**:
    *Rejected by*: `incoming().createdAt == request.time`.

12. **Orphan Squad Member Creation (Joining non-existent `squadId`)**:
    *Rejected by*: Master Gate `exists(/databases/$(database)/documents/squads/$(squadId))`.

## 3. Phase 5 Red Team Conflict Report

| Collection | Identity Spoofing | State Shortcutting | Resource Poisoning | Validation Helper in Update | Query Enforcer (`list`) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `/businesses/{businessId}` | PASS (`isAssignedMerchant`) | N/A | PASS (`isValidId` + string bounds) | PASS (`isValidBusiness`) | PASS (`resource.data.isDemoData == true`) |
| `/products/{productId}` | PASS (`isAssignedMerchant`) | N/A | PASS (`isValidId` + string bounds) | PASS (`isValidProduct`) | PASS (`resource.data.businessId in ['foodoo-restaurant', 'foodoo-cafe']`) |
| `/user_profiles/{userId}` | PASS (`uid == request.auth.uid`) | N/A | PASS (`isValidId` + string bounds) | PASS (`isValidUserProfile`) | PASS (`resource.data.uid == request.auth.uid`) |
| `/user_private/{userId}` | PASS (`uid == request.auth.uid`) | N/A | PASS (`isValidId` + string bounds) | PASS (`isValidUserPrivate`) | PASS (No `list` allowed) |
| `/orders/{orderId}` | PASS (`customerId == request.auth.uid`) | PASS (Strict step-by-step FSM + terminal lock) | PASS (`isValidId` + array/string bounds) | PASS (`isValidOrder`) | PASS (`customerId == uid \|\| merchantUid == uid \|\| isAdmin()`) |
| `/squads/{squadId}` | PASS (`creatorId == request.auth.uid`) | N/A | PASS (`isValidId` + string bounds) | PASS (`isValidSquad`) | PASS (`resource.data.isActive == true`) |
| `/squads/{squadId}/members/{memberId}` | PASS (`memberId == request.auth.uid`) | N/A | PASS (`isValidId` + Master Gate) | PASS (`isValidSquadMember`) | PASS (`resource.data.squadId == squadId`) |
