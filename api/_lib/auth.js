// Demo role enforcement for the portal. Pages send the selected role via the
// 'x-role' header; every API route re-checks it server-side. No accounts are
// created; students identify themselves by typed name only (no emails).

const ROLES = ['administrator', 'staff', 'faculty', 'student'];

function getRole(req) {
  const r = String(req.headers['x-role'] || '').toLowerCase();
  return ROLES.includes(r) ? r : null;
}

function getStudentName(req) {
  return String(req.headers['x-student-name'] || '').trim();
}

function send(res, code, payload) {
  res.status(code);
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(payload));
}

// Returns the validated role, or sends an error response and returns null.
function requireRoles(req, res, allowed) {
  const role = getRole(req);
  if (!role) {
    send(res, 401, { error: 'Missing or unknown role. Send a valid x-role header.' });
    return null;
  }
  if (!allowed.includes(role)) {
    send(res, 403, { error: "Role '" + role + "' is not allowed to access this resource." });
    return null;
  }
  return role;
}

module.exports = { ROLES, getRole, getStudentName, send, requireRoles };
