const ReportComment = ({ htmlComment }: { htmlComment: string }) => {
  return (
    <p
      dangerouslySetInnerHTML={{
        __html: htmlComment,
      }}
    />
  );
};
export default ReportComment;
