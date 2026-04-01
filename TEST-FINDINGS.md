# API Test Findings Report

**114 tests, 72 passed, 42 failed, 188 seconds**
20 endpoints covered.

## Key Findings

### 1. LinkedIn Enrichment (POST /enrichment/linkedin/)

**16/24 passed**

| Input | Result |
|-------|--------|
| Full URL `https://www.linkedin.com/in/username/` | PASS - works (direct or async) |
| Without www `https://linkedin.com/in/username` | PASS - works |
| Without trailing slash | PASS - works |
| Just username `sherylsandberg` | FAIL - "Please provide a valid LinkedIn URL or Sales Navigator URL" |
| `linkedin.com/in/username` (no https://) | Hit 429 rate limit, untested |
| Company URL `/company/google` | Hit 429, but likely invalid |
| Empty string | FAIL - "LinkedIn URL is required" |
| `not-a-url` | FAIL - "Please provide a valid LinkedIn URL or Sales Navigator URL" |
| `/in/` with no username | PASS - accepted (returns async task, unclear result) |
| Sales Navigator URL (fake) | Hit 429, untested |
| `unlock_emails=0, unlock_phone=0` | PASS - returns data without unlocking |
| Empty body `{}` | FAIL - "LinkedIn URL is required" |
| GET instead of POST | FAIL - HTTP 500 (server error, not clean 405) |

**Takeaways:**
- Must send full URL with `https://` prefix. Just a username doesn't work.
- The API does NOT validate if a profile exists before accepting the request.
- Some responses are direct (cached profiles), others are async (task_id).
- Rate limit of 2 req/sec is aggressive. Many "failures" were actually 429s.

### 2. Email Enrichment (GET /enrichment/email/)

**14/21 passed**

| Input | Result |
|-------|--------|
| Valid work emails | PASS - returns task_id or direct data |
| `invalid-email` (no @) | PASS - accepted! Returns `{"success":true,"status":200}` |
| Empty string | Hit 429 |
| Fake domain email | PASS - accepted, returns 200 with no data |
| With valid `list_id` | PASS - returns enriched data |
| With invalid `list_id=999999` | FAIL - "Invalid list ID" |
| `elon@tesla.com` | PASS - returns 200 but no data (no match) |

**Takeaways:**
- API does NOT validate email format server-side. Anything is accepted.
- Some emails return direct enriched data, others return task_id.
- `list_id` is validated but optional.

### 3. Phone Enrichment (GET /enrichment/phone/)

**6/10 passed**

| Input | Result |
|-------|--------|
| Valid phone with list_id | PASS |
| Short number `1234` | PASS - accepted (returns task_id) |
| Empty phone number | FAIL - "phone_number is required in request query" |
| Invalid `list_id=999999` | FAIL - "Invalid list ID" |
| Missing list_id entirely | FAIL - "list_id is required in request query" |

**Takeaways:**
- `list_id` is REQUIRED (unlike email enrichment where it's optional).
- Phone number format is not validated server-side.

### 4. Domain Enrichment (GET /enrichment/domain/)

**0/6 passed - ALL FAILED**

Every domain request returns "Failed to parse JSON" - the API returns non-JSON content (likely `None` as raw text). This endpoint appears to be non-functional via API.

**Takeaway:** Domain enrichment does not work via API. Should be removed or marked broken in the MCP.

### 5. Email Finder (GET /email-finder/)

**8/10 passed**

| Input | Result |
|-------|--------|
| Satya Nadella @ microsoft.com | Found: satyan@microsoft.com |
| Sundar Pichai @ google.com | Found: sundarp@google.com |
| Jensen Huang @ nvidia.com | Found: jensenh@nvidia.com |
| Andy Jassy @ amazon.com | Found: ajassy@amazon.com |
| Anant Gupta @ growthtoolkit.io | Found: anant@growthtoolkit.io |
| Tim Cook @ apple.com | FAIL - timeout/parse error (took 30s) |
| Mark Zuckerberg @ meta.com | No email found (but success=true) |
| Empty params | FAIL - "first_name is required in request query" |
| Fake domain | No email found (success=true) |
| John Doe @ gmail.com | No email found (success=true) |

**Takeaways:**
- Works very well for real people at real companies.
- Some lookups take 1-30+ seconds (async processing).
- Returns `success: true` with no data when not found (not an error).

### 6. Email Verifier (GET /email-verifier/)

**6/9 passed**

| Input | Result |
|-------|--------|
| anant@growthtoolkit.io | valid=true, mx=alt3.aspmx.l.google.com |
| satya@microsoft.com | valid=true, mx=microsoft-com.mail.protection.outlook.com |
| contact@google.com | valid=false, mx=smtp.google.com |
| fake@nonexistentdomain99.com | valid=false, mx=none |
| info@stripe.com | valid=false |
| `notanemail` | FAIL - "Invalid email" |
| Empty | FAIL - "email is required in request query" |

**Takeaways:**
- Works reliably. Validates email format server-side (unlike enrichment).
- Returns MX domain info even for invalid emails.

### 7. Task Status (GET /tasks/status/{id}/)

**2/3 passed**

| Input | Result |
|-------|--------|
| Valid completed task ID | PASS - status=finished with full data |
| Fake UUID (all zeros) | FAIL - error response |
| Invalid format `not-a-uuid` | PASS - returns error but success=true (quirk) |
| Empty task ID | FAIL - HTTP 500 |

### 8. List APIs

**15/20 passed**

- `page`, `page_size`, `q` all work correctly.
- `page=9999` returns empty array gracefully (not an error).
- `detailed=1` returns 0 items on ALL list types. This seems like a bug or the parameter only works with `page_size` set differently. The API returns success but empty data.

### 9. Export APIs

**5/7 passed**

- Prospect export works.
- Email finder/verifier exports work.
- LinkedIn scraper export works.
- Invalid list IDs return HTTP 500 with "Something went wrong".
- Sales Navigator scraper export returned an error for list ID 1.

### 10. Auth & Edge Cases

| Scenario | Result |
|----------|--------|
| No API key | HTTP 500 (should be 401) |
| Invalid API key | Returns error object (not clean 401) |
| GET on POST endpoint | HTTP 500 (should be 405) |
| Nonexistent endpoint | Returns error object |

**Takeaway:** The API returns HTTP 500 for auth failures instead of proper 401/403. Our MCP needs to handle this.

### 11. Reverse Lookups

**Reverse Email (email enrichment):**
- anant@growthtoolkit.io - returned full profile with all emails
- sundar@google.com - returned profile with masked email
- brian@airbnb.com - returned "brian c. @ anthropic" with 3 emails, 2 phones
- patrick@stripe.com - returned profile with pc@arcinstitute.org

**Reverse Phone:**
- +14289100903 - found Anant Gupta with full data
- +19842449198 - found Bolun Li with phone confirmed

## Rate Limiting Behavior

- 429 responses include `{"sec": N}` indicating wait time.
- The 2 req/sec limit for Action endpoints is strict.
- Many test "failures" were actually just rate limits, not real errors.
- Rate limits are per-category, not global.

## MCP Changes Needed

1. **Remove or warn about domain enrichment** - endpoint returns non-JSON
2. **Handle 429 with retry** - add automatic retry with backoff using the `sec` field
3. **Handle non-JSON responses** - the API sometimes returns raw text like `None`
4. **LinkedIn URL validation** - must include `https://` prefix, just username fails
5. **Handle HTTP 500 for auth errors** - API returns 500 instead of 401
6. **`detailed=1` appears broken** - returns empty results on all list endpoints
