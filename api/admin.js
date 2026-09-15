const {
  TAX_LABEL,
  PROGRAMS,
  PAYMENT_PROOFS,
  SKIPPED_SOURCES,
  getStore,
  invoiceForProof,
  decorateInvoice,
} = require('./_lib/store');
const { ROLES, requireRoles, send } = require('./_lib/auth');

// GET  /api/admin — administrator only: roles, programs, invoices, proofs, skipped sources.
// POST /api/admin — administrator only: { action: 'void', invoiceId } voids an invoice
// (the linked proof becomes usable again).
module.exports = function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    const role = requireRoles(req, res, ['administrator']);
    if (!role) return;
    const proofs = PAYMENT_PROOFS.map((p) => {
      const inv = invoiceForProof(store, p.proofId);
      return Object.assign({}, p, { linkedInvoiceId: inv ? inv.id : null, usable: p.status === 'approved' && !inv });
    });
    return send(res, 200, {
      taxLabel: TAX_LABEL,
      roles: ROLES,
      programs: PROGRAMS,
      invoices: store.invoices.map(decorateInvoice),
      proofs,
      skippedSources: SKIPPED_SOURCES,
    });
  }

  if (req.method === 'POST') {
    const role = requireRoles(req, res, ['administrator']);
    if (!role) return;
    const body = req.body || {};
    if (body.action !== 'void') return send(res, 400, { error: "Unsupported action. Use { action: 'void', invoiceId }." });
    const invoice = store.invoices.find((i) => i.id === String(body.invoiceId || ''));
    if (!invoice) return send(res, 404, { error: 'Invoice not found.' });
    if (invoice.status === 'void') return send(res, 409, { error: 'Invoice is already void.' });
    invoice.status = 'void';
    return send(res, 200, { invoice: decorateInvoice(invoice), message: 'Invoice voided; the linked proof is usable again.' });
  }

  res.setHeader('allow', 'GET, POST');
  return send(res, 405, { error: 'Method not allowed' });
};
