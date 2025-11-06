Hal Boutique — Next.js app (App Router)

Một repository mẫu cho cửa hàng nhỏ (Hal Boutique). Project được cấu trúc theo feature-first và có ý định phát triển theo các nguyên tắc DDD nhẹ, dễ mở rộng sang EDA khi cần.

# Tech-stack:
- Next.js (App Router)
- TypeScript
- TailwindCSS (config có sẵn)

# Git branch name rule:
- feature/: For new features or functionalities.
- bugfix/: For fixing bugs in the code.
- hotfix/: For urgent patches, usually applied to production.
- design/: For user interface or user experience updates.
- refactor/: For improving code structure without changing functionality.
- test/: For writing or improving automated tests.
- doc/: For documentation updates.

# Hal Boutique — Next.js (App Router)

Một repository mẫu cho cửa hàng nhỏ, tổ chức theo hướng feature-first với mục tiêu phát triển theo DDD (nhẹ) và có khả năng mở rộng sang EDA (event-driven architecture) khi cần.

Tài liệu này cung cấp:
- Hướng dẫn chạy nhanh
- Mô tả chi tiết cấu trúc thư mục hiện tại
- Các quyết định kỹ thuật chính và pattern áp dụng (ngắn)
- Ý tưởng phát triển tiếp theo (prioritized)

## Tóm tắt công nghệ (ngắn)
- Next.js (App Router)
- TypeScript
- TailwindCSS
- Axios + SWR + Zustand (client-side)
- MongoDB (scaffold trong `lib/db`)

## Quick start

```bash
# cài dependency
npm install

# chạy development server
npm run dev

# build
npm run build

# start production (after build)
npm start
```

Lưu ý: repo hiện chưa cài các package axios/swr/zustand; chạy `npm install axios swr zustand` nếu cần.

## Mục tiêu thiết kế
Giữ domain logic rõ ràng (feature-first / DDD-light), phát triển nhanh (infra nhẹ, in-process), và dễ chuyển sang EDA (event contracts + publisher) khi cần mở rộng.

## Cấu trúc thư mục — giải thích chi tiết

/ (repo root)
</br>├── app/                          # Next.js App Router (routes, layouts, API handlers)
</br>│   ├── layout.tsx                # root layout -> place providers (SWR, Providers)
</br>│   ├── (shop)/
</br>│   │   ├── products/
</br>│   │   │   ├── [category]/page.tsx
</br>│   │   │   └── details/[productId]/page.tsx
</br>│   │   └── user/...
</br>│   ├── (back-office)/
</br>│   │   └── dashboard/page.tsx
</br>│   └── api/
</br>│       └── v1/
</br>│           ├── auth/route.ts     # thin HTTP layer -> calls application handlers
</br>│           └── orders/route.ts
</br>│
</br>├── features/                      # Bounded contexts (feature-first, DDD)
</br>│   ├── products/
</br>│   │   ├── ui/                    # React components + client hooks (useSWR, useStore)
</br>│   │   │   ├── ProductCard.tsx
</br>│   │   │   └── ProductList.tsx
</br>│   │   ├── application/           # Use-cases / command & query handlers
</br>│   │   │   └── handlers.ts
</br>│   │   ├── domain/                # Entities, ValueObjects, Domain Events (pure logic)
</br>│   │   │   └── events/
</br>│   │   └── infrastructure/        # concrete repo/adapters (DB mappers, messaging)*
</br>│   │
</br>│   └── orders/
</br>│       ├── ui/
</br>│       ├── application/
</br>│       ├── domain/
</br>│       └── infrastructure/
</br>│
</br>├── lib/                           # Cross-cutting / infra helpers
</br>│   ├── db/
</br>│   │   ├── index.ts               # db client wrapper
</br>│   │   └── mongodb.ts
</br>│   ├── axios/                     # axios setup & interceptors (fetcher for SWR)
</br>│   │   └── helper.config.ts
</br>│   ├── swr/                       # global SWR config / fetcher
</br>│   │   └── config.ts
</br>│   ├── stores/                    # zustand stores (cart, user, middleware)
</br>│   │   ├── product.store.ts
</br>│   │   └── user.store.ts
</br>│   ├── messaging/                 # EventBus, adapters (in-memory / broker) *
</br>│   ├── validation/
</br>│   └── web3/
</br>│
</br>├── components/                    # Shared UI providers / wrappers
</br>│   └── Providers.tsx              # client wrapper: SWRConfig, theme, etc.
</br>│
</br>├── services/                      # background workers / consumers (optional)
</br>│   └── orders-consumer/           # subscribe to domain events (OrderCreated)
</br>│
</br>├── contracts/ (optional)          # shared event/DTO schemas (versioned)
</br>│
</br>├── public/                        # static assets
</br>│
</br>├── tests/                         # integration / e2e / unit tests
</br>│
</br>└── README.md

