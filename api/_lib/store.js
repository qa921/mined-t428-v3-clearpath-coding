// Shared in-memory data store for the Clearpath Coding Academy portal.
// NOTE (serverless): state lives in a global cache and persists only while a
// function instance stays warm. Seeded records below are always present;
// runtime-created records may reset on cold start.

const TAX_LABEL = 'Price includes applicable tax';
const CURRENCY = 'USD';

const PROGRAMS = [
  { name: 'Web Foundations', taxInclusivePrice: 450, currency: CURRENCY },
  { name: 'Python Projects', taxInclusivePrice: 520, currency: CURRENCY },
  { name: 'Accessibility Study Skills', taxInclusivePrice: 260, currency: CURRENCY },
  { name: 'Research Writing Clinic', taxInclusivePrice: 340, currency: CURRENCY },
];

const PAYMENT_PROOFS = [
  { proofId: 'PP-428-001', type: 'card-settlement', receivedAt: '2026-08-28', status: 'approved' },
  { proofId: 'PP-428-002', type: 'bank-transfer', receivedAt: '2026-08-29', status: 'approved' },
  { proofId: 'PP-428-003', type: 'sponsor-authorization', receivedAt: '2026-08-30', status: 'approved' },
  { proofId: 'PP-428-004', type: 'card-settlement', receivedAt: '2026-08-31', status: 'approved' },
  { proofId: 'PP-428-005', type: 'bank-transfer', receivedAt: '2026-09-01', status: 'approved' },
  { proofId: 'PP-428-006', type: 'card-settlement', receivedAt: '2026-09-02', status: 'approved' },
  { proofId: 'PP-428-007', type: 'sponsor-authorization', receivedAt: '2026-09-03', status: 'approved' },
  { proofId: 'PP-428-008', type: 'bank-transfer', receivedAt: '2026-09-04', status: 'approved' },
  { proofId: 'PP-428-009', type: 'card-settlement', receivedAt: '2026-09-05', status: 'approved' },
  { proofId: 'PP-428-010', type: 'bank-transfer', receivedAt: '2026-09-06', status: 'approved' },
  { proofId: 'PP-428-011', type: 'card-settlement', receivedAt: '2026-09-07', status: 'approved' },
  { proofId: 'PP-428-012', type: 'sponsor-authorization', receivedAt: '2026-09-08', status: 'approved' },
  { proofId: 'PP-428-013', type: 'bank-transfer', receivedAt: '2026-09-09', status: 'approved' },
  { proofId: 'PP-428-014', type: 'card-settlement', receivedAt: '2026-09-10', status: 'approved' },
  { proofId: 'PP-428-015', type: 'bank-transfer', receivedAt: '2026-09-11', status: 'approved' },
  { proofId: 'PP-428-016', type: 'sponsor-authorization', receivedAt: '2026-09-12', status: 'approved' },
  { proofId: 'PP-428-017', type: 'card-settlement', receivedAt: '2026-09-13', status: 'revoked' },
  { proofId: 'PP-428-018', type: 'bank-transfer', receivedAt: '2026-09-14', status: 'pending-review' },
];

