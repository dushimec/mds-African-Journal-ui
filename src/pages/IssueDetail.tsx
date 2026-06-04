import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Calendar,
  BookOpen,
  FileText,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface IssueData {
  id: string;
  volume: number;
  issue: number;
  year: number;
  submissions?: any[];
}

const IssueDetail = () => {
  const { volumeId, issueId } = useParams<{
    volumeId: string;
    issueId: string;
  }>();
  const navigate = useNavigate();
  const [issueData, setIssueData] = useState<IssueData | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Get publication period based on issue number
  const getPublicationPeriod = (issueNumber: number): string => {
    return issueNumber === 1 ? "January – June" : "July – December";
  };

  // Fetch issue details
  useEffect(() => {
    const fetchIssueDetails = async () => {
      try {
        setLoading(true);

        // Fetch all issues to find matching volume and issue
        const issuesRes = await axios.get(`${BACKEND_URL}/issues/`);
        const allIssues = issuesRes.data.data || [];

        const matchingIssue = allIssues.find(
          (issue: any) =>
            issue.volume === parseInt(volumeId || "0") &&
            issue.issue === parseInt(issueId || "0")
        );

        if (!matchingIssue) {
          toast.error("Issue not found");
          navigate("/archive");
          return;
        }

        setIssueData(matchingIssue);

        // Fetch articles for this issue
        const submissionsRes = await axios.get(`${BACKEND_URL}/submission`);
        const allSubmissions = submissionsRes.data.data || [];

        const issueArticles = allSubmissions.filter(
          (submission: any) =>
            submission.status === "PUBLISHED" &&
            submission.volume === matchingIssue.volume &&
            submission.issue === matchingIssue.issue
        );

        setArticles(issueArticles);
      } catch (error) {
        console.error("Error fetching issue details:", error);
        toast.error("Failed to load issue details");
      } finally {
        setLoading(false);
      }
    };

    if (volumeId && issueId) {
      fetchIssueDetails();
    }
  }, [volumeId, issueId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/archive")}
            className="mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Archive
          </Button>

          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!issueData) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">Issue not found</p>
          <Button onClick={() => navigate("/archive")} className="mt-4">
            Back to Archive
          </Button>
        </div>
      </div>
    );
  }

  const publicationPeriod = getPublicationPeriod(issueData.issue);

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Navigation */}
        <Button
          variant="ghost"
          onClick={() => navigate("/archive")}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Archive
        </Button>

        {/* Issue Header */}
        <div className="mb-12 border-b pb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="secondary">Volume {issueData.volume}</Badge>
            <Badge variant="secondary">Issue {issueData.issue}</Badge>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Volume {issueData.volume}, Issue {issueData.issue}
          </h1>

          <div className="flex flex-col md:flex-row gap-8 text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold text-foreground">
                  Publication Period
                </p>
                <p>{publicationPeriod} {issueData.year}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FileText className="mr-3 h-5 w-5" />
              <div>
                <p className="font-semibold text-foreground">
                  Articles Published
                </p>
                <p>{articles.length} article{articles.length !== 1 ? "s" : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Articles List */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold font-heading mb-8">
            Published Articles
          </h2>

          {articles.length === 0 ? (
            <Card className="bg-slate-50">
              <CardContent className="pt-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  No articles published in this issue yet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {articles.map((article, index) => (
                <Card
                  key={article.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/article/${article.id}`)}
                >
                  <CardContent className="pt-6">
                    <div className="flex gap-6 items-start">
                      {/* Article Number */}
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary text-white font-bold">
                          {index + 1}
                        </div>
                      </div>

                      {/* Article Details */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors mb-2 line-clamp-2">
                          {article.manuscriptTitle || "Untitled Article"}
                        </h3>

                        <p className="text-sm text-muted-foreground mb-3">
                          {Array.isArray(article.authors)
                            ? article.authors.map((a: any) => a.fullName).join(", ")
                            : "Unknown Authors"}
                        </p>

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

                        <div className="flex items-center text-primary text-sm font-semibold group">
                          Read Full Article
                          <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>

                      {/* DOI if available */}
                      {article.doiSlug && (
                        <div className="flex-shrink-0 text-right">
                          <p className="text-xs text-muted-foreground mb-1">
                            DOI
                          </p>
                          <p className="text-sm font-mono text-primary break-all max-w-[150px]">
                            {article.doiSlug}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Back button */}
        <div className="text-center pt-8 border-t">
          <Button
            variant="outline"
            onClick={() => navigate("/archive")}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Archive
          </Button>
        </div>
      </div>
    </div>
  );
};

export default IssueDetail;
