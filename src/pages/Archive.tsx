import { useEffect, useState } from "react";
import axios from "axios";
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
import { Search, Filter, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const Archive = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [issues, setIssues] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [expandedMap, setExpandedMap] = useState<{ [key: string]: boolean }>({});

  // Totals state
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [totalDownloads, setTotalDownloads] = useState(0);

  // Loading states
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingTopics, setLoadingTopics] = useState(true);
  const [loadingTotals, setLoadingTotals] = useState(true);

  // Fetch issues
  const fetchIssues = async () => {
    try {
      const res = await axios.get(
        "https://mds-journal-backend.vercel.app/api/v1/issues/"
      );
      setIssues(res.data.data || []);
    } catch (error) {
      console.error("Error fetching issues:", error);
    } finally {
      setLoadingIssues(false);
    }
  };

  // Fetch topics
  const fetchTopics = async () => {
    try {
      const res = await axios.get(
        "https://mds-journal-backend.vercel.app/api/v1/topic"
      );
      setTopics(res.data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
    } finally {
      setLoadingTopics(false);
    }
  };

  // Fetch totals
 const fetchTotals = async () => {
  try {
    // 1️⃣ Fetch all articles/submissions
    const articlesRes = await axios.get(
      "https://mds-journal-backend.vercel.app/api/v1/submission"
    );
    const articlesData = articlesRes.data.data || [];
    setTotalArticles(articlesData.length); // ✅ count all articles

    // 2️⃣ Fetch all issues
    const issuesRes = await axios.get(
      "https://mds-journal-backend.vercel.app/api/v1/issues/"
    );
    const issuesData = issuesRes.data.data || [];
    setTotalIssues(issuesData.length); // ✅ count all issues

    // 3️⃣ Fetch newsletter subscribers
    const subsRes = await axios.get(
      "https://mds-journal-backend.vercel.app/api/v1/newsletter/subscribers"
    );
    const subsData = subsRes.data.data.subscribers || [];
    setTotalSubscribers(subsData.length); // ✅ count subscribers

    // 4️⃣ Calculate total downloads (sum of all manuscript downloadCount)
    const totalDownloads = articlesData.reduce((acc, article) => {
      if (article.files && Array.isArray(article.files)) {
        const manuscriptFile = article.files.find(
          (file) => file.fileType === "MANUSCRIPT"
        );
        return acc + (manuscriptFile?.downloadCount || 0);
      }
      return acc;
    }, 0);
    setTotalDownloads(totalDownloads);

  } catch (error) {
    console.error("Error fetching totals:", error);
  } finally {
    setLoadingTotals(false);
  }
};


  useEffect(() => {
    fetchIssues();
    fetchTopics();
    fetchTotals();
  }, []);

  const toggleExpand = (id: string | number) => {
    const issueId = String(id);
    setExpandedMap((prev) => ({
      ...prev,
      [issueId]: !prev[issueId],
    }));
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTopic =
      selectedTopic === "all" ||
      issue.topic?.toLowerCase() === selectedTopic.toLowerCase();

    return matchesSearch && matchesTopic;
  });

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            {loadingIssues ? <div className="h-10 w-64 bg-gray-300 mx-auto rounded" /> : "Journal Archive"}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {loadingIssues ? <div className="h-4 w-80 bg-gray-200 mx-auto rounded" /> : "Explore past issues and research topics from our journal."}
          </p>
        </div>

        {/* Totals Cards */}
        <section className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[totalArticles, totalSubscribers, totalIssues, totalDownloads].map((value, idx) => (
              <Card key={idx} className="text-center shadow-medium">
                <CardContent className="pt-6">
                  {loadingTotals ? (
                    <div className="space-y-2">
                      <div className="h-8 w-16 bg-gray-300 rounded mx-auto"></div>
                      <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
                    </div>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-primary mb-2">{value}</div>
                      <div className="text-muted-foreground">
                        {idx === 0
                          ? "Total Articles"
                          : idx === 1
                          ? "Subscribers"
                          : idx === 2
                          ? "Issues Published"
                          : "Total Downloads"}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Search & Topic Filter */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-center">
          {/* Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Topic Filter */}
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger className="w-52">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Topics</SelectItem>
              {loadingTopics
                ? [...Array(3)].map((_, i) => (
                    <SelectItem key={i} value={`loading-${i}`}>
                      Loading...
                    </SelectItem>
                  ))
                : topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.name}>
                      {topic.name}
                    </SelectItem>
                  ))}
            </SelectContent>
          </Select>
        </div>

        {/* Issues List */}
        <section>
          {loadingIssues ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="h-64 flex flex-col justify-between">
                  <CardHeader>
                    <div className="h-4 w-20 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 w-40 bg-gray-300 rounded"></div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="h-3 w-28 bg-gray-200 rounded"></div>
                    <div className="h-3 w-full bg-gray-200 rounded"></div>
                    <div className="h-3 w-5/6 bg-gray-200 rounded"></div>
                  </CardContent>
                  <div className="p-4">
                    <div className="h-8 w-full bg-gray-300 rounded"></div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filteredIssues.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No issues found.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredIssues.map((issue, index) => {
                const issueId = String(issue.id);
                const isExpanded = !!expandedMap[issueId];

                return (
                  <Card
                    key={issueId}
                    className="shadow-medium hover:shadow-strong transition-smooth flex flex-col justify-between self-start"
                  >
                    <div>
                      <CardHeader>
                        <Badge variant="outline" className="mb-2 w-fit">
                          Issue {index + 1}
                        </Badge>
                        <CardTitle className="font-heading text-lg line-clamp-2">
                          {issue.title || "Untitled Issue"}
                        </CardTitle>
                      </CardHeader>

                      <CardContent>
                        <p className="text-muted-foreground text-sm mb-3">
                          Published: {new Date(issue.createdAt).toLocaleDateString()}
                        </p>

                        {issue.topic && (
                          <p className="text-sm text-primary mb-2">
                            <strong>Topic:</strong> {issue.topic}
                          </p>
                        )}

                        <p
                          className={`text-muted-foreground leading-relaxed text-sm mb-3 transition-all duration-300 overflow-hidden ${
                            isExpanded ? "max-h-[500px]" : "max-h-[60px]"
                          }`}
                        >
                          {issue.description || "No description available."}
                        </p>

                        <div
                          className={`text-xs text-muted-foreground space-y-1 mt-2 transition-all duration-300 overflow-hidden ${
                            isExpanded ? "max-h-[200px]" : "max-h-0"
                          }`}
                        >
                          <p>
                            <strong>Year:</strong> {issue.year || "-"}
                          </p>
                          <p>
                            <strong>Month:</strong> {issue.month || "-"}
                          </p>
                          <p>
                            <strong>Articles:</strong> {issue.articleCount || 0}
                          </p>
                        </div>
                      </CardContent>
                    </div>

                    <div className="flex gap-2 p-4 pt-0">
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => toggleExpand(issueId)}
                        className="flex-1"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        {isExpanded ? "Hide Details" : "View More"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Subscribe Section */}
        <section className="mt-16 text-center bg-gradient-card rounded-lg p-8">
          <h2 className="text-3xl font-bold font-heading mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to get alerts about new issues, research, and journal updates.
          </p>
          <Link to="/submission">
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
