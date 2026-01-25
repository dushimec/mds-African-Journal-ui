import React from "react";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface PDFViewerProps {
  submissionId: string;
  height?: number;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  submissionId,
  height = 800,
}) => {
  if (!submissionId) {
    return (
      <div
        className="w-full flex items-center justify-center text-gray-500"
        style={{ height }}
      >
        No Submission ID provided
      </div>
    );
  }

  // Backend route that streams the PDF
  const pdfUrl = `${BACKEND_URL}/article/mds/${encodeURIComponent(
    submissionId
  )}/pdf`;

  // PDF.js viewer
  const viewerUrl = `/pdfjs/web/viewer.html?file=${encodeURIComponent(
    pdfUrl
  )}`;

  return (
    <div className="pdf-viewer w-full">
      <iframe
        src={viewerUrl}
        className="w-full border rounded-lg"
        style={{ height }}
        title="Article PDF Viewer"
      />
    </div>
  );
};

export default PDFViewer;

