"use client";

import DOMPurify from "dompurify";

const ReportComment = ({ htmlComment }: { htmlComment: string }) => {
  return (
    <p
      dangerouslySetInnerHTML={{
        __html: DOMPurify.sanitize(htmlComment, {
          USE_PROFILES: { html: true },
        }),
      }}
    />
  );
};
export default ReportComment;
