const { PROGRAMS, TAX_LABEL } = require('./_lib/store');
const { requireRoles, send } = require('./_lib/auth');

// GET /api/programs — program catalog with tax-inclusive prices (all roles).
module.exports = function handler(req, res) {
  if (req.method !== 'GET') { res.setHeader('allow', 'GET'); return send(res, 405, { error: 'Method not allowed' }); }
  const role = requireRoles(req, res, ['administrator', 'staff', 'faculty', 'student']);
  if (!role) return;
  return send(res, 200, { taxLabel: TAX_LABEL, programs: PROGRAMS });
};
