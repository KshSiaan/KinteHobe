/* Product Fetch Error - Database Query Resilience Guide */

===========================================
ISSUES FIXED
===========================================

1. CONNECTION POOL EXHAUSTION
   - Issue: Promise.all() in recent.ts fired N concurrent DB queries simultaneously
   - Result: Intermittent 500 errors when fetching products
   - Stack: /api/product?preference=best_selling
   - Error: "Failed query" on product_variant table

2. NO INDIVIDUAL ERROR HANDLING
   - One failed variant query crashed the entire response
   - No graceful degradation or failsafe

3. NO RETRY LOGIC
   - Transient errors (timeouts, connection issues) weren't retried
   - Every temporary glitch became a 500 error


===========================================
SOLUTIONS IMPLEMENTED
===========================================

FILE: src/lib/db-utils.ts (NEW)
────────────────────────────────
  ✓ withRetry<T>()
    - Exponential backoff with jitter
    - Retryable error detection (connection, timeout, pool exhaustion)
    - 3 retries by default, configurable
    - Non-retryable errors thrown immediately

  ✓ isRetryableError()
    - Detects transient vs permanent errors
    - Keywords: connection, timeout, pool, temporarily unavailable, etc.

  ✓ withConcurrencyLimit<T>()
    - Limits concurrent promise executions (default: 5)
    - Prevents database connection pool exhaustion
    - Uses Promise.race() for efficient queue management

  ✓ withConcurrencyAndRetry<T>()
    - Combines both: concurrency limiting + retry logic
    - Ready for future use

  ✓ handleQueryError()
    - Structured error logging with context
    - Returns fallback values


FILE: src/app/api/product/recent.ts
──────────────────────────────────────
  ✓ Replaced Promise.all() with withConcurrencyLimit()
    - Max 5 concurrent variant queries at a time
    - Prevents pool exhaustion even with limit=100 products

  ✓ Added withRetry() wrapper around variant queries
    - 3 retries with exponential backoff
    - 50ms initial delay for faster retries

  ✓ Individual try-catch per product
    - Failed variant fetch doesn't crash entire response
    - Product returned with empty variants array as fallback
    - Error logged with product ID for debugging

  ✓ Better error logging
    - Shows "Variant Fetch Error" with product ID
    - Helps identify problematic products


FILE: src/app/api/product/favourite.ts
───────────────────────────────────────
  ✓ Added withRetry() to the single aggregated query
    - 3 retries with exponential backoff
    - Handles transient database errors gracefully


===========================================
HOW IT WORKS
===========================================

SCENARIO 1: Normal Operation
  1. User requests /api/product?preference=recent
  2. Fetch first N products from database
  3. For each product, queue a variant fetch task
  4. withConcurrencyLimit() executes max 5 tasks at a time
  5. withRetry() executes each task with automatic retry
  6. Variants loaded, variants found → product returned with variants

SCENARIO 2: Transient Database Error
  1. Variant query times out → Error thrown
  2. withRetry() detects "connection timeout" → Retryable
  3. Wait 50ms + jitter, retry
  4. Second attempt succeeds → Product returned normally

SCENARIO 3: Pool Exhaustion (too many concurrent queries)
  1. Without fix: All N variant queries fire at once → Pool exhausted
  2. With fix: Max 5 queries execute at a time → Pool stays healthy
  3. Queue processes smoothly even with 100 products

SCENARIO 4: Permanent Error (e.g., product not found)
  1. Variant query fails with non-retryable error
  2. withRetry() logs error, throws immediately (no retry waste)
  3. try-catch in product mapping catches it
  4. Product returned with empty variants [] as fallback
  5. Front-end can still render the product info


===========================================
TESTING THE FIX
===========================================

TEST 1: High Volume Stress Test
  - Scenario: Request products with high limit
  - Command: curl "http://localhost:3000/api/product?limit=100&preference=recent"
  - Expected: 200 response with all products, no 500 errors
  - Success: No connection pool exhaustion errors in logs

TEST 2: Intermittent Errors Should Retry
  - Scenario: Database connection briefly drops mid-request
  - Expected: Request succeeds after automatic retry (users won't see error)
  - Verification: Check server logs for "Variant Fetch Error" messages
  - Success: Errors are retried and eventually succeed

TEST 3: Partial Failure Graceful Degradation
  - Scenario: 1 out of 60 products has a permanent error
  - Expected: 60 products returned, 1 with empty variants
  - Verification: Front-end can handle empty variants array
  - Success: Response is 200, not 500

TEST 4: All Preferences Work
  - Commands:
    curl "http://localhost:3000/api/product?preference=recent"
    curl "http://localhost:3000/api/product?preference=best_selling"
    curl "http://localhost:3000/api/product?preference=most_favorites"
  - Expected: All return 200 with products (or empty arrays gracefully)

TEST 5: Monitor Error Logs
  - Watch for: "[DB Query Error]", "[Variant Fetch Error]", "[Retrying]"
  - Pattern: Transient errors should show "Retrying", then succeed
  - Bad pattern: Same error repeated 3+ times = permanent issue


===========================================
CONFIGURATION & TUNING
===========================================

Concurrency Limit:
  Default: 5 concurrent variant queries
  Edit: recent.ts line where withConcurrencyLimit(..., 5) is called
  Increase for faster processing (may stress database)
  Decrease for lighter load on database

Retry Settings:
  maxRetries: 3 (number of retry attempts)
  initialDelayMs: 50 (first retry waits 50ms)
  Each retry: delay * 2 (exponential backoff)
    Retry 1: ~50ms + jitter
    Retry 2: ~100ms + jitter
    Retry 3: ~200ms + jitter

Modify in recent.ts or favourite.ts:
  await withRetry(queryFn, {
    maxRetries: 5,        // More retries for unstable DB
    initialDelayMs: 100,  // Slower retries
  })


===========================================
PRODUCTION CHECKLIST
===========================================

✓ Code deployed and formatted (npm run format)
✓ No TypeScript errors (npm run lint)
✓ Error handling in place for individual products
✓ Retry logic with exponential backoff
✓ Concurrency limiting prevents pool exhaustion
✓ Graceful fallback: products return even with variant errors

Next steps:
  [ ] Monitor production logs for error patterns
  [ ] If still getting "connection pool" errors, increase retries
  [ ] Consider batch variant loading query (future optimization)
  [ ] Add metrics/monitoring for variant fetch success rate


===========================================
FILES MODIFIED
===========================================

Created:
  src/lib/db-utils.ts - Utility functions for resilient DB operations

Modified:
  src/app/api/product/recent.ts - Added concurrency limiting and retry logic
  src/app/api/product/favourite.ts - Added retry logic to aggregated query

No changes to:
  src/app/api/product/best.ts (already returns empty data, low risk)
  src/app/api/product/route.ts (orchestrator, no changes needed)
  Database schema or migrations
*/
