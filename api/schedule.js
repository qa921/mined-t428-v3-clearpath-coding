const { getStore, findProgram } = require('./_lib/store');
const { requireRoles, send } = require('./_lib/auth');

// GET  /api/schedule — all roles: class schedule.
// POST /api/schedule — faculty/admin: add a class. Meeting links are rejected:
// links/notifications require a working authorized integration, so none are stored.
module.exports = function handler(req, res) {
  const store = getStore();

  if (req.method === 'GET') {
    const role = requireRoles(req, res, ['administrator', 'staff', 'faculty', 'student']);
    if (!role) return;
    return send(res, 200, { classes: store.schedule });
  }

  if (req.method === 'POST') {
    const role = requireRoles(req, res, ['faculty', 'administrator']);
    if (!role) return;
    const body = req.body || {};
    if ('meetingUrl' in body || 'url' in body || 'link' in body) {
      return send(res, 400, { error: 'Meeting links are not stored: a working authorized integration is required first.' });
    }
    const program = findProgram(body.program);
    if (!program) return send(res, 400, { error: 'Unknown program.' });
    const title = String(body.title || '').trim();
    const date = String(body.date || '').trim();
    const startTime = String(body.startTime || '').trim();
    const facultyName = String(body.facultyName || '').trim();
    const room = String(body.room || '').trim();
    if (!title || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !startTime || !facultyName || !room) {
      return send(res, 400, { error: 'title, date (YYYY-MM-DD), startTime, facultyName and room are required.' });
    }
    const cls = {
      id: 'CLS-' + String(store.nextClassSeq++).padStart(3, '0'),
      program: program.name,
      title, date, startTime, facultyName, room,
    };
    store.schedule.push(cls);
    return send(res, 201, { class: cls });
  }

  res.setHeader('allow', 'GET, POST');
  return send(res, 405, { error: 'Method not allowed' });
};
