const { getStore, findProgram } = require('./_lib/store');
const { requireRoles, send } = require('./_lib/auth');

// GET  /api/materials — all roles; students only see materials shared with enrolled students.
// POST /api/materials — faculty/admin: share a material (text only, no fabricated file URLs).
module.exports = function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    const role = requireRoles(req, res, ['administrator', 'staff', 'faculty', 'student']);
    if (!role) return;
    const materials = role === 'student'
      ? store.materials.filter((m) => m.visibility === 'enrolled')
      : store.materials;
    return send(res, 200, { materials });
  }

  if (req.method === 'POST') {
    const role = requireRoles(req, res, ['faculty', 'administrator']);
    if (!role) return;
    const body = req.body || {};
    if ('url' in body || 'link' in body) {
      return send(res, 400, { error: 'External file URLs are not stored: a working authorized integration is required first.' });
    }
    const program = findProgram(body.program);
    if (!program) return send(res, 400, { error: 'Unknown program.' });
    const title = String(body.title || '').trim();
    const description = String(body.description || '').trim();
    const visibility = String(body.visibility || 'enrolled');
    if (!title || !description) return send(res, 400, { error: 'title and description are required.' });
    if (!['enrolled', 'staff-only'].includes(visibility)) {
      return send(res, 400, { error: "visibility must be 'enrolled' or 'staff-only'." });
    }
    const material = {
      id: 'MAT-' + String(store.nextMatSeq++).padStart(3, '0'),
      program: program.name,
      title, description, visibility,
    };
    store.materials.push(material);
    return send(res, 201, { material });
  }

  res.setHeader('allow', 'GET, POST');
  return send(res, 405, { error: 'Method not allowed' });
};
