# UI/UX Handoff

## Scope

This document is a handoff guide for improving the visual layout and information architecture of the following flow:

1. `Service Orders`
2. `Booking Files`
3. `Biblia`

The goal is to let another conversation continue the work without rediscovering the current structure.

## Non-Negotiable Constraints

Do not change:

- branding
- colors / brand palette
- business logic
- API contracts
- backend behavior
- route behavior
- data flow
- permissions
- features

Only improve:

- layout
- visual hierarchy
- density
- scanability
- grouping of actions
- use of tabs
- use of modals
- use of drawers
- use of accordions / collapsibles
- compact cards
- cleaner tables

Priority UX principles:

- reduce excessive scroll
- avoid very long pages
- do not place too much information in one screen at the same level
- keep primary actions visible
- move secondary or occasional actions into modals, drawers, or overflow menus
- preserve the current workflow

## Project Context

Frontend stack in this area:

- Angular 18 standalone components
- Tailwind CSS
- Angular routing via `src/app/app.routes.ts`

Relevant route entry points:

- `src/app/app.routes.ts`
  - `dashboard/quoter-main/service-orders`
  - `dashboard/quoter-main/service-orders/contact/:contactId`
  - `dashboard/quoter-main/booking-files`
  - `dashboard/quoter-main/booking-files/:id`
  - `dashboard/operations/biblia`

Feature organization:

- `src/app/features/service-orders/*`
- `src/app/features/booking-files/*`
- `src/app/operations/biblia/*`

## Current Flow Summary

### 1. Service Orders

Current structure:

- Main page uses split layout: queue on the left, detail on the right.
- The page already includes summary KPIs and a detail panel.
- The detail panel already includes tabs: `Overview`, `Workflow`, `Financials`, `Attachments`.

Current UX issue:

- The page starts well, but still exposes too much detail at once.
- The queue table is too wide and asks the user to process too many columns simultaneously.
- The detail header mixes read-only status with editing controls.
- Some secondary actions are visible all the time even though they are occasional.

### 2. Booking Files

Current structure:

- List page shows many statuses and signals directly in the table.
- Single booking file page acts as a hub for:
  - commercial context
  - operational context
  - summary signals
  - generated orders
  - itinerary snapshot
  - detailed operational itinerary

Current UX issue:

- This is the most overloaded area in the flow.
- The detail page is too long and still too dense even with tabs.
- The current `overview` tab contains too many blocks that should be split into separate visual layers.
- The detailed itinerary becomes vertically long very fast.

### 3. Biblia

Current structure:

- Daily operational board with:
  - date controls
  - KPIs
  - filters
  - files-in-view panel
  - large daily schedule table

Current UX issue:

- The table is compact, but still very demanding horizontally.
- Row actions and order updates are too exposed inline.
- The left panel is useful, but competes with the main board for attention.

## Files Involved

### Routing / global entry

- `src/app/app.routes.ts`

### Service Orders

- `src/app/features/service-orders/pages/service-orders-page.component.ts`
- `src/app/features/service-orders/pages/service-orders-by-contact-page.component.ts`
- `src/app/features/service-orders/pages/service-order-templates-page.component.ts`
- `src/app/features/service-orders/ui/service-orders-list.component.ts`
- `src/app/features/service-orders/ui/service-order-detail.component.ts`
- `src/app/features/service-orders/ui/service-order-checklist.component.ts`
- `src/app/features/service-orders/ui/service-order-timeline.component.ts`
- `src/app/features/service-orders/ui/confirm-reason-modal.component.ts`
- `src/app/features/service-orders/data-access/service-orders.store.ts`
- `src/app/features/service-orders/data-access/service-orders.types.ts`

### Booking Files

- `src/app/features/booking-files/pages/booking-files-list-page.component.ts`
- `src/app/features/booking-files/pages/booking-file-page.component.ts`
- `src/app/features/booking-files/pages/booking-file-page.component.html`
- `src/app/features/booking-files/data-access/booking-files.api.ts`
- `src/app/features/booking-files/data-access/booking-files.types.ts`

### Biblia

- `src/app/operations/biblia/biblia.component.ts`
- `src/app/operations/biblia/biblia.component.html`
- `src/app/operations/biblia/biblia.component.css`

## Recommended Execution Order

