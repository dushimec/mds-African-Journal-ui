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
import {toast} from 'react-toastify';

const Journal = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // ✅ Fetch articles
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          "https://mds-journal-backend.vercel.app/api/v1/submission"
        );
        setArticles(res.data.data || []);
      } catch (error) {
        console.error("Error fetching articles:", error);
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
        const res = await axios.get(
          "https://mds-journal-backend.vercel.app/api/v1/topic"
        );
        setCategories(res.data.data.map((topic) => topic.name));
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };
    fetchTopics();
  }, []);

  const handleDownload = async (fileId: string, fileName: string) => {
    try {
      setDownloadingId(fileId);
      const response = await axios.get(
        `https://mds-journal-backend.vercel.app/api/v1/submission/download/${fileId}`,
        { responseType: "blob" }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${fileName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download file.");
    } finally {
      setDownloadingId(null);
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
        {/* Header */}
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
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
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

        {/* ✅ Skeleton Loader */}
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
                        <strong>Keywords:</strong> {article.keywords}
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
                      article.keywords
                        .split(",")
                        .map((keyword, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
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
                          const manuscriptFile =
                            article.files.find((f: any) => f.fileType === "MANUSCRIPT") ||
                            article.files[0];
                          handleDownload(manuscriptFile.id, manuscriptFile.fileName);
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
                      {downloadingId === article.id ? "Downloading..." : "Download PDF"}
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
