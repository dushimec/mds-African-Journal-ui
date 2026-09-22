import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Search,
  Filter,
  Calendar,
  User,
  Eye,
  Download,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { validateIssuesPerVolume } from "@/lib/issueValidation";
import { ScrollAnimationWrapper } from "@/components/ScrollAnimationWrapper";
import { useStaggeredAnimation } from "@/hooks/useStaggeredAnimation";
import { useParallax } from "@/hooks/useParallax";

// ✅ Base URL from Vite environment variable
const BACKEND_URL = import.meta.env.VITE_API_URL;

// Generate PDF URL using /:volume/:issue/:slug.pdf endpoint
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

const Journal = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [articles, setArticles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIssue, setCurrentIssue] = useState<any>(null);
  const [issues, setIssues] = useState<any[]>([]);

  // Parallax effect for hero section
  const { ref: heroRef, style: heroStyle } = useParallax({ speed: 0.4 });

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

  // ✅ Fetch issues and set current issue (latest)
  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/issues/`);
        let issuesData = res.data.data || [];
        
        // ✅ Validate: max 2 issues per volume
        issuesData = validateIssuesPerVolume(issuesData);
        setIssues(issuesData);

        // Get the latest issue (highest volume, then highest issue)
        if (issuesData.length > 0) {
          const sorted = issuesData.sort((a: any, b: any) => {
            if (b.volume !== a.volume) return b.volume - a.volume;
            return b.issue - a.issue;
          });
          setCurrentIssue(sorted[0]);
        }
      } catch (error) {
        console.error("Error fetching issues:", error);
      }
    };
    fetchIssues();
  }, []);

  const handleViewPdf = async (article: any) => {
    const pdfUrl = getPdfUrl(article);
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast.error('PDF not available for this article');
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

  // Staggered animations for article cards
  const { getStaggerStyle, registerRef } = useStaggeredAnimation(
    filteredArticles.length,
    {
      itemDelay: 60,
      containerDelay: 0,
    }
  );

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };


  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Current Issue Section */}
        {currentIssue && (
          <ScrollAnimationWrapper 
            animationType="fade-in" 
            threshold={0.2}
            className="mb-16"
          >
            <div 
              ref={heroRef}
              style={heroStyle}
              className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-8 border border-primary/20 hover-glow transition-all duration-500"
            >
              <div className="text-center mb-8">
                <ScrollAnimationWrapper
                  animationType="scale-in"
                  delay={100}
                  threshold={0.3}
                  className="inline-block"
                >
                  <Badge variant="secondary" className="mb-4 animate-badge-entrance">
                    Latest Issue
                  </Badge>
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper
                  animationType="slide-in-down"
                  delay={150}
                  threshold={0.3}
                >
                  <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">
                    Volume {currentIssue.volume}, Issue {currentIssue.issue}
                  </h2>
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper
                  animationType="slide-in-up"
                  delay={200}
                  threshold={0.3}
                >
                  <p className="text-lg text-muted-foreground mb-6">
                    Published: {new Date(currentIssue.createdAt).toLocaleDateString()}
                  </p>
                </ScrollAnimationWrapper>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <ScrollAnimationWrapper
                  animationType="slide-in-left"
                  delay={200}
                  threshold={0.3}
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Publication Year
                    </h3>
                    <p className="text-2xl font-bold">{currentIssue.year}</p>
                  </div>
                </ScrollAnimationWrapper>

                <ScrollAnimationWrapper
                  animationType="slide-in-right"
                  delay={250}
                  threshold={0.3}
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm text-muted-foreground">
                      Articles in This Issue
                    </h3>
                    <p className="text-2xl font-bold">
                      {articles.filter(
                        (a) =>
                          a.volume === currentIssue.volume &&
                          a.issue === currentIssue.issue
                      ).length}
                    </p>
                  </div>
                </ScrollAnimationWrapper>
              </div>

              <div className="text-center">
                <ScrollAnimationWrapper
                  animationType="scale-in"
                  delay={300}
                  threshold={0.3}
                >
                  <Button
                    size="lg"
                    onClick={() =>
                      navigate(
                        `/issue/${currentIssue.volume}/${currentIssue.issue}`
                      )
                    }
                    className="gap-2 hover-lift"
                  >
                    View This Issue
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </ScrollAnimationWrapper>
              </div>
            </div>
          </ScrollAnimationWrapper>
        )}

        <ScrollAnimationWrapper
          animationType="slide-in-up"
          threshold={0.2}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-3xl font-bold font-heading mb-6">
            Published Articles
          </h1>
          <p className="text-muted-foreground">
            Browse all published articles from our journal
          </p>
        </ScrollAnimationWrapper>

        {/* Search and Filter */}
        <ScrollAnimationWrapper
          animationType="fade-in"
          delay={100}
          threshold={0.2}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search articles, authors, or keywords..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 transition-all duration-300 focus:ring-2"
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48 transition-all duration-300">
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
        </ScrollAnimationWrapper>

        {/* Content and Loader */}
        {loading ? (
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <ScrollAnimationWrapper
                key={i}
                animationType="fade-in"
                delay={i * 50}
              >
                <Card
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
              </ScrollAnimationWrapper>
            ))}
          </div>
        ) : (
          <div className="space-y-8">
            {filteredArticles.map((article, index) => (
              <div
                key={article.id}
                ref={registerRef(index)}
                style={getStaggerStyle(index)}
              >
                <Card
                  className="shadow-medium hover:shadow-strong transition-all duration-300 hover-lift"
                >
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="animate-badge-entrance">
                            {article.category || "General"}
                          </Badge>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Calendar className="mr-1 h-3 w-3" />
                            {new Date(article.createdAt).toDateString()}
                          </div>
                        </div>
                        <CardTitle 
                          className="font-heading text-xl md:text-2xl mb-2 cursor-pointer hover:text-primary transition-colors duration-300"
                          onClick={() => {
                            const parts = article.seoPdfName?.replace('.pdf', '').split('-') || [];
                            const titleSlug = parts.slice(5).join('-') || article.id;
                            navigate(`/article/${titleSlug}`);
                          }}
                        >
                          {article.manuscriptTitle || "Untitled Article"}
                        </CardTitle>
                      </div>

                      <div className="flex flex-col gap-2 md:items-end">
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center hover:text-primary transition-colors duration-300">
                            <Eye className="mr-1 h-3 w-3" />
                            {article.views || 0}
                          </div>
                          <div className="flex items-center hover:text-primary transition-colors duration-300">
                            <Download className="mr-1 h-3 w-3" />
                            {article.downloads || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredArticles.length === 0 && (
          <ScrollAnimationWrapper
            animationType="fade-in"
            threshold={0.3}
            className="text-center py-12"
          >
            <p className="text-muted-foreground text-lg">
              No articles found matching your search criteria.
            </p>
          </ScrollAnimationWrapper>
        )}
      </div>
    </div>
  );
};

export default Journal;
