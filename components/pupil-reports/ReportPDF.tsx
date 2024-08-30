"use client";

import { useCallback, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useResizeObserver } from "@wojtekmaj/react-hooks";

import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import Spinner from "../Spinner";
import { Student } from "@/types/types";

// set source for the PDF.js worker script, necessary for rendering PDFs. Because rendering PDF documents can be resource-intensive, PDF.js uses a web worker to offload this task to a separate thread.
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

const options = {
  cMapUrl: "/cmaps/", // for correctly rendering fonts in PDFs, esp non-standard/complex scripts - e.g Chinese, Japanese.
  standardFontDataUrl: "/standard_fonts/", // location of standard font data files used by PDF.js to render fonts like Helvetica, Times, Courier etc. that are embedded in the doc
};

const resizeObserverOptions = {};

const ReportPDF = ({
  selectedReport,
  selectedStudent,
}: {
  selectedReport: string | File | undefined;
  selectedStudent: Student;
}) => {
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  function onDocumentLoadSuccess({
    numPages: nextNumPages,
  }: PDFDocumentProxy): void {
    setNumPages(nextNumPages);
  }

  // update containerWidth when container’s size changes, helping to dynamically update width of rendered PDF pages (entries parameter = an array of ResizeObserverEntry objects)
  const onResize = useCallback<ResizeObserverCallback>((entries) => {
    // destructure 1st entry from the array
    const [entry] = entries;
    if (entry) {
      setContainerWidth(entry.contentRect.width);
    }
  }, []);

  // monitor container’s size and trigger onResize callback
  useResizeObserver(containerRef, resizeObserverOptions, onResize);

  const errorMessage = (
    <div className="flex flex-col w-full justify-center items-center">
      <p className="m-4 text-xl text-center">
        Failed to load the report as a PDF file...
      </p>
      <p className="text-center">Please try refreshing the page</p>
      <p className="text-center">
        If the problem persists, please contact support
      </p>
      <p className="text-center">🤙</p>
    </div>
  );

  const loadingMessage = (
    <div className="flex flex-col justify-center items-center">
      <Spinner
        text={`Loading report PDF for ${selectedStudent.forename}  ${selectedStudent.surname} ...`}
      />
    </div>
  );

  return (
    <div className="md:w-3/4">
      <div className="md:max-w-200 m-auto" ref={setContainerRef}>
        <Document
          file={selectedReport}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
          error={errorMessage}
          loading={loadingMessage}
        >
          {Array.from(new Array(numPages), (_element, index) => (
            <Page
              className="mb-8 shadow-lg"
              key={`page_${index + 1}`}
              pageNumber={index + 1} // which page from PDF file should be displayed. If provided, pageIndex prop is ignored.
              width={containerWidth}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default ReportPDF;
