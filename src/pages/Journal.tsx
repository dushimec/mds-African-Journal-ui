import { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Download,
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import JSZip from "jszip";
import { saveAs } from "file-saver";

// ✅ Base URL from Vite environment variable
const BACKEND_URL = import.meta.env.VITE_API_URL;

const Journal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // ✅ Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${BACKEND_URL}/submission`);
        const submittedArticles = (res.data.data || []).filter(
          (article: any) => article.status === "PUBLISHED"
        );
        setArticles(submittedArticles);
      } catch (error) {
        console.error("Error fetching articles:", error);
        toast.error("Failed to fetch submissions.");
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  // ✅ Fetch categories (topics)
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/topic`);
        setCategories(res.data.data.map((topic) => topic.name));
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchTopics();
  }, []);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const handleDownload = async (
  submissionId: string,
  fileIds: string[],
  submissionTitle?: string
) => {
  if (!fileIds || fileIds.length === 0) {
    toast.error("No files selected for download.");
    return;
  }

  try {
    setDownloadingId(submissionId);
    setDownloadProgress(0);

    // 1️⃣ Fetch file info from backend
    const res = await axios.get(`${BACKEND_URL}/submission/${submissionId}/download`, {
      params: { files: fileIds.join(",") },
    });

    const data = res.data;
    if (!data || (!data.fileUrl && !data.files)) {
      toast.error("No files found.");
      return;
    }

    // --- Single file download with progress ---
    if (data.fileUrl) {
      const response = await axios.get(data.fileUrl, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            setDownloadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
          }
        },
      });
      saveAs(response.data, fileIds[0] + ".pdf");
      return;
    }

    // --- Multiple files download (ZIP) ---
    const files = data.files || [];
    const skippedFiles: string[] = data.skippedFiles || [];

    if (files.length === 0) {
      toast.error("None of the selected files could be downloaded.");
      if (skippedFiles.length) toast.info(`Skipped: ${skippedFiles.join(", ")}`);
      return;
    }

    const zip = new JSZip();
    let totalBytes = 0;
    const fileSizes: number[] = [];

    // 1️⃣ First, fetch file sizes (optional for progress tracking)
    await Promise.all(
      files.map(async (file, idx) => {
        try {
          const head = await axios.head(file.url);
          fileSizes[idx] = parseInt(head.headers["content-length"] || "0", 10);
          totalBytes += fileSizes[idx];
        } catch {
          fileSizes[idx] = 0;
          skippedFiles.push(file.fileName);
        }
      })
    );

    let loadedBytes = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (skippedFiles.includes(file.fileName)) continue;

      try {
        const response = await axios.get(file.url, {
          responseType: "arraybuffer",
          onDownloadProgress: (progressEvent) => {
            if (progressEvent.loaded && fileSizes[i]) {
              loadedBytes += progressEvent.loaded;
              setDownloadProgress(Math.round((loadedBytes * 100) / totalBytes));
            }
          },
        });
        zip.file(file.fileName, response.data);
      } catch (err: any) {
        console.error(`❌ Failed to fetch ${file.fileName}: ${err.message}`);
        skippedFiles.push(file.fileName);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" });
    saveAs(zipBlob, `${submissionTitle || "submission-files"}.zip`);

    if (skippedFiles.length) {
      toast.info(`Skipped files: ${skippedFiles.join(", ")}`);
    }

    setDownloadProgress(100); // complete
  } catch (err: any) {
    console.error("Download error:", err);
    toast.error("Failed to download files. Some files might be inaccessible.");
  } finally {
    setDownloadingId(null);
    setDownloadProgress(0);
  }
};

  const filteredArticles = articles.filter((article) => {
    const title = article.manuscriptTitle?.toLowerCase() || "";
    const authors = Array.isArray(article.authors)
      ? article.authors.map((a) => a.fullName.toLowerCase()).join(" ")
      : "";
    const keywords = article.keywords?.toLowerCase() || "";

    const matchesSearch =
      title.includes(searchTerm.toLowerCase()) ||
      authors.includes(searchTerm.toLowerCase()) ||
      keywords.includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" ||
      (article.category && article.category === selectedCategory);

    return matchesSearch && matchesCategory;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };


  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-3xl font-bold font-heading mb-6">
            Current Topics
          </h1>
        </div>

        {/* Search and Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles, authors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Topics</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Content and Loader */}
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card
                key={i}
                className="animate-pulse shadow-md h-full flex flex-col justify-between"
              >
                <CardHeader>
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-6 w-3/4 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 w-5/6 bg-gray-300 rounded mb-3"></div>
                  <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-8 w-24 bg-gray-300 rounded"></div>
                    <div className="h-8 w-28 bg-gray-300 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredArticles.map((article) => (
              <Card
                key={article.id}
                className="shadow-medium hover:shadow-strong transition-smooth"
              >
                <CardHeader>
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary">
                          {article.category || "General"}
                        </Badge>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="mr-1 h-3 w-3" />
                          {new Date(article.createdAt).toDateString()}
                        </div>
                      </div>
                      <CardTitle className="font-heading text-xl md:text-2xl mb-2">
                        {article.manuscriptTitle || "Untitled Article"}
                      </CardTitle>
                      <div className="flex items-center text-muted-foreground mb-2">
                        <User className="mr-1 h-4 w-4" />
                        <span className="text-sm">
                          {Array.isArray(article.authors)
                            ? article.authors.map((a) => a.fullName).join(", ")
                            : "Unknown Author"}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:items-end">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Eye className="mr-1 h-3 w-3" />
                          {article.views || 0}
                        </div>
                        <div className="flex items-center">
                          <Download className="mr-1 h-3 w-3" />
                          {article.downloads || 0}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    {expandedId === article.id
                      ? article.abstract
                      : `${article.abstract?.slice(0, 150) || ""}...`}
                  </p>

                  {expandedId === article.id && (
                    <div className="mt-2 space-y-2">
                      <p>
                        <strong>Keywords:</strong> {article.keywords.split(',').slice(0,5).join(',')}
                      </p>
                      <p>
                        <strong>Created At:</strong>{" "}
                        {new Date(article.createdAt).toLocaleDateString()}
                      </p>
                      {article.issue && (
                        <p>
                          <strong>Issue:</strong> {article.issue.title}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-4">
                    {article.keywords &&
                      article.keywords.split(",").slice(0,5).map((keyword, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {keyword.trim()}
                        </Badge>
                      ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleExpand(article.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {expandedId === article.id ? "Hide Details" : "Read More"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={downloadingId === article.id}
                      onClick={() => {
                        if (article.files && article.files.length > 0) {
                          handleDownload(
                            article.id,
                            article.files.map((f: any) => f.id),
                            article.manuscriptTitle
                          );
                        } else {
                          toast.error("No file available for download.");
                        }
                      }}
                    >
                      {downloadingId === article.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="mr-2 h-4 w-4" />
                      )}
                      {downloadingId === article.id
                        ? "Downloading..."
                        : "Download PDF"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No articles found matching your search criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
