import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BookOpen,
  Users,
  Globe,
  ArrowRight,
  Megaphone,
  Award,
  TrendingUp,
  Newspaper,
} from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "react-toastify";

const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const [totalIssues, setTotalIssues] = useState(0);
  const [editorInChief, setEditorInChief] = useState<any>(null);
  const [associateEditors, setAssociateEditors] = useState<any[]>([]);
  const [totalPublished, setTotalPublished] = useState(0);

  const [journalMetrics, setJournalMetrics] = useState({
    acceptanceRate: "0%",
    rejectionRate: "0%",
    totalSubmissions: 0,
  });

  const [announcements, setAnnouncements] = useState<any[]>([]);

  const backendUrl = import.meta.env.VITE_API_URL;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Generate PDF URL using /:volume/:issue/:slug.pdf endpoint
  const getPdfUrl = (article: any) => {
    // Primary: use volume/issue/seoPdfName format /:volume/:issue/:slug.pdf
    if (article.volume && article.issue && article.seoPdfName) {
      return `/${article.volume}/${article.issue}/${article.seoPdfName}`;
    }
    // Fallback: use doiSlug if available
    if (article.doiSlug) {
      return `/article-pdf/${encodeURIComponent(article.doiSlug)}/url`;
    }
    return null;
  };

  const handleViewPdf = async (article: any) => {
    const pdfUrl = getPdfUrl(article);
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      toast.error('PDF not available for this article');
    }
  };

  const fetchIssuesCount = async () => {
    try {
      const issuesRes = await axios.get(`${backendUrl}/issues/`);
      const issuesData = issuesRes.data.data || [];
      setTotalIssues(issuesData.length); // ✅ count all issues
    } catch (error) {
      console.error("Failed to fetch issues count", error);
    }
  };

  // Fetch articles & compute metrics
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${backendUrl}/submission`);
      const allArticles = res.data.data || [];
      const publishedArticles = allArticles.filter(
        (article: any) => article.status === "PUBLISHED"
      );
      setFeaturedArticles(publishedArticles);

      setTotalPublished(publishedArticles.length);

      const total = allArticles.length;
      const accepted = publishedArticles.length;
      const rejected = allArticles.filter(
        (a) => a.status === "REJECTED"
      ).length;

      setJournalMetrics({
        acceptanceRate: total
          ? ((accepted / total) * 100).toFixed(1) + "%"
          : "0%",
        rejectionRate: total
          ? ((rejected / total) * 100).toFixed(1) + "%"
          : "0%",
        totalSubmissions: total,
      });
    } catch (error) {
      console.error("Error fetching articles:", error);
      toast.error("Failed to fetch submissions.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch subscribers
  const fetchTotals = async () => {
    try {
      const subsRes = await axios.get(`${backendUrl}/newsletter/subscribers`);
      const subsData = subsRes.data.data.subscribers || [];
      setTotalSubscribers(subsData.length);
    } catch (error) {
      console.error("Error fetching totals:", error);
    }
  };

  // Fetch editorial board
  const fetchEditors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/editorial-board-member`);
      const data = await res.json();

      if (data.success) {
        const members = data.data.filter((m: any) => m.isActive);
        const chief = members.find((m: any) =>
          m.role?.toLowerCase().includes("managing")
        );
        const others = members.filter((m: any) => m !== chief);

        setEditorInChief(chief);
        setAssociateEditors(others);
      }
    } catch (error) {
      console.error("Failed to load board members", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch dynamic announcements
  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get(`${backendUrl}/announcements`);
      setAnnouncements(res.data.data.announcements || []);
    } catch (error) {
      console.error("Failed to fetch announcements", error);
      toast.error("Failed to fetch announcements.");
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchTotals();
    fetchEditors();
    fetchAnnouncements();
    fetchIssuesCount();
  }, []);

  const stats = [
    // { icon: BookOpen, label: "Published Articles", value: journalMetrics.totalSubmissions },
    { icon: BookOpen, label: "Published Articles", value: totalPublished },

    { icon: Users, label: "Active Subscribers", value: totalSubscribers },
    { icon: Globe, label: "Countries", value: "68" },
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 5000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    fade: true,
  };

  const heroImages = ["image1.jpeg", "bg1.jpg", "bg2.jpg"];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[80vh] w-full">
        <Slider {...sliderSettings} className="h-full">
          {heroImages.map((src, i) => (
            <div key={i} className="h-[80vh] w-full">
              <img
                src={src}
                alt={`Slide ${i + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </Slider>

        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
          <p className="text-2xl md:text-2xl font-bold text-white mb-6 max-w-7xl">
            Bridging research and practical applications in economics,
            entrepreneurship, and development with a focus on African contexts.
          </p>
          <p className="text-xl md:text-4xl mb-8 text-gray-200 max-w-3xl mx-auto">
            Welcome to the Journal of Applied Economics and Development Policies (JAEDP)
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submission">
              <Button size="lg" variant="ghost">
                Submit Your Research
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <stat.icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Latest Research
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover the latest breakthrough research and scholarly
              contributions from leading experts worldwide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card
                    key={i}
                    className="animate-pulse h-full flex flex-col justify-between"
                  >
                    <CardHeader>
                      <div className="h-4 w-24 bg-gray-300 rounded mb-3"></div>
                      <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 w-5/6 bg-gray-300 rounded mb-3"></div>
                      <div className="h-4 w-4/5 bg-gray-300 rounded"></div>
                    </CardContent>
                    <div className="flex gap-2 p-4">
                      <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      <div className="h-8 w-24 bg-gray-300 rounded"></div>
                    </div>
                  </Card>
                ))
              : featuredArticles
                  .slice(0, 3)
                  .map((article: any, index: number) => (
                    <Card
                      key={index}
                      className="shadow-medium hover:shadow-strong transition-all h-full flex flex-col justify-between"
                    >
                      <div>
                        <CardHeader>
                          <div className="text-sm text-primary font-bold mb-2">
                            {article.keywords}
                          </div>
                          <CardTitle className="line-clamp-2">
                            {article.manuscriptTitle || "Untitled Article"}
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            {Array.isArray(article.authors)
                              ? article.authors
                                  .map((a: any) => a.fullName)
                                  .join(", ")
                              : article.user
                              ? `${article.user.firstName} ${article.user.lastName}`
                              : "Unknown Author"}
                          </p>

                          <p className="text-muted-foreground mb-4 leading-relaxed line-clamp-3">
                            {expandedId === article.id
                              ? article.abstract
                              : `${article.abstract?.slice(0, 150) || ""}...`}
                          </p>

                          {expandedId === article.id && (
                            <div className="mt-2 space-y-2 text-sm">
                              <p>
                                <strong>Keywords:</strong> {article.keywords.split(',').slice(0,5).join(',')}
                              </p>
                              <p>
                                <strong>Created At:</strong>{" "}
                                {new Date(
                                  article.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </div>

                      <div className="flex flex-wrap gap-2 p-4 pt-0">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => toggleExpand(article.id)}
                        >
                          {expandedId === article.id
                            ? "Hide Details"
                            : "Read More"}
                        </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewPdf(article)}
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        View PDF
                      </Button>
                    </div>
                  </Card>
                ))}
          </div>

          <div className="text-center">
            <Link to="/journal">
              <Button size="lg">
                View All Articles
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Call for Papers */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <Megaphone className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Call for Papers</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Submit your latest research to our upcoming {totalIssues} issue
            {totalIssues > 1 ? "s" : ""} focusing on
            <strong> “Innovation and Sustainable Development in Africa”</strong>
            . Papers are welcome until <strong>March 30, 2026</strong>.
          </p>
          <Link to="/submission">
            <Button size="lg">Submit Now</Button>
          </Link>
        </div>
      </section>

      {/* Journal Metrics Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <TrendingUp className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-8">Journal Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="shadow-sm p-6">
              <CardTitle>Acceptance Rate</CardTitle>
              <CardContent className="text-2xl font-bold">
                {journalMetrics.acceptanceRate}
              </CardContent>
            </Card>
            <Card className="shadow-sm p-6">
              <CardTitle>Rejection Rate</CardTitle>
              <CardContent className="text-2xl font-bold">
                {journalMetrics.rejectionRate}
              </CardContent>
            </Card>
            <Card className="shadow-sm p-6">
              <CardTitle>Total Submissions</CardTitle>
              <CardContent className="text-2xl font-bold">
                {journalMetrics.totalSubmissions}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Editorial Board Highlight */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Award className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-8">Editorial Board Highlight</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-pulse">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-full">
                  <div className="h-56 w-full bg-gray-200 rounded-t-2xl"></div>
                  <CardContent className="pt-4">
                    <div className="h-5 w-2/3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {editorInChief && (
                <div className="max-w-md mx-auto mb-12">
                  <Card className="shadow-md">
                    <img
                      src={editorInChief.profileImage || "/default-editor.jpg"}
                      alt={editorInChief.fullName}
                      className="h-64 w-full object-cover rounded-t-2xl"
                    />
                    <CardContent className="pt-4">
                      <h3 className="text-xl font-semibold">
                        {editorInChief.fullName}
                      </h3>
                      <p className="text-muted-foreground">
                        {editorInChief.role || "Managing Editor"}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {associateEditors.map((editor: any, index: number) => (
                  <Card key={index} className="shadow-md">
                    <img
                      src={editor.profileImage || "/default-editor.jpg"}
                      alt={editor.fullName}
                      className="h-56 w-full object-cover rounded-t-2xl"
                    />
                    <CardContent className="pt-4">
                      <h3 className="text-xl font-semibold">
                        {editor.fullName}
                      </h3>
                      <p className="text-muted-foreground">{editor.role}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Announcements & News */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <Newspaper className="h-10 w-10 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-8">Announcements & News</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="shadow-sm animate-pulse">
                    <CardHeader>
                      <div className="h-6 w-3/4 bg-gray-300 rounded mb-2"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
                      <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                    </CardContent>
                  </Card>
                ))
              : announcements.map((news, index) => (
                  <Card key={index} className="shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">{news.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-2">
                        {news.description}
                      </p>
                      <p className="text-sm text-primary font-medium">
                        {new Date(news.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

