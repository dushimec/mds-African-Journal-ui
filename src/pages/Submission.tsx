import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, CheckCircle, Users, Send } from "lucide-react";
import { toast } from "react-toastify";

const Submission = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [topics, setTopics] = useState<string[]>([]);
  const [formData, setFormData] = useState<any>({
    manuscriptTitle: "",
    topic: "",
    abstract: "",
    keywords: "",
    authors: [{ fullName: "", email: "", affiliation: "" }],
    files: [] as any[],
    ethics: false,
    conflicts: false,
    copyright: false,
  });

  // Load from localStorage
  useEffect(() => {
    const savedData = localStorage.getItem("submission_form");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // ensure declaration booleans exist for older data
        if (parsed.ethics === undefined) parsed.ethics = false;
        if (parsed.conflicts === undefined) parsed.conflicts = false;
        if (parsed.copyright === undefined) parsed.copyright = false;
        setFormData(parsed);
      } catch (e) {
        console.error("Error parsing saved submission form:", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("submission_form", JSON.stringify(formData));
  }, [formData]);

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_URL}/topic`);
        const data = await res.json();
        setTopics(data.data?.map((t: any) => t.name) || []);
      } catch (err) {
        console.error("Error fetching topics:", err);
      }
    };
    fetchTopics();
  }, []);

  // Check login
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("You must login first!");
      navigate("/login");
    }
  }, []);

  const steps = [
    { number: 1, title: "Manuscript Details", icon: FileText },
    { number: 2, title: "Authors", icon: Users },
    { number: 3, title: "Upload Files", icon: Upload },
    { number: 4, title: "Review & Submit", icon: CheckCircle },
  ];

  const requirements = [
    { title: "Manuscript File", description: "Main manuscript in .docx or .pdf format", required: true },
    { title: "Cover Letter", description: "Brief description of significance and novelty", required: true },
    { title: "Ethics Documentation", description: "Ethics approval for human/animal studies", required: false },
  ];

  const addAuthor = () =>
    setFormData({
      ...formData,
      authors: [...formData.authors, { fullName: "", email: "", affiliation: "" }],
    });

  const updateAuthor = (index: number, field: string, value: string) => {
    const updatedAuthors = formData.authors.map((author: any, i: number) =>
      i === index ? { ...author, [field]: value } : author
    );
    setFormData({ ...formData, authors: updatedAuthors });
  };

  // Store selected File objects locally and attach them on final submit.
  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    requirement: string
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const filesArray = Array.from(event.target.files).map((file) => ({
      file,
      requirement,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    }));

    setFormData((prev: any) => ({ ...prev, files: [...prev.files, ...filesArray] }));
    toast.success(`${filesArray.length} file(s) added`);
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  const handleSubmit = async () => {
    // Build multipart/form-data payload expected by the backend (files under 'files')
    const data = new FormData();
    data.append("manuscriptTitle", formData.manuscriptTitle || "");
    data.append("topic", formData.topic || "");
    data.append("abstract", formData.abstract || "");
    data.append("keywords", formData.keywords || "");

    // authors and declarations as JSON strings
    const authorsPayload = formData.authors.map((a: any, i: number) => ({
      fullName: a.fullName,
      email: a.email,
      affiliation: a.affiliation,
      isCorresponding: i === 0,
      order: i + 1,
    }));
    data.append("authors", JSON.stringify(authorsPayload));

    const declarations = [
      { type: "ETHICAL_CONDUCT", isChecked: formData.ethics, text: "Ethics approval confirmation" },
      { type: "CONFLICT_OF_INTEREST", isChecked: formData.conflicts, text: "Conflict of interest disclosure" },
      { type: "COPYRIGHT_TRANSFER", isChecked: formData.copyright, text: "Copyright transfer confirmation" },
    ];
    data.append("declarations", JSON.stringify(declarations));

    // Append files under the 'files' field (backend middleware expects 'files')
    formData.files.forEach((f: any) => {
      if (f && f.file) data.append("files", f.file, f.fileName || f.file.name);
    });

    try {
      const res = await fetch(`${API_URL}/submission`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: data,
      });

      const result = await res.json().catch(() => ({}));
        if (res.ok) {
        toast.success("Submission successful!");
        localStorage.removeItem("submission_form");
        setFormData({
          manuscriptTitle: "",
          topic: "",
          abstract: "",
          keywords: "",
          authors: [{ fullName: "", email: "", affiliation: "" }],
          files: [],
          ethics: false,
          conflicts: false,
          copyright: false,
        });
        setCurrentStep(1);
      } else {
        toast.error(result.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error submitting manuscript");
    }
  };

  const getFileStatus = (reqTitle: string) =>
    formData.files.find((f: any) => f.requirement === reqTitle) ? "Uploaded" : "Pending";

  return (
    <div className="min-h-screen py-8 md:py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6">Submit Your Research</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Submit your manuscript for peer review through our streamlined submission process.
          </p>
        </div>

        {/* Steps */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                </div>
                <div className="ml-2 sm:ml-3 text-sm font-medium hidden sm:block">{step.title}</div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block h-0.5 w-8 lg:w-16 mx-2 lg:mx-4 ${currentStep > step.number ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="sm:hidden flex justify-between mt-4 px-2">
            {steps.map((step) => (
              <div key={step.number} className="text-xs text-center max-w-16 truncate">{step.title}</div>
            ))}
          </div>
        </div>

        <Card className="shadow-strong">
          <CardContent className="p-4 sm:p-6 md:p-8">

            {/* Step 1 */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Manuscript Details</h2>
                <div className="space-y-4">
                  <div>
                    <Label>Article Title *</Label>
                    <Input
                      value={formData.manuscriptTitle}
                      onChange={(e) => setFormData({ ...formData, manuscriptTitle: e.target.value })}
                      placeholder="Enter your manuscript title"
                    />
                  </div>
                  <div>
                    <Label>Research Topic *</Label>
                    <Select value={formData.topic} onValueChange={(value) => setFormData({ ...formData, topic: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Topic" />
                      </SelectTrigger>
                      <SelectContent>
                        {topics.map((topic) => (
                          <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Keywords *</Label>
                    <Input
                      value={formData.keywords}
                      onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                      placeholder="Enter keywords separated by commas"
                    />
                  </div>
                  <div>
                    <Label>Abstract *</Label>
                    <Textarea
                      value={formData.abstract}
                      onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
                      className="min-h-32"
                      placeholder="Enter your abstract here..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Author Information</h2>
                {formData.authors.map((author: any, i: number) => (
                  <Card key={i} className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">
                        Author {i + 1} {i === 0 && <Badge className="ml-2 text-xs">Corresponding</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Input
                        placeholder="Full Name"
                        value={author.fullName}
                        onChange={(e) => updateAuthor(i, "fullName", e.target.value)}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={author.email}
                        onChange={(e) => updateAuthor(i, "email", e.target.value)}
                      />
                      <Input
                        placeholder="Affiliation"
                        value={author.affiliation}
                        onChange={(e) => updateAuthor(i, "affiliation", e.target.value)}
                      />
                    </CardContent>
                  </Card>
                ))}
                <Button onClick={addAuthor} variant="outline" className="w-full">Add Another Author</Button>
              </div>
            )}

            {/* Step 3 */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Upload Files</h2>
                {requirements.map((req, i) => (
                  <Card key={i} className="shadow-soft">
                    <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-medium flex items-center gap-2 flex-wrap">
                          {req.title}
                          <Badge variant={getFileStatus(req.title) === "Uploaded" ? "secondary" : "destructive"} className="text-xs">
                            {getFileStatus(req.title)}
                          </Badge>
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{req.description}</p>
                      </div>
                      <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                        <label className="cursor-pointer">
                          <Upload className="mr-2 h-4 w-4" /> Upload
                          <input type="file" hidden onChange={(e) => handleFileUpload(e, req.title)} className="sr-only" />
                        </label>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Step 4 */}
            {currentStep === 4 && (
              <div className="space-y-6">
                {/* Manuscript Details */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Manuscript Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p><b>Title:</b> {formData.manuscriptTitle || <span className="text-muted-foreground">Not provided</span>}</p>
                    <p><b>Topic:</b> {formData.topic || <span className="text-muted-foreground">Not selected</span>}</p>
                    <p><b>Keywords:</b> {formData.keywords || <span className="text-muted-foreground">Not provided</span>}</p>
                    <div><b>Abstract:</b>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{formData.abstract || "Not provided"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Authors */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Authors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="table-auto w-full border-collapse border border-border text-sm">
                        <thead>
                          <tr className="bg-muted-foreground/10">
                            <th className="border border-border px-3 py-2 text-left">#</th>
                            <th className="border border-border px-3 py-2 text-left">Full Name</th>
                            <th className="border border-border px-3 py-2 text-left hidden sm:table-cell">Email</th>
                            <th className="border border-border px-3 py-2 text-left hidden md:table-cell">Affiliation</th>
                            <th className="border border-border px-3 py-2 text-left">Corresponding</th>
                          </tr>
                        </thead>
                        <tbody>
                          {formData.authors.map((a: any, i: number) => (
                            <tr key={i} className="hover:bg-muted-foreground/5">
                              <td className="border border-border px-3 py-2">{i + 1}</td>
                              <td className="border border-border px-3 py-2 font-medium">{a.fullName || "-"}</td>
                              <td className="border border-border px-3 py-2 hidden sm:table-cell">{a.email || "-"}</td>
                              <td className="border border-border px-3 py-2 hidden md:table-cell">{a.affiliation || "-"}</td>
                              <td className="border border-border px-3 py-2">{i === 0 ? "Yes" : "No"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Uploaded Files */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Uploaded Files</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="table-auto w-full border-collapse border border-border text-sm">
                        <thead>
                          <tr className="bg-muted-foreground/10">
                            <th className="border border-border px-3 py-2 text-left">Requirement</th>
                            <th className="border border-border px-3 py-2 text-left hidden sm:table-cell">File Name</th>
                            <th className="border border-border px-3 py-2 text-left">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requirements.map((req, i) => {
                            const file = formData.files.find((f: any) => f.requirement === req.title);
                            return (
                              <tr key={i} className="hover:bg-muted-foreground/5">
                                <td className="border border-border px-3 py-2 font-medium">{req.title}</td>
                                <td className="border border-border px-3 py-2 hidden sm:table-cell">{file?.fileName || "-"}</td>
                                <td className="border border-border px-3 py-2">
                                  <Badge variant={file ? "secondary" : "destructive"} className="text-xs">
                                    {file ? "Uploaded" : "Pending"}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Declarations */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Declarations</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-col gap-2">
                      {(() => {
                        const declarations = [
                          { type: "ETHICAL_CONDUCT", isChecked: formData.ethics, text: "Ethics approval confirmation" },
                          { type: "CONFLICT_OF_INTEREST", isChecked: formData.conflicts, text: "Conflict of interest disclosure" },
                          { type: "COPYRIGHT_TRANSFER", isChecked: formData.copyright, text: "Copyright transfer confirmation" },
                        ];

                        return declarations.map((d: any, idx: number) => {
                          const id = `declaration-${idx}`;
                          return (
                            <div key={d.type + idx} className="flex items-start gap-3">
                              <Checkbox
                                id={id}
                                checked={!!d.isChecked}
                                onCheckedChange={(checked) => {
                                  const val = !!checked;
                                  if (d.type === "ETHICAL_CONDUCT") setFormData({ ...formData, ethics: val });
                                  else if (d.type === "CONFLICT_OF_INTEREST") setFormData({ ...formData, conflicts: val });
                                  else if (d.type === "COPYRIGHT_TRANSFER") setFormData({ ...formData, copyright: val });
                                }}
                              />
                              <Label htmlFor={id} className="text-sm">
                                {d.text}
                              </Label>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 md:pt-8">
              <Button variant="outline" onClick={prevStep} disabled={currentStep === 1} className="order-2 sm:order-1">
                Previous
              </Button>
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="order-1 sm:order-2 w-full sm:w-auto">Next</Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!(formData.ethics && formData.conflicts && formData.copyright)}
                  className="order-1 sm:order-2 w-full sm:w-auto"
                >
                  <Send className="mr-2 h-4 w-4" /> Submit Manuscript
                </Button>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Submission;
