import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  CheckCircle,
  Clock,
  Users,
  Download,
  AlertCircle,
  BookOpen,
  MessageSquare,
  Award,
  Target,
  Upload,
  Loader,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface AuthorPageContent {
  id: string;
  title: string;
  tagline: string;
  submissionSteps: any[];
  articleTypes: any[];
  guidelines: any[];
}

// Icon mapping for dynamic icons
const iconMap: any = {
  FileText: FileText,
  Upload: Upload,
  CheckCircle: CheckCircle,
  Users: Users,
  MessageSquare: MessageSquare,
  Award: Award,
  Clock: Clock,
  Download: Download,
  AlertCircle: AlertCircle,
  BookOpen: BookOpen,
};

const AuthorPage = () => {
  const [pageContent, setPageContent] = useState<AuthorPageContent | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch author page content from API
  useEffect(() => {
    const fetchPageContent = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/author-page`);
        setPageContent(res.data.data);
      } catch (error) {
        console.error("Error fetching author page content:", error);
        // Fallback is handled in the response with defaults
        setPageContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPageContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const content = pageContent;

  if (!content) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <p>Unable to load content</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            {content.title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {content.tagline}
          </p>
        </div>

        <Tabs defaultValue="guidelines" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="submission">Submission</TabsTrigger>
            <TabsTrigger value="review">Review Process</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          {/* Guidelines Tab */}
          <TabsContent value="guidelines" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold font-heading mb-6">
                Detailed Guidelines
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.articleTypes && content.articleTypes.length > 0 ? (
                  content.articleTypes.map((type, index) => (
                    <Card key={index} className="shadow-medium">
                      <CardHeader>
                        <CardTitle className="font-heading">{type.type}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{type.description}</p>
                        <ul className="space-y-2">
                          {type.items && type.items.map((item: string, i: number) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                              <span className="text-muted-foreground">{item}</span>
                            </li>
                          ))}
                        </ul>
                        {type.description2 && (
                          <p className="text-muted-foreground mt-4">{type.description2}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <p className="text-muted-foreground col-span-full">No article types available</p>
                )}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold font-heading mb-6">Other Guidelines</h2>
              <div className="space-y-6">
                {content.guidelines.map((section, index) => (
                  <Card key={index} className="shadow-medium">
                    <CardHeader>
                      <CardTitle className="font-heading flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-primary" />
                        {section.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.items && section.items.map((item: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Submission Tab */}
          <TabsContent value="submission" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold font-heading mb-6">Submission Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {content.submissionSteps.map((step, index) => {
                  const IconComponent = iconMap[step.icon] || FileText;
                  return (
                    <Card key={index} className="shadow-medium hover:shadow-strong transition-smooth">
                      <CardHeader className="text-center">
                        <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-3 flex items-center justify-center">
                          <span className="text-primary-foreground font-bold">{step.step}</span>
                        </div>
                        <CardTitle className="font-heading">{step.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground text-center">{step.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>

            <Card className="bg-gradient-card shadow-medium">
              <CardHeader>
                <CardTitle className="font-heading text-center">Ready to Submit?</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground mb-6">
                  Ensure your manuscript meets all requirements before submission
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="font-semibold">
                    Submit Manuscript
                  </Button>
                  <Button variant="outline" size="lg">
                    <Download className="mr-2 h-4 w-4" />
                    Submission Checklist
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Review Process Tab */}
          <TabsContent value="review" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold font-heading mb-6">Peer Review Process</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center">
                      <Users className="mr-2 h-5 w-5 text-primary" />
                      Double-Blind Review
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      We employ a rigorous double-blind peer review process where both reviewers and authors remain anonymous to ensure unbiased evaluation.
                    </p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Minimum 2 expert reviewers per manuscript
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Statistical review for data-heavy studies
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-success" />
                        Ethics review when applicable
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="shadow-medium">
                  <CardHeader>
                    <CardTitle className="font-heading flex items-center">
                      <Clock className="mr-2 h-5 w-5 text-primary" />
                      Review Timeline
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span>Initial Review</span>
                        <Badge variant="outline">1-2 weeks</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Peer Review</span>
                        <Badge variant="outline">4-6 weeks</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Author Revision</span>
                        <Badge variant="outline">2-4 weeks</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Final Decision</span>
                        <Badge variant="outline">1-2 weeks</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="font-heading">Review Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Scientific Quality</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Novelty and significance of findings</li>
                        <li>• Methodological rigor and appropriateness</li>
                        <li>• Statistical analysis and data interpretation</li>
                        <li>• Reproducibility of results</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Presentation Quality</h4>
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        <li>• Clarity of writing and organization</li>
                        <li>• Quality of figures and tables</li>
                        <li>• Completeness of references</li>
                        <li>• Adherence to journal guidelines</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-8">
            <section>
              <h2 className="text-3xl font-bold font-heading mb-6">Author Resources</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="shadow-medium hover:shadow-strong transition-smooth">
                  <CardHeader>
                    <CardTitle className="font-heading text-center">
                      <Download className="h-8 w-8 text-primary mx-auto mb-2" />
                      Templates
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Download manuscript templates and formatting guides
                    </p>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-medium hover:shadow-strong transition-smooth">
                  <CardHeader>
                    <CardTitle className="font-heading text-center">
                      <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                      Checklists
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Pre-submission checklists and quality guidelines
                    </p>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </CardContent>
                </Card>

                <Card className="shadow-medium hover:shadow-strong transition-smooth">
                  <CardHeader>
                    <CardTitle className="font-heading text-center">
                      <MessageSquare className="h-8 w-8 text-primary mx-auto mb-2" />
                      Support
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-muted-foreground mb-4">
                      Get help with submission and review process
                    </p>
                    <Button variant="outline" size="sm">
                      Contact
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Card className="bg-accent/10 border-accent shadow-medium">
              <CardHeader>
                <CardTitle className="font-heading flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-accent" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All submissions must comply with ethical standards for research involving human subjects, animals, or environmental studies. Ensure you have appropriate ethics approvals before submission.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthorPage;
