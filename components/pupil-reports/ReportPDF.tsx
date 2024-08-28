"use client";

import { useCallback, useEffect, useState } from "react";
import { pdfjs, Document, Page } from "react-pdf";
import { useResizeObserver } from "@wojtekmaj/react-hooks";

import type { PDFDocumentProxy } from "pdfjs-dist";

import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

import { Student } from "@/types/types";

// set source for the PDF.js worker script, necessary for rendering PDFs
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

const options = {
  cMapUrl: "/cmaps/", // for correctly rendering fonts in PDFs, esp non-standard/complex scripts - e.g Chinese, Japanese.
  standardFontDataUrl: "/standard_fonts/", // location of standard font data files used by PDF.js to render fonts like Helvetica, Times, Courier etc. that are embedded in the doc
};

const resizeObserverOptions = {};

const ReportPDF = ({
  signedUrls,
  classStudents,
  selectedStudent,
}: {
  signedUrls: Array<{ id: string; signedUrl: string } | null>;
  classStudents: Array<{
    student: Student;
    class_id: number;
    student_id: number;
    id: number;
  }>;
  selectedStudent: Student;
}) => {
  const [pdfFile, setPdfFile] = useState<string | undefined>(
    signedUrls[
      signedUrls.findIndex(
        (item) =>
          Number(item?.id) === // find file name that, without .pdf file type, equals class_student table id
          classStudents[
            classStudents.findIndex(
              //
              (classStudent) => classStudent.student_id === selectedStudent.id
            )
          ].id
      )
    ]?.signedUrl
  );
  const [numPages, setNumPages] = useState<number>();
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>();

  // update selectedPdf on selectedStudent change
  useEffect(() => {
    const classStudentId =
      classStudents[
        classStudents.findIndex(
          (classStudent) => classStudent.student_id === selectedStudent.id
        )
      ].id;

    const selectedUrl =
      signedUrls[
        signedUrls.findIndex(
          (pdf) =>
            pdf?.id === // file name, without .pdf file type, equals the class_student table id
            `${classStudentId}.pdf`
        )
      ]?.signedUrl;
    setPdfFile(selectedUrl);
  }, [selectedStudent, classStudents, signedUrls]);

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

  return (
    <div className="md:w-3/4">
      <div className="md:max-w-200 m-auto" ref={setContainerRef}>
        <Document
          file={pdfFile}
          onLoadSuccess={onDocumentLoadSuccess}
          options={options}
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
