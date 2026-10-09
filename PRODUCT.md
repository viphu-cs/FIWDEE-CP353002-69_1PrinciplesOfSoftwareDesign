# Product

## Register

product

## Users
- **Owner (ผู้บริหาร / เจ้าของร้าน):** Needs strategic financial visibility (revenue, commission, room occupancy), full catalog control (services, pricing, rooms, therapist skills), and security oversight (active sessions, force logout).
- **Receptionist (พนักงานต้อนรับหน้าร้าน):** Manages real-time front-desk flow: customer check-in, walk-in queue creation, room & therapist assignment, service start/completion, and payment processing.
- **Therapist (หมอนวด):** Reviews personal daily shifts, checks customer medical/massage preference notes before treatments, executes start/complete service milestones, and tracks earned commissions.
- **Customer (ลูกค้า):** Explores authentic Thai wellness treatments, books appointments with preferred therapists and time slots, selects massage pressure and health precautions, pays via QR PromptPay, and writes reviews.

## Product Purpose
FIWDEE is a boutique Thai massage management and online booking platform designed for CP353002-69 Principles of Software Design. It solves critical massage parlor operational bottlenecks: eliminating double bookings through dynamic availability calculation, preventing front-desk queue chaos with live state-driven workflows, enforcing sanitization turnaround buffers (15-min cleaning between sessions), and providing complete financial transparency for commissions and revenue.

## Brand Personality
- **Refined Thai Hospitality:** Dignified, welcoming, mindful, and culturally authentic without stereotypical clichés.
- **Contemplative Stillness:** Calming visual pacing, spacious margins, warm natural materiality (teak, linen, terracotta).
- **Operational Authoritative Clarity:** For admin and back-office staff, controls are direct, fast, high-contrast, and deeply trustworthy.

## Anti-references
- **Generic SaaS AI Clichés:** No dark purple/blue neon gradients, no glassmorphism cards, no arbitrary metric cards with tiny tracked uppercase eyebrows.
- **Chaotic Spreadsheet Aesthetic:** No overwhelming dense grids with unstyled borders; clarity and rhythm over raw clutter.
- **Playful Cartoon / Emoji Overuse:** Avoid casual cartoon mascots or excessive emojis that dilute the boutique sanctuary brand.
- **Rigid Hard-Coding:** Never hard-code room count (6 rooms) or therapist count (6 therapists); all resources are dynamically loaded from DB.

## Design Principles
- **Dynamic Resource Principle:** Every room, therapist, service duration option, and business hour is database-driven and scalable.
- **Fidelity to State & Strategy Patterns:** Back-office UI strictly mirrors the backend GoF State pattern (PENDING -> CONFIRMED -> CHECKED_IN -> IN_SERVICE -> COMPLETED) and immutable payment records.
- **Tactile Material Stratification:** Surfaces follow natural materiality: Warm Ivory canvas (`#F7F5F0`), Linen surface containers (`#EFECE6`), Deep Teak typography/CTAs (`#2B1E16`), and Muted Terracotta highlights (`#B86A4C`).
- **Immediate Operational Readability:** Front-desk receptionists can assess queue status and room availability at a glance under active store lighting.

## Accessibility & Inclusion
- **WCAG AA Compliance:** Body text and operational labels strictly maintain >= 4.5:1 contrast against warm ivory and linen backgrounds.
- **Touch Targets:** Minimum 44x44px touch targets for tablet-based front-desk and therapist mobile operations.
- **Reduced Motion:** Respects `prefers-reduced-motion` with instant or subtle crossfades instead of disruptive motion.
