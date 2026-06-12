# 🔐 ReconX — Passive Recon  Dashboard

ReconX is a modern browser-based OSINT & passive reconnaissance tool designed for security researchers, bug bounty hunters, and developers who want quick, domain intelligence—all served from a high-fidelity, hacker-themed Next.js dashboard.

Everything is **100% passive**—no active port scans, no direct pings, and no legal grey areas. It queries public logs and registries to harvest intelligence cleanly and safely.

---

## 🌍 Key Diagnostic Features

- **WHOIS & Registry Intelligence** — Registrar details, creation dates, expiration dates, and authoritative nameservers via RDAP bootstrap redirection.
- **DNS Record Resolver** — Full query resolution of `A`, `AAAA`, `MX`, `TXT`, `CNAME`, `NS`, and `SOA` records using the secure Google Public DNS JSON API.
- **SSL Certificate Security** — Certificate Authority issuer details, validity timeframes, and status validation indicators.
- **Subdomain Enumeration** — Extraction of child domains using historical records from Certificate Transparency logs (`crt.sh`).
- **IP & ASN Intelligence** — Resolved domain IP metadata, network provider ASN, ISP name, and geological flags/coordinates via `ipapi.co`.
- **HTTP Security Headers Audit** — PASS/FAIL compliance checklists scanning for HSTS, CSP, X-Frame-Options, MIME sniffing blockers, and referrer policy safety.

---

## 🚀 Architectural Improvements (Next.js App Router)

- **Local API Proxy Router (`/api/proxy`)** — Server-side route handler at `src/app/api/proxy/route.js`. The client resolves domains by querying `/api/proxy?url=...` which fetches metrics (like `crt.sh` logs and `rdap.org` registration data) server-side, bypassing browser CORS blocks natively without relying on slow or rate-limited third-party proxies.
- **Font Optimization** — Custom font sets (**Outfit** and **JetBrains Mono**) are loaded natively via Next.js `next/font/google` to optimize LCP and layout stability.
- **SEO Ready** — Configured search headers, titles, descriptions, and icon bindings using Next.js Metadata objects.

---

## 💻 Tech Stack

- **Framework:** Next.js (App Router, Client & Server Components, Route Handlers)
- **React version:** React 19
- **Styling:** Tailwind CSS v4 (built-in Next.js template)
- **Animations:** Framer Motion (staggered card transitions and scrolling console sweep animations)
- **Icons:** Lucide React
- **APIs Used:** `dns.google`, `rdap.org`, `crt.sh`, `ipapi.co`

---

## 💻 Getting Started

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed.

### 2. Installation
Install all required Node modules:
```bash
npm install
```

### 3. Start Development Server
Spin up the Next.js development server:
```bash
npm run dev
```
Open **[http://localhost:3000/](http://localhost:3000/)** in your web browser.

### 4. Build for Production
Verify production build compilation and static site generation:
```bash
npm run build
```

---

## 🧪 Postman Collection Testing
We have included a pre-configured Postman Collection file in the root directory:
- [reconx.postman_collection.json](file:///Users/pandu/Desktop/RECON%20X/reconx.postman_collection.json)

**How to use:**
1. Open Postman.
2. Click **Import** and select the `reconx.postman_collection.json` file.
3. The collection provides pre-configured folders containing GET requests for DNS resolution, WHOIS/RDAP bootstrap, SSL cert details, subdomains enumeration, IP/ASN routing, and HTTP headers check.
4. Modify the collection variables `domain` (e.g. `github.com`) and `ip` (e.g. `140.82.121.4`) to test different endpoints.

---

## 🔒 Passive OSINT Compliance
ReconX operates strictly as a passive aggregator. It retrieves metrics directly from browser-allowed endpoints or proxies them through its own server-side backend routing. 

Because it makes **zero direct connections** to the target host during auditing, it is completely anonymous, safe, and complies with ethical scanning standards.
