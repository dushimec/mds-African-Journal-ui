import React, { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Target, Eye, Award, Users, Globe, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface AboutSectionData {
  id: string;
  section: string;
  title?: string;
  content: string;
  order: number;
}

// Map icons for dynamic sections
const iconMap: Record<string, React.ElementType> = {
  HEADER: Award,
  WHAT_IS_MDS_JAED: Target,
  WHY_PUBLISH_WITH_US: Eye,
  HOW_TO_CONTRIBUTE: Eye,
  AIMS_AND_SCOPE: Target,
  PUBLICATION_FREQUENCY: BookOpen,
  INDEXING_AND_ACCESSIBILITY: BookOpen,
  RESEARCH_EXCELLENCE: Target,
  POLICY_IMPACT: Users,
  ENGAGEMENT_WITH_PRACTITIONERS: Globe,
  JOIN_OUR_COMMUNITY: Users,
};

// Sections to display in "Our Mission"
const missionSections = ["RESEARCH_EXCELLENCE", "POLICY_IMPACT", "ENGAGEMENT_WITH_PRACTITIONERS"];

const About: React.FC = () => {
  const [sections, setSections] = useState<AboutSectionData[]>([]);
  const [headerTitle, setHeaderTitle] = useState("Empowering Knowledge Through Research");
  const [headerContent, setHeaderContent] = useState(
    "MDS Journal of Applied Economics & Development (MDS-JAED)\n\nPublished by MDS Consultancy, Rwanda"
  );
  const [loading, setLoading] = useState(false);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/about-sections`);
      if (Array.isArray(res.data)) {
        const sorted = res.data.sort((a: AboutSectionData, b: AboutSectionData) => a.order - b.order);
        setSections(sorted);

        // Update header dynamically
        const headerSection = sorted.find((sec) => sec.section === "HEADER");
        if (headerSection) {
          setHeaderTitle(headerSection.title || headerTitle);
          setHeaderContent(headerSection.content || headerContent);
        }
      }
    } catch (err) {
      console.error("Failed to fetch About sections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();
  }, []);

  const missionValues = sections.filter((sec) => missionSections.includes(sec.section));

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          {loading ? (
            <>
              <Skeleton className="h-10 w-3/4 mx-auto mb-4" />
              <Skeleton className="h-6 w-1/2 mx-auto" />
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">{headerTitle}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto whitespace-pre-line">
                {headerContent}
              </p>
            </>
          )}
        </div>

        {/* Dynamic Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="shadow-medium">
                  <CardHeader>
                    <Skeleton className="h-6 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-20 w-full" />
                  </CardContent>
                </Card>
              ))
            : sections
                .filter((sec) => sec.section !== "HEADER" && !missionSections.includes(sec.section))
                .map((sec) => {
                  const Icon = iconMap[sec.section] || Target;
                  return (
                    <Card key={sec.id} className="shadow-medium">
                      <CardHeader>
                        <CardTitle className="flex items-center font-heading">
                          <Icon className="mr-3 h-6 w-6 text-primary" />
                          {sec.title || sec.section.replace(/_/g, " ")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground leading-relaxed">{sec.content}</p>
                      </CardContent>
                    </Card>
                  );
                })}
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold font-heading text-center mb-12">Our Mission</h2>
          <h2 className="text-xl text-center mb-2">
            Highlighting our contributions to economics and development in Africa
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="text-center shadow-soft">
                    <CardHeader>
                      <Skeleton className="h-12 w-12 mx-auto mb-4 rounded-full" />
                      <Skeleton className="h-6 w-2/3 mx-auto" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-20 w-full" />
                    </CardContent>
                  </Card>
                ))
              : missionValues.map((value) => {
                  const Icon = iconMap[value.section] || Target;
                  return (
                    <Card
                      key={value.id}
                      className="text-center shadow-soft hover:shadow-medium transition-smooth"
                    >
                      <CardHeader>
                        <div className="flex justify-center mb-4">
                          <Icon className="h-12 w-12 text-primary" />
                        </div>
                        <CardTitle className="font-heading">
                          {value.title || value.section.replace(/_/g, " ")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">{value.content}</p>
                      </CardContent>
                    </Card>
                  );
                })}
          </div>
        </section>

        {/* Call to Action */}
        {!loading && (
          <div className="text-center">
            <h2 className="text-3xl font-bold font-heading mb-4">Join Our Community</h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Be part of our mission to advance scientific knowledge and contribute to positive change in the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/submission">
                <Button size="lg" className="font-semibold">
                  Submit Your Research
                </Button>
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default About;
