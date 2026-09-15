const {
  TAX_LABEL,
  PROGRAMS,
  getStore,
  findProgram,
  findProof,
  invoiceForProof,
  decorateInvoice,
} = require('./_lib/store');
const { requireRoles, getStudentName, send } = require('./_lib/auth');

// GET  /api/invoices — admin/staff: all invoices; student: only own (x-student-name).
// POST /api/invoices — staff/admin: create from typed studentName + programName + approved proofId.
// Amounts are ALWAYS the stored tax-inclusive program price; tax is never added again.
module.exports = function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    const role = requireRoles(req, res, ['administrator', 'staff', 'student']);
    if (!role) return;
    let invoices = store.invoices;
    if (role === 'student') {
      const name = getStudentName(req);
      if (!name) return send(res, 400, { error: 'Student role must send the x-student-name header.' });
      invoices = invoices.filter((i) => i.studentName.toLowerCase() === name.toLowerCase());
    }
    return send(res, 200, { taxLabel: TAX_LABEL, invoices: invoices.map(decorateInvoice) });
  }

  if (req.method === 'POST') {
    const role = requireRoles(req, res, ['administrator', 'staff']);
    if (!role) return;
    const body = req.body || {};

    if ('studentEmail' in body || 'email' in body) {
      return send(res, 400, { error: 'Student email addresses are not collected or stored.' });
    }
    const studentName = String(body.studentName || '').trim();
    if (!studentName) return send(res, 400, { error: 'studentName is required (typed field).' });

    const program = findProgram(body.programName);
    if (!program) {
      return send(res, 400, { error: 'Unknown program. Choose one of: ' + PROGRAMS.map((p) => p.name).join(', ') });
    }

    const proofId = String(body.proofId || '').trim();
    const proof = findProof(proofId);
    if (!proof) return send(res, 404, { error: "Payment proof '" + proofId + "' not found." });
    if (proof.status !== 'approved') {
      return send(res, 409, { error: 'Proof ' + proof.proofId + " has status '" + proof.status + "'. Only approved proofs may be attached." });
    }
    const existing = invoiceForProof(store, proof.proofId);
    if (existing) {
      return send(res, 409, { error: 'Proof ' + proof.proofId + ' is already linked to invoice ' + existing.id + '. One proof per invoice.' });
    }

    const invoice = {
      id: 'INV-428-' + String(store.nextInvoiceSeq++).padStart(3, '0'),
      sourceId: 'manual',
      studentName: studentName,
      programName: program.name,
      taxInclusiveAmount: program.taxInclusivePrice,
      currency: program.currency,
      taxLabel: TAX_LABEL,
      proofId: proof.proofId,
      status: 'issued',
      issuedAt: new Date().toISOString().slice(0, 10),
    };
    store.invoices.push(invoice);
    return send(res, 201, {
      invoice: decorateInvoice(invoice),
      message: 'Invoice created. Amount is the stored tax-inclusive program price; no tax was added.',
    });
  }

  res.setHeader('allow', 'GET, POST');
  return send(res, 405, { error: 'Method not allowed' });
};
