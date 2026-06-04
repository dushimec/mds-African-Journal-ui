import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Mail,
  Building2,
  FileText,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface AuthorInfo {
  fullName: string;
  email?: string;
  affiliation?: string;
  bio?: string;
  orcidId?: string;
}

interface ArticleData {
  id: string;
  manuscriptTitle?: string;
  abstract?: string;
  publishedAt?: string;
  volume?: number;
  issue?: number;
  doiSlug?: string;
  keywords?: string;
}

const AuthorProfile = () => {
  const { authorName } = useParams<{ authorName: string }>();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<AuthorInfo | null>(null);
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAuthorData = async () => {
      try {
        setLoading(true);

        // Decode URL parameter
        const decodedName = decodeURIComponent(authorName || "");

        // Fetch all submissions
        const submissionsRes = await axios.get(`${BACKEND_URL}/submission`);
        const allSubmissions = submissionsRes.data.data || [];

        // Find all articles by this author
        const authorArticles = allSubmissions.filter(
          (submission: any) =>
            submission.status === "PUBLISHED" &&
            Array.isArray(submission.authors) &&
            submission.authors.some(
              (author: any) =>
                author.fullName.toLowerCase() === decodedName.toLowerCase()
            )
        );

        if (authorArticles.length === 0) {
          toast.error("Author or articles not found");
          navigate("/journal");
          return;
        }

        // Extract author info from first article
        const authorInfo = authorArticles[0].authors.find(
          (author: any) =>
            author.fullName.toLowerCase() === decodedName.toLowerCase()
        );

        setAuthor(authorInfo);
        setArticles(authorArticles);
      } catch (error) {
        console.error("Error fetching author data:", error);
        toast.error("Failed to load author profile");
      } finally {
        setLoading(false);
      }
    };

    if (authorName) {
      fetchAuthorData();
    }
  }, [authorName, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/journal")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Journal
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Skeleton className="h-96 w-full rounded" />
            </div>
            <div className="md:col-span-2">
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!author) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">Author not found</p>
          <Button onClick={() => navigate("/journal")} className="mt-4">
            Back to Journal
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate("/journal")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Journal
        </Button>

        {/* Author Profile */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Author Card */}
          <div className="md:col-span-1">
            <Card className="sticky top-4">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-primary-foreground flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {author.fullName?.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <h1 className="text-2xl font-bold font-heading mb-2">
                    {author.fullName}
                  </h1>

                  {author.affiliation && (
                    <div className="flex items-center justify-center gap-2 text-muted-foreground mb-3">
                      <Building2 className="h-4 w-4" />
                      <p className="text-sm">{author.affiliation}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-4 border-t pt-6">
                  {author.email && (
                    <div className="flex items-start gap-3">
                      <Mail className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          Email
                        </p>
                        <a
                          href={`mailto:${author.email}`}
                          className="text-sm font-medium text-primary hover:underline break-all"
                        >
                          {author.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {author.orcidId && (
                    <div className="flex items-start gap-3">
                      <ExternalLink className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground mb-1">
                          ORCID ID
                        </p>
                        <a
                          href={`https://orcid.org/${author.orcidId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-primary hover:underline break-all"
                        >
                          {author.orcidId}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Publications
                      </p>
                      <p className="text-lg font-bold">{articles.length}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Author Publications */}
          <div className="md:col-span-2">
            <h2 className="text-3xl font-bold font-heading mb-8">
              Published Articles
            </h2>

            {articles.length === 0 ? (
              <Card className="bg-slate-50">
                <CardContent className="pt-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No published articles yet
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {articles.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => navigate(`/article/${article.id}`)}
                  >
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors mb-2">
                        {article.manuscriptTitle || "Untitled Article"}
                      </h3>

                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {article.abstract || "No abstract available"}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {article.keywords &&
                          article.keywords
                            .split(",")
                            .slice(0, 3)
                            .map((keyword: string, i: number) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {keyword.trim()}
                              </Badge>
                            ))}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {article.volume && (
                            <span>
                              Volume {article.volume}, Issue {article.issue}
                            </span>
                          )}
                          {article.publishedAt && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(article.publishedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>

                        {article.doiSlug && (
                          <p className="font-mono text-primary text-xs">
                            {article.doiSlug}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Back button */}
        <div className="text-center pt-8 border-t">
          <Button
            variant="outline"
            onClick={() => navigate("/journal")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthorProfile;
