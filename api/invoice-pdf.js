const { getStore, findProof } = require('./_lib/store');
const { requireRoles, getStudentName, send } = require('./_lib/auth');
const { buildInvoicePdf } = require('./_lib/pdf');

// GET /api/invoice-pdf?id=INV-428-001 — branded PDF download.
// admin/staff: any invoice; student: only their own (x-student-name must match).
module.exports = function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('allow', 'GET'); return send(res, 405, { error: 'Method not allowed' }); }
  const role = requireRoles(req, res, ['administrator', 'staff', 'student']);
  if (!role) return;

  const store = getStore();
  const id = String((req.query && req.query.id) || '');
  const invoice = store.invoices.find((i) => i.id === id);
  if (!invoice) return send(res, 404, { error: "Invoice '" + id + "' not found." });

  if (role === 'student') {
    const name = getStudentName(req);
    if (!name || invoice.studentName.toLowerCase() !== name.toLowerCase()) {
      return send(res, 403, { error: 'Students may only download their own invoices.' });
    }
  }

  const proof = invoice.proofId ? findProof(invoice.proofId) : null;
  const pdf = buildInvoicePdf(invoice, proof);
  res.status(200);
  res.setHeader('content-type', 'application/pdf');
  res.setHeader('content-disposition', 'attachment; filename="' + invoice.id + '-clearpath-invoice.pdf"');
  res.setHeader('content-length', pdf.length);
  res.end(pdf);
};
