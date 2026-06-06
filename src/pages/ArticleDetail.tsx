import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import {
  ArrowLeft,
  Download,
  Eye,
  Calendar,
  User,
  BookOpen,
  FileText,
  Copy,
  Check,
  Share2,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  generateAPACitation,
  generateMLACitation,
  generateChicagoCitation,
  generateHarvardCitation,
  generateBibTeXCitation,
  generateRISCitation,
  copyToClipboard,
} from "@/lib/citationFormats";
import { setupArticlePageSEO } from "@/lib/seoMetadata";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const BACKEND_URL = import.meta.env.VITE_API_URL;

const ArticleDetail = () => {
  const { id: slug } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // Fetch article details
  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        toast.error("Article slug not provided");
        navigate("/journal");
        return;
      }

      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/submission/by-slug/${slug}`);
        if (res.data.success && res.data.data) {
          const articleData = res.data.data;
          setArticle(articleData);

          // Setup SEO metadata with DOI for Google indexing
          const pageUrl = `${window.location.origin}/article/${slug}`;
          setupArticlePageSEO(articleData, pageUrl);
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
  }, [slug, navigate]);

  const getPdfUrl = (article: any) => {
    // Primary: use volume/issue/seoPdfName format /:volume/:issue/:slug.pdf
    if (article.volume && article.issue && article.seoPdfName) {
      return `/vol${article.volume}/issue${article.issue}/${article.seoPdfName}`;
    }
    // Fallback: use doiSlug if available
    if (article.doiSlug) {
      return `/article-pdf/${encodeURIComponent(article.doiSlug)}/url`;
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
  

 const handleViewPdf = async (article: any) => {
     const pdfUrl = getPdfUrl(article);
     if (pdfUrl) {
       window.open(pdfUrl, '_blank');
     } else {
       toast.error('PDF not available for this article');
     }
   };

  const handleCopyCitation = async (citation: string, format: string) => {
    const success = await copyToClipboard(citation);
    if (success) {
      setCopiedCitation(format);
      toast.success(`${format.toUpperCase()} citation copied!`);
      setTimeout(() => setCopiedCitation(null), 2000);
    } else {
      toast.error("Failed to copy citation");
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
  const citations = {
    apa: generateAPACitation(article),
    mla: generateMLACitation(article),
    chicago: generateChicagoCitation(article),
    harvard: generateHarvardCitation(article),
    bibtex: generateBibTeXCitation(article),
    ris: generateRISCitation(article),
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-background to-secondary/10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/journal")}
            className="p-0"
          >
            Journal
          </Button>
          <span>/</span>
          {article.volume && article.issue && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/volume/${article.volume}`)}
                className="p-0"
              >
                Vol {article.volume}
              </Button>
              <span>/</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  navigate(`/issue/${article.volume}/${article.issue}`)
                }
                className="p-0"
              >
                Issue {article.issue}
              </Button>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium truncate">
            {article.manuscriptTitle?.substring(0, 50)}...
          </span>
        </div>

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
        <ScrollAnimationWrapper animationType="fade-in" threshold={0.1}>
          <Card className="shadow-lg mb-8">
          <CardHeader>
            <div className="space-y-4">
              {/* Badge and Meta */}
              <div className="flex flex-wrap gap-2 items-center">
                <Badge>{article.topic?.name || "General"}</Badge>
                {article.volume && article.issue && (
                  <Badge variant="outline">
                    Vol {article.volume} | Issue {article.issue}
                  </Badge>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">
                  {article.manuscriptTitle || "Untitled Article"}
                </h1>
              </div>

              {/* Authors with Links */}
              <div className="space-y-4">
                {/* Primary Author */}
                <div>
                  <div className="flex items-center gap-2 text-muted-foreground mb-2">
                    <User className="h-4 w-4" />
                    <span className="font-medium">Author</span>
                  </div>
                  {Array.isArray(article.authors) &&
                  article.authors.length > 0 ? (
                    <div className="flex flex-col">
                      <Button
                        variant="link"
                        className="p-0 h-auto font-medium text-primary hover:underline text-left"
                        onClick={() =>
                          navigate(
                            `/author/${encodeURIComponent(article.authors[0].fullName)}`,
                          )
                        }
                      >
                        {article.authors[0].fullName}
                      </Button>
                      {article.authors[0].affiliation && (
                        <p className="text-sm text-muted-foreground">
                          {article.authors[0].affiliation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Unknown Author
                    </span>
                  )}
                </div>

                {/* Other Authors / Corresponding Authors */}
                {Array.isArray(article.authors) && article.authors.length > 1 && (
                  <div>
                    <div className="flex items-center gap-2 text-muted-foreground mb-2">
                      <User className="h-4 w-4" />
                      <span className="font-medium">Corresponding Authors</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {article.authors.slice(1).map((author: any, idx: number) => (
                        <div key={idx} className="flex flex-col">
                          <Button
                            variant="link"
                            className="p-0 h-auto font-medium text-primary hover:underline text-left"
                            onClick={() =>
                              navigate(
                                `/author/${encodeURIComponent(author.fullName)}`,
                              )
                            }
                          >
                            {author.fullName}
                          </Button>
                          {author.affiliation && (
                            <p className="text-sm text-muted-foreground">
                              {author.affiliation}
                            </p>
                          )}
                          {author.isCorresponding && (
                            <Badge
                              variant="secondary"
                              className="w-fit text-xs mt-1"
                            >
                              Corresponding Author
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Meta Information */}
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-1 h-4 w-4" />
                  Published:{" "}
                  {new Date(
                    article.publishedAt || article.createdAt,
                  ).toLocaleDateString()}
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

              {/* DOI and Additional Metadata */}
              {(article.doiSlug || article.manuscriptType) && (
                <div className="pt-2 border-t space-y-2">
                  {article.doiSlug && (
                    <p className="text-sm">
                      <strong>DOI:</strong>{" "}
                      <a
                        href={`https://doi.org/${article.doiSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                        itemProp="identifier"
                      >
                        {article.doiSlug}
                      </a>
                    </p>
                  )}
                  {article.manuscriptType && (
                    <p className="text-sm">
                      <strong>Article Type:</strong>{" "}
                      {article.manuscriptType.replace(/_/g, " ")}
                    </p>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Abstract */}
            <ScrollAnimationWrapper animationType="slide-in-up" delay={100}>
            <div>
              <h2 className="text-xl font-bold mb-3 flex items-center">
                <FileText className="mr-2 h-5 w-5" />
                Abstract
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {article.abstract || "No abstract available"}
              </p>
            </div>
            </ScrollAnimationWrapper>

            {/* Keywords */}
            {article.keywords && (
              <ScrollAnimationWrapper animationType="slide-in-right" delay={150}>
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
              </ScrollAnimationWrapper>
            )}

            {/* Citation Section */}
            <div className="pt-6 border-t">
              <ScrollAnimationWrapper animationType="slide-in-left" delay={200}>
              <div
                className="flex items-center justify-between cursor-pointer py-3"
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "citations" ? null : "citations",
                  )
                }
              >
                <h3 className="text-lg font-bold flex items-center">
                  <Share2 className="mr-2 h-5 w-5" />
                  Cite This Article
                </h3>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${
                    expandedSection === "citations" ? "rotate-180" : ""
                  }`}
                />
              </div>
              </ScrollAnimationWrapper>

              {expandedSection === "citations" && (
                <ScrollAnimationWrapper animationType="fade-in" delay={100}>
                <div className="mt-4 space-y-4">
                  <Tabs defaultValue="apa" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
                      <TabsTrigger value="apa" className="text-xs">
                        APA
                      </TabsTrigger>
                      <TabsTrigger value="mla" className="text-xs">
                        MLA
                      </TabsTrigger>
                      <TabsTrigger value="chicago" className="text-xs">
                        Chicago
                      </TabsTrigger>
                      <TabsTrigger value="harvard" className="text-xs">
                        Harvard
                      </TabsTrigger>
                      <TabsTrigger value="bibtex" className="text-xs">
                        BibTeX
                      </TabsTrigger>
                      <TabsTrigger value="ris" className="text-xs">
                        RIS
                      </TabsTrigger>
                    </TabsList>

                    {Object.entries(citations).map(([format, citation]) => (
                      <TabsContent key={format} value={format}>
                        <div className="mt-4 space-y-3">
                          <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm overflow-auto max-h-32">
                            <p className="whitespace-pre-wrap break-words">
                              {citation}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyCitation(citation, format)}
                            className="w-full"
                          >
                            {copiedCitation === format ? (
                              <>
                                <Check className="mr-2 h-4 w-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Citation
                              </>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
                </ScrollAnimationWrapper>
              )}
            </div>

            Files Section
            {article.files && article.files.length > 0 && (
              <ScrollAnimationWrapper animationType="slide-in-up" delay={250}>
              <div className="pt-6 border-t">
                <h3 className="text-lg font-bold mb-3 flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Associated Files
                </h3>
                <div className="space-y-3">
                  {article.files.map((file: any) => (
                    <Card key={file.id} className="border">
                      <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex-1">
                          <p className="font-medium break-words">
                            {file.fileName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                        {/* <Button
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          disabled={downloadingFile === file.id}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          {downloadingFile === file.id
                            ? "Downloading..."
                            : "Download"}
                        </Button> */}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              </ScrollAnimationWrapper>
            )}

            {/* Action Buttons */}
            <ScrollAnimationWrapper animationType="slide-in-up" delay={300}>
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {pdfUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewPdf(article)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              )}
            </div>
            </ScrollAnimationWrapper>
          </CardContent>
        </Card>
        </ScrollAnimationWrapper>

        {/* Declarations Section */}
        <ScrollAnimationWrapper animationType="slide-in-up" delay={200} threshold={0.2}>
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
        </ScrollAnimationWrapper>
      </div>
    </div>
  );
};

export default ArticleDetail;
