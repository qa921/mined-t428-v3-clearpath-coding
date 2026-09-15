const { PAYMENT_PROOFS, getStore, invoiceForProof } = require('./_lib/store');
const { requireRoles, send } = require('./_lib/auth');

// GET /api/proofs — staff/admin: payment proofs with invoice linkage.
// Shows which proof is linked to which invoice; revoked/pending proofs are never usable.
module.exports = function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('allow', 'GET'); return send(res, 405, { error: 'Method not allowed' }); }
  const role = requireRoles(req, res, ['administrator', 'staff']);
  if (!role) return;
  const store = getStore();
  const proofs = PAYMENT_PROOFS.map((p) => {
    const inv = invoiceForProof(store, p.proofId);
    return {
      proofId: p.proofId,
      type: p.type,
      receivedAt: p.receivedAt,
      status: p.status,
      linkedInvoiceId: inv ? inv.id : null,
      usable: p.status === 'approved' && !inv,
    };
  });
  return send(res, 200, { proofs });
};