// Seeded invoices: only candidates whose payment proof is APPROVED.
// Amounts are the stored tax-inclusive program prices (no tax added).
const SEED_INVOICES = [
  { sourceId: 'SRC-428-01', studentName: 'Aiko Tanaka', programName: 'Web Foundations', taxInclusiveAmount: 450, proofId: 'PP-428-001', issuedAt: '2026-08-28' },
  { sourceId: 'SRC-428-02', studentName: 'Ren Sato', programName: 'Python Projects', taxInclusiveAmount: 520, proofId: 'PP-428-002', issuedAt: '2026-08-29' },
  { sourceId: 'SRC-428-03', studentName: 'Mina Kobayashi', programName: 'Accessibility Study Skills', taxInclusiveAmount: 260, proofId: 'PP-428-003', issuedAt: '2026-08-30' },
  { sourceId: 'SRC-428-04', studentName: 'Haruto Suzuki', programName: 'Research Writing Clinic', taxInclusiveAmount: 340, proofId: 'PP-428-004', issuedAt: '2026-08-31' },
  { sourceId: 'SRC-428-05', studentName: 'Yui Nakamura', programName: 'Web Foundations', taxInclusiveAmount: 450, proofId: 'PP-428-005', issuedAt: '2026-09-01' },
  { sourceId: 'SRC-428-06', studentName: 'Sora Ito', programName: 'Python Projects', taxInclusiveAmount: 520, proofId: 'PP-428-006', issuedAt: '2026-09-02' },
  { sourceId: 'SRC-428-07', studentName: 'Emi Watanabe', programName: 'Accessibility Study Skills', taxInclusiveAmount: 260, proofId: 'PP-428-007', issuedAt: '2026-09-03' },
  { sourceId: 'SRC-428-08', studentName: 'Daichi Yamamoto', programName: 'Research Writing Clinic', taxInclusiveAmount: 340, proofId: 'PP-428-008', issuedAt: '2026-09-04' },
  { sourceId: 'SRC-428-09', studentName: 'Koharu Mori', programName: 'Web Foundations', taxInclusiveAmount: 450, proofId: 'PP-428-009', issuedAt: '2026-09-05' },
  { sourceId: 'SRC-428-10', studentName: 'Riku Kato', programName: 'Python Projects', taxInclusiveAmount: 520, proofId: 'PP-428-010', issuedAt: '2026-09-06' },
  { sourceId: 'SRC-428-11', studentName: 'Hana Shimizu', programName: 'Accessibility Study Skills', taxInclusiveAmount: 260, proofId: 'PP-428-011', issuedAt: '2026-09-07' },
  { sourceId: 'SRC-428-12', studentName: 'Kenta Fujii', programName: 'Research Writing Clinic', taxInclusiveAmount: 340, proofId: 'PP-428-012', issuedAt: '2026-09-08' },
  { sourceId: 'SRC-428-13', studentName: 'Mei Okada', programName: 'Web Foundations', taxInclusiveAmount: 450, proofId: 'PP-428-013', issuedAt: '2026-09-09' },
  { sourceId: 'SRC-428-14', studentName: 'Takumi Abe', programName: 'Python Projects', taxInclusiveAmount: 520, proofId: 'PP-428-014', issuedAt: '2026-09-10' },
  { sourceId: 'SRC-428-15', studentName: 'Nana Hayashi', programName: 'Accessibility Study Skills', taxInclusiveAmount: 260, proofId: 'PP-428-015', issuedAt: '2026-09-11' },
  { sourceId: 'SRC-428-16', studentName: 'Yuto Inoue', programName: 'Research Writing Clinic', taxInclusiveAmount: 340, proofId: 'PP-428-016', issuedAt: '2026-09-12' },
];

// Source candidates deliberately NOT converted into invoices (see Admin page).
const SKIPPED_SOURCES = [
  { sourceId: 'SRC-428-17', studentName: 'Rina Ishikawa', reason: 'Proof PP-428-017 is revoked; revoked proofs must not be linked to invoices.' },
  { sourceId: 'SRC-428-18', studentName: 'Kei Matsuda', reason: 'Proof PP-428-018 is pending review; only approved proofs may be attached.' },
  { sourceId: 'SRC-428-19', studentName: 'Aya Ueda', reason: 'No payment proof supplied; staff may create the invoice once an approved proof exists.' },
  { sourceId: 'SRC-428-20', studentName: 'Shun Arai', reason: 'No payment proof supplied; staff may create the invoice once an approved proof exists.' },
  { sourceId: 'SRC-428-21', studentName: 'Mio Kondo', reason: 'References PP-428-003, already linked to INV-428-003; one proof per invoice.' },
  { sourceId: 'SRC-428-22', studentName: 'Toma Nakajima', reason: 'References PP-428-008, already linked to INV-428-008; one proof per invoice.' },
  { sourceId: 'SRC-428-23', studentName: 'Saki Oshima', reason: 'References PP-428-014, already linked to INV-428-014; one proof per invoice.' },
  { sourceId: 'SRC-428-24', studentName: 'Noa Kawaguchi', reason: 'References PP-428-016, already linked to INV-428-016; one proof per invoice.' },
];

