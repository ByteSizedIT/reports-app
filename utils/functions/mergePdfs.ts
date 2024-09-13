import { PDFDocument } from "pdf-lib";

async function mergePdfs(pdfUrls: Array<string>) {
  const mergedPdf = await PDFDocument.create();
  for (const url of pdfUrls) {
    const response = await fetch(url);
    // arrayBuffer = JS object type used to represent generic, fixed-length raw binary data - you can use typed arrays (e.g., Uint8Array, Float32Array) or DataView to provide views to interpret and manipulate the binary data.
    const pdfBytes = await response.arrayBuffer();
    // Bytes converted in to a PDFDocument object for manipulating:
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const copiedPages = await mergedPdf.copyPages(
      pdfDoc,
      pdfDoc.getPageIndices()
    );
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }
  //   After manipulating, converted back to a binary Uint8Array using save()
  return await mergedPdf.save();
}

export default mergePdfs;

// See notes: ./reports-app/xx-reference-notes-xx/pdf-lib.txt for more info on pdf-lib
