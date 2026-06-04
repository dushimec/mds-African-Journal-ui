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
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { validateIssuesPerVolume } from "@/lib/issueValidation";

const BACKEND_URL = import.meta.env.VITE_API_URL;

interface VolumeIssue {
  id: string;
  volume: number;
  issue: number;
  year: number;
  submissions?: any[];
}

const VolumeDetail = () => {
  const { volumeNumber } = useParams<{ volumeNumber: string }>();
  const navigate = useNavigate();
  const [issues, setIssues] = useState<VolumeIssue[]>([]);
  const [loading, setLoading] = useState(true);

  // Get publication period based on issue number
  const getPublicationPeriod = (issueNumber: number): string => {
    return issueNumber === 1 ? "January – June" : "July – December";
  };

  // Fetch volume issues
  useEffect(() => {
    const fetchVolumeIssues = async () => {
      try {
        setLoading(true);

        // Fetch all issues
        const issuesRes = await axios.get(`${BACKEND_URL}/issues/`);
        let allIssues = issuesRes.data.data || [];
        
        // ✅ Validate: max 2 issues per volume
        allIssues = validateIssuesPerVolume(allIssues);

        // Filter issues for this volume
        const volumeIssues = allIssues.filter(
          (issue: any) => issue.volume === parseInt(volumeNumber || "0")
        );

        if (volumeIssues.length === 0) {
          toast.error("Volume not found");
          navigate("/archive");
          return;
        }

        setIssues(volumeIssues);
      } catch (error) {
        console.error("Error fetching volume details:", error);
        toast.error("Failed to load volume details");
      } finally {
        setLoading(false);
      }
    };

    if (volumeNumber) {
      fetchVolumeIssues();
    }
  }, [volumeNumber, navigate]);

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
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (issues.length === 0) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-lg">Volume not found</p>
          <Button onClick={() => navigate("/archive")} className="mt-4">
            Back to Archive
          </Button>
        </div>
      </div>
    );
  }

  const year = issues[0]?.year || new Date().getFullYear();

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

        {/* Volume Header */}
        <div className="mb-12 border-b pb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-4">
            Volume {volumeNumber}
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Publication Year: {year}
          </p>
          <p className="text-muted-foreground">
            This volume contains {issues.length} issue
            {issues.length !== 1 ? "s" : ""} published during {year}.
          </p>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {issues
            .sort((a, b) => a.issue - b.issue)
            .map((issue) => {
              const articleCount =
                (issue.submissions?.filter((s: any) => s.status === "PUBLISHED")
                  .length || 0);

              return (
                <Card
                  key={issue.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                  onClick={() =>
                    navigate(`/issue/${issue.volume}/${issue.issue}`)
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">
                            Issue {issue.issue}
                          </Badge>
                        </div>
                        <CardTitle className="text-2xl">
                          Issue {issue.issue}
                        </CardTitle>
                      </div>
                      <ChevronRight className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </CardHeader>

                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="mr-3 h-5 w-5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Publication Period
                          </p>
                          <p className="text-sm">
                            {getPublicationPeriod(issue.issue)} {issue.year}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-muted-foreground">
                        <BookOpen className="mr-3 h-5 w-5" />
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Articles Published
                          </p>
                          <p className="text-sm">
                            {articleCount} article
                            {articleCount !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="default"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/issue/${issue.volume}/${issue.issue}`
                            );
                          }}
                        >
                          View Issue Articles
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </div>

        {/* Back button */}
        <div className="text-center pt-12 border-t mt-12">
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

export default VolumeDetail;