function seedSchedule() {
  return [
    { id: 'CLS-001', program: 'Web Foundations', title: 'HTML & CSS Basics', date: '2026-09-21', startTime: '10:00', facultyName: 'A. Mori', room: 'Room 1' },
    { id: 'CLS-002', program: 'Python Projects', title: 'Data Pipelines Workshop', date: '2026-09-22', startTime: '13:00', facultyName: 'B. Sato', room: 'Room 2' },
    { id: 'CLS-003', program: 'Accessibility Study Skills', title: 'Screen Reader Lab', date: '2026-09-23', startTime: '11:00', facultyName: 'C. Ito', room: 'Room 1' },
    { id: 'CLS-004', program: 'Research Writing Clinic', title: 'Citation Practice', date: '2026-09-24', startTime: '15:00', facultyName: 'D. Abe', room: 'Room 3' },
  ];
}

function seedMaterials() {
  return [
    { id: 'MAT-001', program: 'Web Foundations', title: 'HTML cheat sheet', description: 'Core tags and page structure reference.', visibility: 'enrolled' },
    { id: 'MAT-002', program: 'Python Projects', title: 'Virtualenv setup guide', description: 'Step-by-step environment setup.', visibility: 'enrolled' },
    { id: 'MAT-003', program: 'Accessibility Study Skills', title: 'WCAG quick checklist', description: 'Perceivable and operable basics.', visibility: 'enrolled' },
    { id: 'MAT-004', program: 'Research Writing Clinic', title: 'Grading rubric (staff copy)', description: 'Internal rubric for reviewers.', visibility: 'staff-only' },
  ];
}

function seedInvoices() {
  return SEED_INVOICES.map((c, i) => ({
    id: 'INV-428-' + String(i + 1).padStart(3, '0'),
    sourceId: c.sourceId,
    studentName: c.studentName,
    programName: c.programName,
    taxInclusiveAmount: c.taxInclusiveAmount,
    currency: CURRENCY,
    taxLabel: TAX_LABEL,
    proofId: c.proofId,
    status: 'issued',
    issuedAt: c.issuedAt,
  }));
}

function getStore() {
  if (!globalThis.__ccpStore) {
    globalThis.__ccpStore = {
      invoices: seedInvoices(),
      nextInvoiceSeq: 17,
      schedule: seedSchedule(),
      nextClassSeq: 5,
      materials: seedMaterials(),
      nextMatSeq: 5,
    };
  }
  return globalThis.__ccpStore;
}

function findProgram(name) {
  const n = String(name || '').trim().toLowerCase();
  return PROGRAMS.find((p) => p.name.toLowerCase() === n) || null;
}

function findProof(proofId) {
  return PAYMENT_PROOFS.find((p) => p.proofId === proofId) || null;
}

function invoiceForProof(store, proofId) {
  return store.invoices.find((i) => i.proofId === proofId && i.status !== 'void') || null;
}

function displayAmount(o) {
  return o.currency + ' ' + Number(o.taxInclusiveAmount).toFixed(2);
}

function decorateInvoice(inv) {
  return Object.assign({}, inv, {
    displayAmount: displayAmount(inv),
    priceNote: inv.taxLabel,
    pdfUrl: '/api/invoice-pdf?id=' + encodeURIComponent(inv.id),
  });
}

module.exports = {
  TAX_LABEL,
  CURRENCY,
  PROGRAMS,
  PAYMENT_PROOFS,
  SKIPPED_SOURCES,
  getStore,
  findProgram,
  findProof,
  invoiceForProof,
  displayAmount,
  decorateInvoice,
};
