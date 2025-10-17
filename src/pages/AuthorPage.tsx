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
} from "lucide-react";
import React from "react";

const AuthorPage = () => {
  const submissionSteps = [
    {
      step: 1,
      title: "Prepare Manuscript",
      description: "Format your manuscript according to our guidelines",
      icon: FileText,
    },
    {
      step: 2,
      title: "Online Submission",
      description: "Submit through our online portal with required documents",
      icon: Upload,
    },
    {
      step: 3,
      title: "Initial Review",
      description: "Editorial team conducts initial quality assessment",
      icon: CheckCircle,
    },
    {
      step: 4,
      title: "Peer Review",
      description: "Expert reviewers evaluate your research",
      icon: Users,
    },
    {
      step: 5,
      title: "Decision & Revision",
      description: "Receive feedback and revise if required",
      icon: MessageSquare,
    },
    {
      step: 6,
      title: "Publication",
      description: "Final acceptance and publication process",
      icon: Award,
    },
  ];

  const articleTypes = [
    {
      type: "Plagiarism Policy",
      description:
        "MDS-JAED enforces a strict plagiarism threshold of 15%. All manuscripts will be screened using Turnitin or equivalent software. Manuscripts with high similarity scores will be automatically rejected or returned for revision.",
      items: [],
    },
    {
      type: "Author Fees",
      description:
        "Currently, there are no submission or publication fees.This policy may be revised in the future to cover editorial and hosting costs.",
      items: [],
    },
    {
      type: "Types of Submissions",
      description: "",
      items: [
        "Original Research Article 4,000–8,000 words Full-length analytical papers",
        "Policy Brief 2,000–4,000 words: Short, actionable findings for decision-makers ",
        "Field/Case Reports 3,000–6,000 wordsField research, project evaluations",
        "Book Reviews 1,000–2,500 words: Reviews of recent academic publications",
      ],
      description2: "Accepted articles may be published online ahead of print.",
    },
    {
      type: "Publication Schedule",
      description: "MDS-JAED is published biannually:",
      items: ["Volume 1, Issue 1: July–December", "Volume 1, Issue 2: January–June"],
    },
    {
      type: "Acceptable Topics",
      description: "We accept manuscripts in areas including (but not limited to):",
      items: [
        "Development Economics and Sustainable Growth",
        "Applied Microeconomics and Macroeconomics",
        "Financial Inclusion and Sector Stability",
        "Public Finance and Fiscal Policy",
        "Agricultural and Rural Development",
        "Education, Economics, and Labor Markets",
        "Entrepreneurship and Innovation in Africa",
        "Economic Policy Analysis and Evaluation",
        "Environmental and Energy Economics",
        "Quantitative Modeling in Economics",
      ],
    },
    {
      type: "Formatting Guidelines",
      description: "Comprehensive Formatting Guidelines",
      items: [
        "Language: English (British or American, but consistent throughout)",
        "Citation Style: APA 7th Edition",
        "File Format: Submit both Word (.docx) and PDF (.pdf)",
        "Font: Times New Roman, 12 pt, 1.5 spacing",
        "Margins: Normal (1 inch)",
        "Page Numbers: Bottom right",
        "Tables and Figures: Embedded in the text with proper labels and sources",
      ],
    },
  ];

  const guidelines = [
    {
      category: "Manuscript Format",
      items: [
        "Title page with author information and conflicts of interest",
        "Abstract (250-300 words) with keywords",
        "Introduction, Methods, Results, Discussion structure",
        "References in APA format (maximum 50 for research articles)",
        "Figures and tables with appropriate captions",
      ],
    },
    {
      category: "Requirements documents",
      items: [
        "Double-spaced text with 12pt Times New Roman font",
        "Line numbers and page numbers included",
        "High-resolution figures (minimum 300 DPI)",
        "Supplementary materials in separate files",
        "Manuscript file in .docx or .pdf format",
      ],
    },
    {
      category: "Ethical Standards",
      items: [
        "Ethics approval for human/animal research",
        "Informed consent documentation",
        "Declaration of competing interests",
        "Data availability statement",
        "Acknowledgment of funding sources",
      ],
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
            Author Guidelines
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive guidelines for authors to prepare and submit
            high-quality manuscripts that meet our rigorous standards for
            scientific excellence.
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
                {articleTypes.map((type, index) => (
                  <Card key={index} className="shadow-medium">
                    <CardHeader>
                      <CardTitle className="font-heading">{type.type}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{type.description}</p>
                      <ul className="space-y-2">
                        {type.items.map((item, i) => (
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
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-3xl font-bold font-heading mb-6">Other Guidelines</h2>
              <div className="space-y-6">
                {guidelines.map((section, index) => (
                  <Card key={index} className="shadow-medium">
                    <CardHeader>
                      <CardTitle className="font-heading flex items-center">
                        <BookOpen className="mr-2 h-5 w-5 text-primary" />
                        {section.category}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.items.map((item, i) => (
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
                {submissionSteps.map((step, index) => (
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
                ))}
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

const Upload = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
);

export default AuthorPage;
