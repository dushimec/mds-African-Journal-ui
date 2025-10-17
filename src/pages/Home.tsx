import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, Globe, ArrowRight, Download, Loader2 } from "lucide-react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { toast } from "react-toastify";

const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [totalArticles, setTotalArticles] = useState(0);
  const [totalSubscribers, setTotalSubscribers] = useState(0);


  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };
 const fetchTotals = async () => {
  try {
    // 1️⃣ Fetch all articles/submissions
    const articlesRes = await axios.get(
      "https://mds-journal-backend.vercel.app/api/v1/submission"
    );
    const articlesData = articlesRes.data.data || [];
    setTotalArticles(articlesData.length); // ✅ count all articles

    // 3️⃣ Fetch newsletter subscribers
    const subsRes = await axios.get(
      "https://mds-journal-backend.vercel.app/api/v1/newsletter/subscribers"
    );
    const subsData = subsRes.data.data.subscribers || [];
    setTotalSubscribers(subsData.length); // ✅ count subscribers

  } catch (error) {

    console.error("Error fetching totals:", error);
  } finally {
  }
};
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const api = "https://mds-journal-backend.vercel.app/api/v1/home-page";
      const response = await axios.get(api);
      setFeaturedArticles(response.data.data.recentSubmissions || []);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

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

  useEffect(() => {
    fetchArticles();
    fetchTotals();
  }, []);

  const stats = [
    { icon: BookOpen, label: "Published Articles", value:totalArticles},
    { icon: Users, label: "Active Subscribers", value:totalSubscribers },
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
            Welcome to the MDS AJournal of Applied Economics and Development
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

          {/* ✅ Skeleton Loading */}
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
              : featuredArticles.slice(0, 3).map((article: any, index: number) => (
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
                            ? article.authors.map((a: any) => a.fullName).join(", ")
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
                              <strong>Keywords:</strong> {article.keywords}
                            </p>
                            <p>
                              <strong>Created At:</strong>{" "}
                              {new Date(article.createdAt).toLocaleDateString()}
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

      {/* Call to Action */}
      <section className="py-16 bg-gradient-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Share Your Research?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community of researchers and contribute to the advancement
            of scientific knowledge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/submission">
              <Button size="lg" className="font-semibold">
                Submit Article
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/author-page">
              <Button variant="outline" size="lg">
                Author Guidelines
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
