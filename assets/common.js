(function () {
  const ROLE_KEY = 'ccp.role';
  const NAME_KEY = 'ccp.studentName';
  window.CCP = {
    getRole: () => localStorage.getItem(ROLE_KEY) || '',
    setRole: (r) => localStorage.setItem(ROLE_KEY, r),
    getStudent: () => localStorage.getItem(NAME_KEY) || '',
    setStudent: (n) => localStorage.setItem(NAME_KEY, n),

    api: async (path, opts = {}) => {
      const headers = Object.assign({ 'x-role': CCP.getRole(), 'x-student-name': CCP.getStudent() }, opts.headers || {});
      const o = Object.assign({}, opts);
      if (o.body && typeof o.body === 'object') { headers['content-type'] = 'application/json'; o.body = JSON.stringify(o.body); }
      o.headers = headers;
      return fetch(path, o);
    },

    downloadPdf: async (id) => {
      const res = await CCP.api('/api/invoice-pdf?id=' + encodeURIComponent(id));
      if (!res.ok) {
        let msg = 'Download failed';
        try { msg = (await res.json()).error || msg; } catch (e) {}
        alert(msg);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = id + '-clearpath-invoice.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },

    chrome: (active) => {
      const roles = ['administrator', 'staff', 'faculty', 'student'];
      const links = [['index', 'Home'], ['staff', 'Staff'], ['faculty', 'Faculty'], ['student', 'Student'], ['admin', 'Admin']];
      const nav = links.map(([k, l]) => `<a href="/${k === 'index' ? '' : k}" class="${k === active ? 'active' : ''}">${l}</a>`).join('');
      const sel = `<select id="role-select" aria-label="Role"><option value="">Select role…</option>${roles.map(r => `<option value="${r}" ${r === CCP.getRole() ? 'selected' : ''}>${r}</option>`).join('')}</select>`;
      document.getElementById('site-header').innerHTML = `<div class="brand">Clearpath Coding Academy</div><nav>${nav}</nav><div>${sel}</div>`;
      document.getElementById('site-footer').innerHTML =
        '<p>Clearpath Coding Academy · Education portal · All prices are tax-inclusive — &ldquo;Price includes applicable tax&rdquo;. No tax is added at invoicing.</p>' +
        '<p><a href="/">Home</a> · <a href="/staff">Staff invoicing</a> · <a href="/faculty">Faculty</a> · <a href="/student">Student</a> · <a href="/admin">Admin</a></p>';
      document.getElementById('role-select').addEventListener('change', (e) => { CCP.setRole(e.target.value); location.reload(); });
    },

    guardNote: (allowed) => {
      const r = CCP.getRole();
      const el = document.getElementById('guard-note');
      if (!el) return true;
      if (!r) { el.textContent = 'Select a role in the header to use this page.'; el.className = 'note warn'; return false; }
      if (!allowed.includes(r)) { el.textContent = `Current role '${r}' cannot use this page. Allowed: ${allowed.join(', ')}.`; el.className = 'note warn'; return false; }
      el.textContent = `Active role: '${r}'.`;
      el.className = 'note ok';
      return true;
    }
  };
})();
