# Kintehobe Workspace Instructions

You are assisting with **Kintehobe**, a Next.js 16 UI/design system project using modern tooling and established component patterns.

## Quick Reference

- **Dev**: `npm run dev` (http://localhost:3000)
- **Lint/Format**: `npm run lint` / `npm run format` (Biome)
- **Build**: `npm run build` → `npm start`
- **Stack**: Next.js 16.2.3, React 19.2.4, TypeScript, Tailwind CSS v4, shadcn/ui, Radix UI
- **Project Stage**: Early-stage frontend-focused boilerplate with planned backend integration (Drizzle ORM, Better Auth, Stripe, Cloudinary, AI SDK)

---

## Component Architecture

### Directory Structure

```
src/components/
├── core/          # Layout & structural components
│   ├── base/      # Navbar, Sidebar, etc.
│   └── sub/       # Specialized layout subcomponents
└── ui/            # shadcn/ui library (36+ components, all with CVA variants)

src/hooks/         # Custom React hooks (e.g., use-mobile.ts)
src/lib/           # Utilities (e.g., utils.ts for classname merging)
```

### Component Patterns

#### **1. Class Variance Authority (CVA)**

All UI components use **CVA for variants**. Structure:

```typescript
// Example: Button variants
const buttonVariants = cva(
  [
    /* base styles */
  ],
  {
    variants: {
      variant: { primary: "...", secondary: "..." },
      size: { sm: "...", md: "...", lg: "..." },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);
```

**When adding new components:** Always define variants upfront, even for simple components. Use CVA's `compoundVariants` for complex states.

#### **2. Polymorphic Components (asChild)**

Radix UI's `asChild` pattern enables flexible rendering:

```typescript
<Button asChild>
  <a href="/path">Link as button</a>
</Button>
```

Use `React.ElementRef` and `React.ComponentPropsWithoutRef` for proper typing.

#### **3. Slots & Data Attributes**

Components use `data-slot` attributes for composable, styled subcomponents:

```typescript
// Internal selector pattern
<div data-slot="input-group__input">
  {/* styled input */}
</div>
```

Enables flexible theming without BEM or complex nesting.

#### **4. Compound Components**

Components support composition patterns (InputGroup with InputGroupAddon, InputGroupInput). Props are spread from parent to children.

#### **5. Client Component Boundary**

UI components are **use client** components. Server components (pages/layouts) import and compose them.

---

## Code Style & Formatting

### **Biome (Linter & Formatter)**

- **Linting**: `npm run lint` checks against `biome.json` configuration
- **Formatting**: `npm run format` writes back formatted code
- **Rules**: Next.js + React recommended, Tailwind CSS v4 aware
- **Scope**: TypeScript, JSX, JSON

**Key rules enforced:**

- Auto-import organization (top of file)
- Unused variable detection
- Type safety checks (strict TypeScript)
- Tailwind class order (if configured)

**Before committing:** Always run `npm run lint && npm run format`.

### **TypeScript**

- **Target**: ES2017
- **Strict Mode**: Enabled (`strict: true`)
- **Path Aliases**: Configured in `tsconfig.json`:
  ```json
  "@/*": "./src/*"
  ```

Always use absolute imports with `@/` prefix instead of relative imports.

### **File Naming**

- **Components**: `PascalCase.tsx` (e.g., `Button.tsx`)
- **Utilities/Hooks**: `kebab-case.ts` (e.g., `use-mobile.ts`, `utils.ts`)
- **Pages/Layouts**: `kebab-case.tsx` per Next.js convention

---

## Imports & Path Conventions

### **Absolute Imports (Required)**

```typescript
// ✅ Correct
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

// ❌ Avoid relative imports
import { Button } from "../../../components/ui/button";
```

### **Named Exports (Components)**

UI components use **named exports**:

```typescript
export const Button = React.forwardRef(...)
```

Import accordingly:

```typescript
import { Button } from "@/components/ui/button";
```

### **Default Exports (Pages/Layouts)**

Pages and layouts use **default exports** (Next.js convention):

```typescript
export default function Page() { ... }
```

---

## Styling & Tailwind CSS v4

### **Setup**

- **Config**: `@tailwindcss/postcss` (PostCSS-based, modern)
- **Mode**: Not legacy config; uses custom utilities
- **Font**: Oxygen (custom, not default Inter)
- **Color Space**: OKLCH (modern, perceptual color)
- **CSS Variables**: Theme colors defined as CSS vars

### **Class Merging**

Use the `cn()` utility from `@/lib/utils` to merge Tailwind classes with CVA variants:

```typescript
const additionalClasses = cn(
  buttonVariants({ variant: "primary" }),
  "custom-override-if-needed",
);
```

This prevents duplicate class conflicts.

### **Responsive Design**

Use Tailwind's responsive prefixes:

```typescript
className = "px-4 md:px-6 lg:px-8";
```

---

## API & Server Integration (Planned)

The project README documents planned backend integration:

- **TanStack Query**: For async server-state (queries, mutations)
- **Server Actions**: For form mutations and server-side logic
- **Route Handlers**: For REST endpoints (if needed alongside Server Actions)
- **Drizzle ORM**, **Better Auth**, **Stripe**, **Cloudinary**, **Vercel AI SDK**: Production integrations

### **Data Fetching Conventions** (Once Implemented)

Per your coding preferences:

- **JSON requests**: Use `howl` library (configured for JSON payloads)
- **FormData requests**: Use `fetch` directly
- **State management**: TanStack Query for server state, Zustand for client state

---

## Testing (Currently Missing)

**No test setup is currently in place.** Establish testing for:

- **Component library**: vitest + @testing-library/react for shadcn/ui
- **API routes/Actions**: vitest for server logic
- **E2E**: Cypress or Playwright for critical user flows

**When testing is added:**

1. Create `tests/` or `__tests__/` directories adjacent to source
2. Use `.test.ts` or `.spec.ts` suffix
3. Add test commands to `package.json`

---

## Common Tasks & Workflows

### **Adding a New UI Component**

1. Create in `src/components/ui/component-name.tsx`
2. Define CVA variants
3. Export named component with `React.forwardRef` if needed
4. Import in pages as `import { ComponentName } from "@/components/ui/component-name"`
5. Run `npm run lint && npm run format`

### **Adding a Custom Hook**

1. Create in `src/hooks/use-something.ts`
2. Export named function (convention: `use-` prefix)
3. Use in client components only
4. Document with JSDoc comments

### **Styling a Component**

1. Use Tailwind utility classes in `className`
2. For variants, wrap with `cva()`
3. Merge additional classes with `cn()` function
4. Test responsive behavior with Tailwind's breakpoint prefixes

### **Running Development Build**

```bash
npm run dev         # Start dev server
npm run lint        # Check for issues
npm run format      # Auto-format code
npm run build       # Production build
npm start           # Production server
```

---

## Conventions & Anti-Patterns

### ✅ Do This

- Use path aliases (`@/`) for all imports
- Define component variants with CVA upfront
- Mark UI components as `use client`
- Use Biome formatting before commits
- Compose components using React patterns (props, spreading, asChild)

### ❌ Don't Do This

- Relative imports (`../../../components`)
- Inline colors instead of Tailwind classes
- Mixed component patterns (some with CVA, some ad-hoc)
- Unused variables (Biome will catch this)
- Ignore TypeScript strict mode errors

---

## Helpful Resources

- **AGENTS.md**: Next.js 16 breaking changes warning
- **README.md**: Full tech stack and infrastructure details
- **package.json**: Dependencies, scripts, and configuration
- **Biome**: [Official docs](https://biomejs.dev/)
- **shadcn/ui**: [Component library](https://ui.shadcn.com/)
- **Tailwind CSS v4**: [PostCSS setup](https://tailwindcss.com/docs/guides/using-postcss)
- **Next.js 16**: Read docs in `node_modules/next/dist/docs/` for breaking changes from v15

---

## Questions?

When you encounter:

- **Component styling**: Check existing shadcn/ui examples for CVA patterns
- **Import issues**: Verify path aliases in `tsconfig.json`
- **Formatting errors**: Run `npm run format` before committing
- **TypeScript errors**: Ensure strict mode compliance; check type definitions

This workspace uses modern tooling. Lean on code examples in `src/components/ui/` for patterns.
