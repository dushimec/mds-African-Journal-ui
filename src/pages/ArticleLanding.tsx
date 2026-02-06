import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  Quote, 
  Calendar, 
  Users, 
  BookOpen,
  ExternalLink,
  Copy
} from "lucide-react";
import { toast } from "react-toastify";

interface Author {
  fullName: string;
  affiliation: string;
  email?: string;
  orcid?: string;
}

interface Article {
  id: string;
  manuscriptTitle: string;
  abstract: string;
  keywords: string;
  doiSlug: string | null;
  seoPdfName: string | null;
  volume: number | null;
  issue: number | null;
  publishedAt: string | null;
  updatedAt: string | null;
  authors: Author[];
  topic?: { name: string };
  references?: string[];
  citationCount?: number;
}

const BACKEND_URL = import.meta.env.VITE_API_URL;

// SEO Head Manager - sets document head elements for SEO
const useSeoHead = (article: Article | null) => {
  useEffect(() => {
    if (!article) return;

    // Set title
    document.title = `${article.manuscriptTitle} | JAEDP`;

    // Remove existing meta tags we manage
    const metaTagsToRemove = document.querySelectorAll(
      'meta[name^="citation"], meta[name^="DC"], meta[property^="og:"], meta[name^="twitter:"]'
    );
    metaTagsToRemove.forEach(tag => tag.remove());

    // Remove existing canonical
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    existingCanonical?.remove();

    // Remove existing JSON-LD
    const existingJsonLd = document.querySelectorAll('script[type="application/ld+json"]');
    existingJsonLd.forEach(script => script.remove());

    // Helper to add meta tag
    const addMeta = (name: string, content: string) => {
      const meta = document.createElement("meta");
      meta.name = name;
      meta.content = content;
      document.head.appendChild(meta);
    };

    // Add Google Scholar meta tags
    addMeta("citation_title", article.manuscriptTitle);
    addMeta("citation_author", article.authors.map(a => a.fullName).join(", "));
    addMeta("citation_publication_date", article.publishedAt?.split("T")[0] || "");
    addMeta("citation_journal_title", "JAEDP");
    if (article.volume) addMeta("citation_volume", String(article.volume));
    if (article.issue) addMeta("citation_issue", String(article.issue));
    addMeta("citation_firstpage", "1");
    if (article.doiSlug) addMeta("citation_doi", article.doiSlug);
    if (article.keywords) addMeta("citation_keywords", article.keywords);
    if (article.abstract) addMeta("citation_abstract", article.abstract);

    // Add Dublin Core meta tags
    addMeta("DC.title", article.manuscriptTitle);
    addMeta("DC.creator", article.authors.map(a => a.fullName).join(", "));
    if (article.publishedAt) addMeta("DC.date", article.publishedAt);
    if (article.abstract) addMeta("DC.description", article.abstract);
    if (article.keywords) addMeta("DC.subject", article.keywords);
    if (article.doiSlug) addMeta("DC.identifier", `https://doi.org/${article.doiSlug}`);
    addMeta("DC.type", "Text");
    addMeta("DC.format", "application/pdf");

    // Add Open Graph meta tags
    const ogMeta = (name: string, content: string) => {
      const meta = document.createElement("meta");
      meta.setAttribute("property", name);
      meta.content = content;
      document.head.appendChild(meta);
    };

    ogMeta("og:title", article.manuscriptTitle);
    ogMeta("og:description", article.abstract?.substring(0, 200) || "");
    ogMeta("og:type", "article");
    ogMeta("og:url", `https://www.jaedp.org/vol${article.volume}/issue${article.issue}/${article.seoPdfName}`);

    // Add Twitter meta tags
    addMeta("twitter:card", "summary_large_image");
    addMeta("twitter:title", article.manuscriptTitle);
    addMeta("twitter:description", article.abstract?.substring(0, 200) || "");

    // Add canonical link
    const canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    canonicalLink.href = `https://www.jaedp.org/vol${article.volume}/issue${article.issue}/${article.seoPdfName}`;
    document.head.appendChild(canonicalLink);

    // Add JSON-LD structured data
    const jsonLdScript = document.createElement("script");
    jsonLdScript.type = "application/ld+json";
    jsonLdScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ScholarlyArticle",
      "headline": article.manuscriptTitle,
      "description": article.abstract,
      "keywords": article.keywords,
      "datePublished": article.publishedAt,
      "dateModified": article.updatedAt || article.publishedAt,
      "identifier": article.doiSlug ? `https://doi.org/${article.doiSlug}` : undefined,
      "url": `https://www.jaedp.org/vol${article.volume}/issue${article.issue}/${article.seoPdfName}`,
      "author": article.authors.map(author => ({
        "@type": "Person",
        "name": author.fullName,
        "affiliation": {
          "@type": "Organization",
          "name": author.affiliation,
        },
        ...(author.orcid && { "identifier": author.orcid }),
      })),
      "publisher": {
        "@type": "Organization",
        "name": "JAEDP",
        "logo": {
          "@type": "ImageObject",
          "url": "https://www.jaedp.org/logo.png",
        },
      },
      "isPartOf": {
        "@type": "PublicationIssue",
        "issueNumber": article.issue,
        "isPartOf": {
          "@type": "Periodical",
          "name": "JAEDP",
          "issn": "XXXX-XXXX",
          "volumeNumber": article.volume,
        },
      },
    });
    document.head.appendChild(jsonLdScript);

    // Cleanup function
    return () => {
      metaTagsToRemove.forEach(tag => tag.remove());
      existingCanonical?.remove();
      existingJsonLd.forEach(script => script.remove());
    };
  }, [article]);
};