Work in this order to reduce risk and preserve consistency:

1. `Booking File` detail page
2. `Service Order` detail panel
3. `Service Orders` list page
4. `Biblia`
5. `Booking Files` list page
6. `Service Orders by Contact`
7. `Service Order Templates` only after the operational flow screens are stable

Reason:

- `Booking File` is the main post-sale hub and currently creates the most visual overload.
- `Service Order` detail is the next most important operational workspace.
- `Biblia` should reflect the same hierarchy decisions after `Booking File` and `Service Orders` are cleaner.

## Implementation Plan

## Phase 1. Refactor Booking File Page Layout

Primary file:

- `src/app/features/booking-files/pages/booking-file-page.component.html`

Supporting file:

- `src/app/features/booking-files/pages/booking-file-page.component.ts`

### Objectives

- Reduce the vertical length of the current `overview`.
- Separate executive summary from operational detail.
- Move secondary actions into grouped action areas.
- Make the detailed itinerary easier to scan and edit.

### Recommended layout changes

- Keep only this visible in the page header:
  - file code
  - guest / trip identity
  - travel dates
  - risk level
  - next action
  - primary CTA

- Group secondary header actions into a compact overflow or grouped actions area:
  - `Refresh`
  - `Recalculate Summary`
  - `Open Quote`
  - `Open Biblia`

- Reorganize tabs to this structure:
  - `Summary`
  - `Itinerary`
  - `Orders`
  - `Operations Detail`

- Remove the current behavior where `Overview` tries to contain everything.

### What should stay visible

- booking file identity
- risk
- next action
- top-level status summary

### What should move to drawers or modals

- risk explanation
- overall explanation
- secondary actions
- optional contextual details that are not required for first read

### What should become collapsible

- pax summary
- destinations
- summary context
- attention blocks
- each day inside detailed itinerary

### Target interaction pattern

- In `Operations Detail`, use master-detail:
  - left or main column: days/items list
  - right column or drawer: selected item editor
- Open only one day accordion by default.
- Keep long note or descriptive content collapsed until needed.

## Phase 2. Refactor Service Order Detail

Primary file:

- `src/app/features/service-orders/ui/service-order-detail.component.ts`

Supporting files:

- `src/app/features/service-orders/ui/service-order-checklist.component.ts`
- `src/app/features/service-orders/ui/service-order-timeline.component.ts`
- `src/app/features/service-orders/ui/confirm-reason-modal.component.ts`

### Objectives

- Separate high-priority read-only signals from editing controls.
- Remove duplicate information at the top of the detail panel.
- Push occasional actions into modal or drawer flows.

### Recommended layout changes

- Replace the current mixed header with:
  - service title
  - type
  - area
  - priority
  - status
  - due date
  - one grouped action area

- Do not leave `Stage Transition Comment` visible by default.
- Open a modal or compact drawer when:
  - changing stage
  - changing status when comment is needed
  - cancelling an order

- Keep tabs, but simplify their intent:
  - `Summary`
  - `Workflow`
  - `Docs`
  - `Financials`

### What should stay visible

- current status
- current stage
- priority
- due date
- main service label

### What should move to modal or drawer

- stage comment
- assignee editing
- add attachment form

### What should become collapsible

- workflow metadata
- timestamps
- cancellation metadata
- timeline / audit log
- inactive stages inside workflow

### Additional cleanup

- In `Attachments`, keep only:
  - attachment list
  - compact CTA `Add attachment`
- The full upload form should open in modal.

## Phase 3. Refactor Service Orders Main Page

Primary file:

- `src/app/features/service-orders/pages/service-orders-page.component.ts`

Supporting file:

- `src/app/features/service-orders/ui/service-orders-list.component.ts`

### Objectives

- Make the queue easier to scan.
- Reduce repeated information in the page shell.
- Keep the split view, but compact the list.

### Recommended layout changes

- Reduce header duplication:
  - `Selected order` appears more than once and can be consolidated
- Compact the KPI block so the user reaches the workspace faster
- Keep only the main filters visible
- Move `Sync sold contact` to a modal or drawer

### Table simplification goals

- Keep visible columns focused on first-level triage:
  - action
  - type
  - service
  - stage
  - status
  - due

- Convert secondary information into compact signals:
  - finance as badge or icon summary
  - docs as count chip
  - overdue as critical badge