## Pattern & conventions (ngắn)
- Feature-first + layer separation: `ui` (React), `application` (use-cases), `domain` (pure logic).
- Thin API routes: route handlers chỉ validate và gọi application handlers.
- Define repository interfaces in domain/application; implement concrete repos in `lib/db` or `features/<domain>/infrastructure` khi cần.
- Keep domain code free from framework APIs for testability.
- Use tsconfig paths (`@/*`, `@features/*`, `@lib/*`) for cleaner imports.

## Client data pattern (axios + SWR + Zustand) — tóm tắt
- SWR: đọc dữ liệu server (product lists, details). Dùng `SWRConfig` global.
- Axios: HTTP client cho fetch & mutations; centralize interceptors for auth/refresh.
- Zustand: client-only state (cart, UI), optimistic updates and persist.

Recommendation: SWR là nguồn truth cho dữ liệu từ server; zustand cho trạng thái cục bộ/optimistic. Axios dùng làm fetcher & mutation client.

## Luồng triển khai (ví dụ: Create Order) — đầy đủ nhưng ngắn gọn
1. UI component gọi hook `useCreateOrder`.
2. Hook/handler cập nhật zustand (optimistic — show pending UI / reduce displayed stock).
3. Hook gọi API `POST /api/v1/orders` bằng axios.
4. Khi success: gọi `SWR.mutate` các key liên quan (orders, product stock) để revalidate.
5. Khi failure: rollback zustand và show lỗi; ghi log/analytics nếu cần.

Side-effects: Application layer có thể publish domain events (e.g., `OrderCreated`). Với infra nhẹ, publish in-process. Khi scale, tách sang worker/queue và dùng Outbox.

## Mapping sang DDD/EDA — actionable
- Bounded contexts = `features/<domain>`.
- Place domain events definitions in `features/<domain>/domain/events` (or top-level `contracts/` if shared).
- Application handlers should:
    - orchestrate domain operations
    - call repository interfaces
    - collect domain events and publish via an `EventPublisher` abstraction

## Testing & quality
- Unit tests: domain entities, application handlers, zustand actions.
- Hook/component tests: mock axios (fetcher) and SWR behaviors.
- Integration: use a test DB (or mocked persistence) to run end-to-end scenarios.

## Environment variables (suggested)
- NEXT_PUBLIC_API_URL — base URL for client API
- MONGODB_URI — mongo connection string

## Roadmap & ideas cần phát triển (ưu tiên)
1. Implement domain models & application handlers for `products` + `orders` (concrete repositories).
2. Add `lib/swr/config.ts` (axios-based fetcher) and `components/Providers` with `SWRConfig`.
3. Implement `cart` and `user` zustand stores (persist middleware).
4. Small in-process `EventBus` + domain events (`OrderCreated`, `ProductStockUpdated`).
5. If scaling required: add Outbox + message broker adapters under `lib/messaging`.

## How to add a feature (short)
1. Create `features/<domain>`
2. Add `ui/`, `application/`, `domain/`
3. Add API route under `app/api/v1` calling application handler

## Notes
- Repo already contains scaffolds for many of these pieces (empty domain/application files). Use them as starting points.


## License
MIT — see `LICENSE`.

---
Updated: October 27, 2025


