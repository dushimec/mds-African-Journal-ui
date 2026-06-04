import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  BookOpen,
  Calendar,
  ChevronDown,
  FileText,
} from "lucide-react";
import { Link } from "react-router-dom";
import { validateIssuesPerVolume } from "@/lib/issueValidation";

const Archive = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedYear, setSelectedYear] = useState("all");
  const [issues, setIssues] = useState<any[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [expandedVolumes, setExpandedVolumes] = useState<{
    [key: number]: boolean;
  }>({});

  // Totals state
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);
  const [loading, setLoading] = useState(true);

  // Group issues by volume
  const groupIssuesByVolume = (issuesData: any[]) => {
    const grouped: { [key: number]: any[] } = {};
    issuesData.forEach((issue) => {
      if (!grouped[issue.volume]) {
        grouped[issue.volume] = [];
      }
      grouped[issue.volume].push(issue);
    });
    return grouped;
  };

  // Get unique years
  const extractYears = (issuesData: any[]) => {
    const uniqueYears = Array.from(new Set(issuesData.map((i) => i.year))).sort(
      (a, b) => b - a
    );
    return uniqueYears;
  };

  // Fetch issues
  const fetchIssues = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/issues/`);
      let issuesData = res.data.data || [];
      
      // ✅ Validate: max 2 issues per volume
      issuesData = validateIssuesPerVolume(issuesData);
      setIssues(issuesData);

      // Extract and set years
      const uniqueYears = extractYears(issuesData);
      setYears(uniqueYears);
    } catch (error) {
      console.error("Error fetching issues:", error);
    }
  };

  // Fetch totals
  const fetchTotals = async () => {
    try {
      // 1️⃣ Fetch all articles/submissions
      const articlesRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/submission`
      );
      const articlesData = articlesRes.data.data || [];
      const publishedArticles = articlesData.filter(
        (a: any) => a.status === "PUBLISHED"
      );
      setTotalArticles(publishedArticles.length);

      // 2️⃣ Fetch all issues
      const issuesRes = await axios.get(
        `${import.meta.env.VITE_API_URL}/issues/`
      );
      const issuesData = issuesRes.data.data || [];
      setTotalIssues(issuesData.length);

      // 3️⃣ Fetch newsletter subscribers
      try {
        const subsRes = await axios.get(
          `${import.meta.env.VITE_API_URL}/newsletter/subscribers`
        );
        const subsData = subsRes.data.data?.subscribers || [];
        setTotalSubscribers(subsData.length);
      } catch {
        setTotalSubscribers(0);
      }

      // 4️⃣ Calculate total downloads
      const totalDownloads = publishedArticles.reduce((acc: number, article: any) => {
        if (article.files && Array.isArray(article.files)) {
          const manuscriptFile = article.files.find(
            (file: any) => file.fileType === "MANUSCRIPT"
          );
          return acc + (manuscriptFile?.downloadCount || 0);
        }
        return acc;
      }, 0);
      setTotalDownloads(totalDownloads);
    } catch (error) {
      console.error("Error fetching totals:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchIssues();
      await fetchTotals();
      setLoading(false);
    };
    loadData();
  }, []);

  const toggleVolumeExpand = (volume: number) => {
    setExpandedVolumes((prev) => ({
      ...prev,
      [volume]: !prev[volume],
    }));
  };

  // Filter issues based on search and year
  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.year?.toString().includes(searchTerm.toLowerCase()) ||
      issue.volume?.toString().includes(searchTerm.toLowerCase());

    const matchesYear =
      selectedYear === "all" || issue.year?.toString() === selectedYear;

    return matchesSearch && matchesYear;
  });

  const groupedIssues = groupIssuesByVolume(filteredIssues);
  const volumeNumbers = Object.keys(groupedIssues)
    .map(Number)
    .sort((a, b) => b - a);

  const getPublicationPeriod = (issueNumber: number): string => {
    return issueNumber === 1 ? "January – June" : "July – December";
  };

  return (
    <div className="min-h-screen py-12 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Journal Archive
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Explore all published volumes and issues. Browse through years of
            research and academic excellence.
          </p>
        </div>

        {/* Statistics Cards */}
        <section className="mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalArticles}
                </div>
                <p className="text-muted-foreground">Published Articles</p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalIssues}
                </div>
                <p className="text-muted-foreground">Issues Published</p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {volumeNumbers.length}
                </div>
                <p className="text-muted-foreground">Volumes</p>
              </CardContent>
            </Card>

            <Card className="shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {totalDownloads}
                </div>
                <p className="text-muted-foreground">Total Downloads</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Search & Year Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search volumes, issues, or years..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-full md:w-48">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Volumes and Issues */}
        <section className="space-y-8">
          {loading ? (
            <div className="space-y-6 animate-pulse">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-200 rounded-lg" />
              ))}
            </div>
          ) : volumeNumbers.length === 0 ? (
            <Card className="bg-slate-50">
              <CardContent className="pt-12 text-center">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  No volumes found matching your search criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            volumeNumbers.map((volumeNumber) => {
              const volumeIssues = groupedIssues[volumeNumber].sort(
                (a, b) => a.issue - b.issue
              );
              const isExpanded = expandedVolumes[volumeNumber];
              const year = volumeIssues[0]?.year || new Date().getFullYear();

              return (
                <Card key={volumeNumber} className="shadow-md">
                  <div
                    onClick={() => toggleVolumeExpand(volumeNumber)}
                    className="cursor-pointer"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold font-heading mb-2">
                            Volume {volumeNumber}
                          </h2>
                          <p className="text-muted-foreground">
                            Publication Year: {year} • {volumeIssues.length}{" "}
                            issue{volumeIssues.length !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <ChevronDown
                          className={`h-6 w-6 text-muted-foreground transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </CardHeader>
                  </div>

                  {isExpanded && (
                    <CardContent className="space-y-4 border-t pt-6">
                      {volumeIssues.map((issue) => {
                        const articlesInIssue = filteredIssues.filter(
                          (i) =>
                            i.volume === volumeNumber &&
                            i.issue === issue.issue
                        ).length;

                        return (
                          <Card
                            key={`${issue.volume}-${issue.issue}`}
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() =>
                              navigate(`/issue/${volumeNumber}/${issue.issue}`)
                            }
                          >
                            <CardContent className="p-6">
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-3">
                                    <Badge variant="secondary">
                                      Issue {issue.issue}
                                    </Badge>
                                  </div>

                                  <h3 className="text-lg font-semibold mb-2">
                                    Issue {issue.issue}
                                  </h3>

                                  <p className="text-sm text-muted-foreground mb-3">
                                    {getPublicationPeriod(issue.issue)} {year}
                                  </p>

                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(
                                        issue.createdAt
                                      ).toLocaleDateString()}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <FileText className="h-4 w-4" />
                                      {articlesInIssue} article
                                      {articlesInIssue !== 1 ? "s" : ""}
                                    </div>
                                  </div>
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(
                                      `/issue/${volumeNumber}/${issue.issue}`
                                    );
                                  }}
                                >
                                  View Issue
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </section>

        {/* Subscribe Section */}
        <section className="mt-16 text-center bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-12 border">
          <h2 className="text-3xl font-bold font-heading mb-4">Stay Updated</h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to receive alerts about new issues, research highlights,
            and journal updates.
          </p>
          <Link to="/contact">
            <Button size="lg" className="font-semibold">
              Subscribe to Alerts
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
};

export default Archive;