- Avoid wide cells that require horizontal reading effort

## Phase 4. Refactor Biblia

Primary files:

- `src/app/operations/biblia/biblia.component.html`
- `src/app/operations/biblia/biblia.component.ts`

Supporting file:

- `src/app/operations/biblia/biblia.component.css`

### Objectives

- Keep Biblia fast for daily operations.
- Reduce row-level clutter.
- Move secondary row actions into less noisy patterns.

### Recommended layout changes

- Keep top area compact:
  - date navigation
  - selected day
  - KPI summary

- Make the left rail lighter:
  - filters in collapsible section
  - files-in-view panel collapsible on desktop if needed
  - drawer behavior on smaller screens

- Simplify the main board:
  - keep time, file, service, city, responsible, detail status
  - reduce inline controls

### What should move to modal or drawer

- order status change flow
- file quick summary
- row detail with meeting point / supplier / notes

### What should become collapsible

- filters section
- files-in-view section if visual competition remains high

## Phase 5. Refactor Booking Files List

Primary file:

- `src/app/features/booking-files/pages/booking-files-list-page.component.ts`

### Objectives

- Reduce table density.
- Keep the list useful for triage, not full diagnosis.

### Recommended layout changes

- Keep visible:
  - file
  - guest/contact
  - dates
  - overall status
  - risk
  - next action
  - open file CTA

- Compress area statuses:
  - do not dedicate one full column per status if the row becomes too wide
  - use grouped chips or compact stacked indicators

- Move advanced filters into collapsible section or drawer

### What should move to drawer

- passenger info detail
- extended next action context
- secondary summary explanations

## Phase 6. Refactor Service Orders By Contact

Primary file:

- `src/app/features/service-orders/pages/service-orders-by-contact-page.component.ts`

### Objectives

- Keep it lightweight.
- Preserve it as a contextual queue view rather than turning it into another overloaded workspace.

### Recommended layout changes

- Compact summary cards
- Keep the contact header and queue
- Add a compact `view detail` interaction if needed
- Avoid adding too much inline detail here

## Phase 7. Review Service Order Templates

Primary file:

- `src/app/features/service-orders/pages/service-order-templates-page.component.ts`

### Reason this comes later

- This screen is dense, but it is not part of the operator's primary day-to-day flow.
- It should be aligned after the operational screens establish the preferred visual grammar.

### Future cleanup ideas

- split configuration into tabs:
  - `Template Info`
  - `Stages`
  - `Checklist`
  - `Preview`
- make each stage collapsible
- move destructive actions into modal confirmations

## Shared Design Decisions To Keep Consistent

Across all these screens:

- Use one clear primary action per section.
- Group secondary actions.
- Prefer tabs for large content domains.
- Prefer accordions for long repeatable sections.
- Prefer modals for:
  - confirmation with reason
  - add/edit secondary forms
  - infrequent actions
- Prefer drawers for:
  - contextual detail without losing list position
  - editing side content while keeping the main list visible
- Use compact cards, not tall decorative blocks.
- Keep tables focused on scan-first information.
- Avoid repeating the same status in multiple places in the same viewport.

## Suggested Working Method For Another Conversation

When continuing this work:

1. Start by opening this document.
2. Read the files listed for the phase you are implementing.
3. Preserve existing logic and event handlers.
4. Reorganize template structure first.
5. Only adjust TypeScript when needed for:
   - UI state
   - tab state
   - modal state
   - drawer state
   - collapsible state
6. Do not modify API shape or backend assumptions.
7. After each phase, manually verify:
   - no broken bindings
   - no broken actions
   - scroll is reduced
   - primary actions remain easy to find

## Good First Delivery

If another conversation starts implementing, the best first concrete milestone is:

1. Refactor `booking-file-page.component.html`
2. Split the current `overview` into clearer tabs
3. Convert detailed itinerary days into accordions
4. Move secondary actions out of the always-visible header

After that:

1. Refactor `service-order-detail.component.ts`
2. Move stage-comment and attachment creation into modals
3. Compact the top detail area

## Output Expectation For The Next Conversation

The next conversation should implement visual and structural improvements only, while keeping all existing flows working:

- same routes
- same services
- same actions
- same data
- cleaner layout
- less scroll
- better hierarchy
- lower saturation

