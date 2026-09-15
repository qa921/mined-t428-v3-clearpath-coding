# mined-t428-v3-clearpath-coding

Role-based education portal for Clearpath Coding Academy (fixture MINED-T428-V3).

## What is implemented
- Role workspaces: administrator, staff, faculty, student (demo role selected in the page header, enforced again on every API route via the `x-role` header).
- Staff invoice workbench: type a student name, pick a program, attach one **approved** payment proof, create the invoice and download a **branded PDF**.
- Tax rule: stored program prices are **tax-inclusive** and final. The note "Price includes applicable tax" and the same amount are shown identically on screen, in the invoice list, in API responses and in the PDF. Tax is never added again.
- Proof linkage is visible to staff/admin (which proof belongs to which invoice). Revoked or pending-review proofs cannot be attached; one proof per invoice.
- No student email addresses are collected or invented; no unnecessary accounts are created; billing emails are omitted.
- Faculty manage class schedules and share materials (meeting links are not stored — they require a working authorized integration). Students see only their own enrollments, invoices, schedule and enrolled materials. Admins manage invoice records (void) and review skipped source records.

## Structure
- `index.html`, `staff.html`, `faculty.html`, `student.html`, `admin.html`, `assets/` — static frontend.
- `api/` — Vercel serverless functions (`invoices`, `invoice-pdf`, `proofs`, `programs`, `schedule`, `materials`, `admin`). Shared helpers live in `api/_lib/`.
- `data/` — original fixture inputs (schema, additions, invoice workbench fixtures). Unmodified.

## Notes
- In-memory store: seeded records are always present; records created at runtime persist only while a serverless instance is warm.
- Seeded invoices INV-428-001..016 use only approved proofs PP-428-001..016. SRC-428-17/18 (revoked/pending proof), SRC-428-19/20 (no proof) and SRC-428-21..24 (proof already linked elsewhere) are intentionally not converted into invoices; see the Admin page for details.
