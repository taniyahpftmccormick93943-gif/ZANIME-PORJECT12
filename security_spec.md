# Security Specification - Movie & Series Platform

## 1. Data Invariants
- **Public Data (Movies/Series):** Must be readable by anyone (including unauthenticated users) to allow browsing.
- **Modification Isolation:** Only users with `role == 'Admin'` or `role == 'Owner'` can create, update, or delete movies/series.
- **Identity Integrity:** Users can only modify their own profile, watchlist, and history.
- **Admin Supremacy:** The account `taniyahpftmccormick93943@gmail.com` is the bootstrapped Owner and has full access.

## 2. The "Dirty Dozen" Payloads (Blocked)
1. **Unauthorized Create:** Guest user attempts to `create` a movie.
2. **Unauthorized Delete:** Authenticated non-admin user attempts to `delete` a movie.
3. **Identity Spoofing:** User A attempts to `write` to User B's `/history/`.
4. **Role Escalation:** User A attempts to `update` their own `role` to 'Admin'.
5. **PII Leak:** Guest user attempts to `list` the `/users/` collection.
6. **Shadow Field Injection:** Admin attempts to `create` a movie with an undocumented `isVerifiedBySystem` field.
7. **Timestamp Spoofing:** User attempts to set `createdAt` to a past date instead of `request.time`.
8. **Invalid ID Poisoning:** User attempts to create a document with a 2MB string as the ID.
9. **Terminal State Bypass:** Non-admin user attempts to modify a `Finished` status movie (if implemented).
10. **Query Scraping:** Authenticated user attempts to `list` all user profiles without filtering for their own.
11. **Verification Bypass:** User with `email_verified == false` attempts to write a review.
12. **Relational Sync Break:** User attempts to add a movie summary to their list for a movie ID that doesn't exist.

## 3. Test Runner (Proposed Logic)
- `assertFails(guest.collection('movies').add({...}))`
- `assertSucceeds(guest.collection('movies').get('id'))`
- `assertSucceeds(owner.collection('movies').add({...}))`
- `assertFails(user.collection('users').doc(user.uid).update({role: 'Admin'}))`