const ArticleLanding: React.FC = () => {
  const { volume, issue, slug } = useParams<{ volume: string; issue: string; slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [citationCopied, setCitationCopied] = useState<string | null>(null);

  // Apply SEO head
  useSeoHead(article);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // First try to find by volume/issue/slug
        const res = await axios.get(`${BACKEND_URL}/submission/vol/${volume}/${issue}/${slug}`);
        setArticle(res.data.data);
      } catch (error) {
        // Fallback: fetch all and filter
        try {
          const allRes = await axios.get(`${BACKEND_URL}/submission?status=PUBLISHED`);
          const found = (allRes.data.data || []).find(
            (a: any) => a.volume === parseInt(volume) && 
                       a.issue === parseInt(issue) && 
                       a.seoPdfName === slug
          );
          setArticle(found || null);
        } catch (e) {
          console.error("Failed to fetch article:", e);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [volume, issue, slug]);

  // Generate PDF URL
  const getPdfUrl = (article: Article) => {
    if (article.seoPdfName && article.volume && article.issue) {
      return `/vol${article.volume}/issue${article.issue}/${article.seoPdfName}.pdf`;
    }
    return null;
  };

  // Generate citation in various formats
  const generateCitation = useCallback((format: string = "apa"): string => {
    if (!article) return "";
    
    const authors = article.authors.map(a => a.fullName).join(", ");
    const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : "2024";
    
    switch (format) {
      case "apa":
        return `${authors} (${year}). ${article.manuscriptTitle}. JAEDP, ${article.volume}(${article.issue}). https://doi.org/${article.doiSlug}`;
      case "mla":
        return `${authors}. "${article.manuscriptTitle}." JAEDP, vol. ${article.volume}, no. ${article.issue}, ${year}.`;
      case "chicago":
        return `${authors}. "${article.manuscriptTitle}." JAEDP ${article.volume}, no. ${article.issue} (${year}). https://doi.org/${article.doiSlug}`;
      case "harvard":
        return `${authors} (${year}) '${article.manuscriptTitle}', JAEDP, ${article.volume}(${article.issue}).`;
      default:
        return `${authors} (${year}). ${article.manuscriptTitle}.`;
    }
  }, [article]);

  // Download BibTeX
  const downloadBibtex = async () => {
    if (!article) return;
    
    try {
      const bibtexRes = await axios.get(
        `${BACKEND_URL}/vol${article.volume}/issue${article.issue}/${article.seoPdfName}/citation/bibtex`,
        { responseType: "blob" }
      );
      
      const url = window.URL.createObjectURL(new Blob([bibtexRes.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${article.seoPdfName}.bib`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      // Fallback: generate locally
      const firstAuthor = article.authors[0]?.fullName.split(" ").pop() || "Unknown";
      const year = article.publishedAt ? new Date(article.publishedAt).getFullYear() : "2024";
      
      const bibtex = `@article{jaedp${firstAuthor}${year},
  author = {${article.authors.map((a: any) => a.fullName).join(" and ")}},
  title = {${article.manuscriptTitle}},
  journal = {JAEDP},
  year = {${year}},
  volume = {${article.volume}},
  number = {${article.issue}},
  doi = {${article.doiSlug}},
  keywords = {${article.keywords}},
  abstract = {${article.abstract?.replace(/\n/g, " ").slice(0, 200)}}
}`;
      
      const blob = new Blob([bibtex], { type: "application/x-bibtex" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${article.seoPdfName}.bib`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  const openPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, "_blank");
    }
  };

  // Copy citation to clipboard
  const copyCitation = (format: string) => {
    const citation = generateCitation(format);
    navigator.clipboard.writeText(citation);
    setCitationCopied(format);
    setTimeout(() => setCitationCopied(null), 2000);
    toast.success(`${format.toUpperCase()} citation copied!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Article Not Found</h1>
          <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or hasn't been published yet.</p>
          <Link to="/journal">
            <Button>Browse Journal</Button>
          </Link>
        </div>
      </div>
    );
  }

  const pdfUrl = getPdfUrl(article);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* Article Header */}
        <Card className="mb-8 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <div className="flex flex-wrap gap-2 mb-4">
              {article.topic && (
                <Badge className="bg-white/20 text-white hover:bg-white/30">
                  {article.topic.name}
                </Badge>
              )}
              <Badge className="bg-green-500 text-white hover:bg-green-600">
                Open Access
              </Badge>
            </div>
            <CardTitle className="text-3xl md:text-4xl font-bold leading-tight">
              {article.manuscriptTitle}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            {/* Authors */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Authors
              </h3>
              <div className="flex flex-wrap gap-3">
                {article.authors.map((author, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900">{author.fullName}</p>
                      <p className="text-sm text-gray-500">{author.affiliation}</p>
                    </div>
                    {author.orcid && (
                      <a 
                        href={`https://orcid.org/${author.orcid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        ORCID
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Article Metadata */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 uppercase">Volume & Issue</p>
                <p className="font-semibold">Vol. {article.volume}, No. {article.issue}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Published</p>
                <p className="font-semibold">
                  {article.publishedAt && new Date(article.publishedAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">DOI</p>
                <a 
                  href={`https://doi.org/${article.doiSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-blue-600 hover:underline"
                >
                  {article.doiSlug}
                </a>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase">Citations</p>
                <p className="font-semibold">{article.citationCount || 0}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4">
              {pdfUrl && (
                <Button 
                  className="bg-red-600 hover:bg-red-700"
                  onClick={openPdf}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Open PDF
                </Button>
              )}
              <Button variant="outline" onClick={downloadBibtex}>
                <Download className="w-4 h-4 mr-2" />
                BibTeX
              </Button>
              <Button variant="outline" onClick={() => copyCitation("apa")}>
                <Copy className="w-4 h-4 mr-2" />
                {citationCopied === "apa" ? "Copied!" : "APA"}
              </Button>
              <Button variant="outline" onClick={() => copyCitation("mla")}>
                <Copy className="w-4 h-4 mr-2" />
                {citationCopied === "mla" ? "Copied!" : "MLA"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Abstract */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              Abstract
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 leading-relaxed text-lg">
              {article.abstract}
            </p>
          </CardContent>
        </Card>

        {/* Keywords */}
        {article.keywords && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Keywords</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {article.keywords.split(",").map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {keyword.trim()}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* References */}
        {article.references && article.references.length > 0 && (
          <Card className="mb-8 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Quote className="w-5 h-5 text-blue-600" />
                References
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2">
                {article.references.map((ref, index) => (
                  <li key={index} className="text-gray-700 pl-4">
                    {ref}
                  </li>
                ))}
              </ol>
            </CardContent>
          </Card>
        )}

        {/* Citation Formats */}
        <Card className="mb-8 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Cite This Article</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">APA</p>
              <code className="block p-3 bg-gray-100 rounded text-sm break-words">
                {generateCitation("apa")}
              </code>
              <Button 
                size="sm" 
                variant="ghost" 
                className="mt-1"
                onClick={() => copyCitation("apa")}
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">MLA</p>
              <code className="block p-3 bg-gray-100 rounded text-sm break-words">
                {generateCitation("mla")}
              </code>
              <Button 
                size="sm" 
                variant="ghost" 
                className="mt-1"
                onClick={() => copyCitation("mla")}
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">Chicago</p>
              <code className="block p-3 bg-gray-100 rounded text-sm break-words">
                {generateCitation("chicago")}
              </code>
              <Button 
                size="sm" 
                variant="ghost" 
                className="mt-1"
                onClick={() => copyCitation("chicago")}
              >
                <Copy className="w-3 h-3 mr-1" /> Copy
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to Journal */}
        <div className="text-center">
          <Link to="/journal">
            <Button variant="outline">
              <ExternalLink className="w-4 h-4 mr-2" />
              Browse All Articles
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default ArticleLanding;
