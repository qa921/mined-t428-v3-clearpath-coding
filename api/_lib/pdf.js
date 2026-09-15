// Minimal dependency-free branded invoice PDF generator.
// Produces a valid single-page PDF (Helvetica) with the Clearpath brand,
// the tax-inclusive amount and the payment-proof reference.

function esc(s) {
  return String(s).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildInvoicePdf(invoice, proof) {
  const amount = invoice.currency + ' ' + Number(invoice.taxInclusiveAmount).toFixed(2);
  const lines = [
    { text: 'Clearpath Coding Academy', size: 22, bold: true, y: 752 },
    { text: 'Education Portal - Official Invoice', size: 12, bold: false, y: 730 },
    { text: 'Invoice: ' + invoice.id, size: 13, bold: true, y: 692 },
    { text: 'Issued: ' + invoice.issuedAt, size: 11, bold: false, y: 674 },
    { text: 'Student: ' + invoice.studentName, size: 11, bold: false, y: 652 },
    { text: 'Program: ' + invoice.programName, size: 11, bold: false, y: 634 },
    { text: 'Amount due: ' + amount, size: 14, bold: true, y: 606 },
    { text: invoice.taxLabel + ' - stored price is tax-inclusive; no additional tax is added.', size: 10, bold: false, y: 588 },
    {
      text: proof
        ? 'Payment proof: ' + proof.proofId + ' (' + proof.type + ', ' + proof.status + ', received ' + proof.receivedAt + ')'
        : 'Payment proof: none linked',
      size: 10, bold: false, y: 566,
    },
    { text: 'Status: ' + invoice.status, size: 10, bold: false, y: 548 },
    { text: 'Thank you for learning with Clearpath Coding Academy.', size: 10, bold: false, y: 500 },
  ];

  let stream = 'BT\n';
  for (const l of lines) {
    stream += '/' + (l.bold ? 'F2' : 'F1') + ' ' + l.size + ' Tf 1 0 0 1 72 ' + l.y + ' Tm (' + esc(l.text) + ') Tj\n';
  }
  stream += 'ET';

  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    '<< /Length ' + Buffer.byteLength(stream, 'latin1') + ' >>\nstream\n' + stream + '\nendstream',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets = [];
  objects.forEach((body, i) => {
    offsets[i + 1] = Buffer.byteLength(pdf, 'latin1');
    pdf += (i + 1) + ' 0 obj\n' + body + '\nendobj\n';
  });
  const xrefPos = Buffer.byteLength(pdf, 'latin1');
  pdf += 'xref\n0 7\n0000000000 65535 f \n';
  for (let i = 1; i <= 6; i++) {
    pdf += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  pdf += 'trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n' + xrefPos + '\n%%EOF';
  return Buffer.from(pdf, 'latin1');
}

module.exports = { buildInvoicePdf };
