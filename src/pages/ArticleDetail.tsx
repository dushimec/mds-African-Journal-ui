import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  User,
  BookOpen,
  FileText,
} from "lucide-react";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const ArticleDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  // Fetch article details
  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) {
        toast.error("Article ID not provided");
        navigate("/journal");
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/submission/${id}`);
        if (res.data.success && res.data.data) {
          setArticle(res.data.data);
        } else {
          toast.error("Article not found");
          navigate("/journal");
        }
      } catch (error) {
        console.error("Error fetching article:", error);
        toast.error("Failed to load article details");
        navigate("/journal");
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id, navigate]);

  const getPdfUrl = (article: any) => {
    if (article.volume && article.issue && article.seoPdfName) {
      return `${BACKEND_URL.replace('/api/v1', '')}/vol${article.volume}/issue${article.issue}/${article.seoPdfName}`;
    }
    if (article.doiSlug) {
      return `${BACKEND_URL}/article/${article.doiSlug}/download`;
    }
    return null;
  };

  const handleDownloadFile = async (file: any) => {
    if (!file || !file.fileUrl) {
      toast.error("File URL not available");
      return;
    }

    try {
      setDownloadingFile(file.id);
      const response = await axios.get(file.fileUrl, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.fileName || "document.pdf");
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("File downloaded successfully");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloadingFile(null);
    }
  };

  const handleViewPdf = async () => {
    const pdfUrl = getPdfUrl(article);
    if (pdfUrl) {
      try {
        window.open(pdfUrl, "_blank");
      } catch (error) {
        console.error("Error opening PDF:", error);
        toast.error("Failed to open PDF");
      }
    } else {
      toast.error("PDF not available for this article");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/journal")}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal
          </Button>

          <div className="space-y-8">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const pdfUrl = getPdfUrl(article);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/journal")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Journal
        </Button>

        {/* Main Article Card */}
        <Card className="shadow-lg mb-8">
          <CardHeader>
            <div className="space-y-4">
              {/* Badge and Meta */}
              <div className="flex flex-wrap gap-2 items-center">
                <Badge>{article.topic?.name || "General"}</Badge>
                <Badge variant="outline">
                  Vol {article.volume} | Issue {article.issue}
                </Badge>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {article.manuscriptTitle || "Untitled Article"}
                </h1>
              </div>

              {/* Authors */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  <span className="font-medium">
                    {Array.isArray(article.authors) && article.authors.length > 0
                      ? article.authors
                          .map(
                            (a: any) =>
                              `${a.fullName}${a.affiliation ? ` (${a.affiliation})` : ""}`
                          )
                          .join("; ")
                      : "Unknown Author"}
                  </span>
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Published: {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center">
                  <Eye className="mr-1 h-4 w-4" />
                  Views: {article.views || 0}
                </div>
                <div className="flex items-center">
                  <Download className="mr-1 h-4 w-4" />
                  Downloads: {article.downloads || 0}
                </div>
              </div>

              {/* DOI */}
              {article.doiSlug && (
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <strong>DOI:</strong> {article.doiSlug}
                  </p>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Abstract */}
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Abstract
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {article.abstract || "No abstract available"}
              </p>
            </div>

            {/* Keywords */}
            {article.keywords && (
              <div>
                <h3 className="text-lg font-bold mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords
                    .split(",")
                    .map((keyword: string, index: number) => (
                      <Badge key={index} variant="secondary">
                        {keyword.trim()}
                      </Badge>
                    ))}
                </div>
              </div>
            )}

            {/* Files Section */}
            {article.files && article.files.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Associated Files
                </h3>
                <div className="space-y-3">
                  {article.files.map((file: any) => (
                    <Card key={file.id} className="border">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium break-words">{file.fileName}</p>
                          <p className="text-sm text-muted-foreground">
                            {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          disabled={downloadingFile === file.id}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloadingFile === file.id ? "Downloading..." : "Download"}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {pdfUrl && (
                <>
                  <Button
                    onClick={handleViewPdf}
                    className="flex-1 sm:flex-initial"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Full Document
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        {article.declarations && article.declarations.length > 0 && (
          <Card className="bg-secondary/5">
            <CardHeader>
              <CardTitle className="text-lg">Declarations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {article.declarations.map((decl: any, idx: number) => (
                  <li key={idx} className="text-sm">
                    • {decl.text}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ArticleDetail;
