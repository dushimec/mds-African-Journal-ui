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
import {toast} from 'react-toastify'

const Submission = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate(); 

  const [currentStep, setCurrentStep] = useState(1);
  const [topics, setTopics] = useState<string[]>([]);
  const [formData, setFormData] = useState({
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

  // Fetch topics from API
  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch("https://mds-journal-backend.vercel.app/api/v1/topic");
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
    const token = localStorage.getItem("access_token") 
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

  // Author handlers
  const addAuthor = () =>
    setFormData({
      ...formData,
      authors: [...formData.authors, { fullName: "", email: "", affiliation: "" }]
    });

  const updateAuthor = (index: number, field: string, value: string) => {
    const updatedAuthors = formData.authors.map((author, i) =>
      i === index ? { ...author, [field]: value } : author
    );
    setFormData({ ...formData, authors: updatedAuthors });
  };

  // File upload handler
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    requirement: string
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.error("You must login first!");
      navigate("/login");
      return;
    }

    const filesArray = Array.from(event.target.files);
    const data = new FormData();

    filesArray.forEach((file) => {
      data.append("files", file);
    });

    try {
      const res = await fetch(`${API_URL}/submission/upload-multiple`, {
        method: "POST",
        body: data,
        headers: { Authorization: `Bearer ${token}` },
      });

      const contentType = res.headers.get("content-type");
      let result: any = {};
      if (contentType && contentType.includes("application/json")) {
        result = await res.json();
        toast.success("File upload successfully");
      } else {
        const text = await res.text();
        toast.error("File upload failed");
        return;
      }

      if (res.ok) {
        const uploadedFiles = result.files.map((file: any) => ({
          ...file,
          requirement,
        }));

        setFormData((prev) => ({
          ...prev,
          files: [...prev.files, ...uploadedFiles],
        }));
        toast.success("File upload successfully");
      } else {
        toast.error(result.message || "File upload failed");
      }
    } catch (err) {
      toast.error("Error uploading file");
    }
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);

  // Submission
  const handleSubmit = async () => {
    const payload = {
      manuscriptTitle: formData.manuscriptTitle,
      topic: formData.topic,
      abstract: formData.abstract,
      keywords: formData.keywords,
      authors: formData.authors.map((a, i) => ({
        fullName: a.fullName,
        email: a.email,
        affiliation: a.affiliation,
        isCorresponding: i === 0,
        order: i + 1,
      })),
      files: formData.files.map((f) => ({
        fileName: f.fileName || f.original_filename || f.name,
        fileUrl: f.fileUrl || f.secure_url,
        mimeType: f.mimeType || f.type || "application/pdf",
        fileSize: f.fileSize || f.bytes || 1000,
        fileType:
          f.requirement === "Manuscript File"
            ? "MANUSCRIPT"
            : f.requirement === "Cover Letter"
            ? "COVER_LETTER"
            : "ETHICS_DOCUMENTATION",
      })),
      declarations: [
        {
          type: "ETHICAL_CONDUCT",
          isChecked: formData.ethics,
          text: "Ethics approval confirmation",
        },
        {
          type: "CONFLICT_OF_INTEREST",
          isChecked: formData.conflicts,
          text: "Conflict of interest disclosure",
        },
        {
          type: "COPYRIGHT_TRANSFER",
          isChecked: formData.copyright,
          text: "Copyright transfer confirmation",
        },
      ],
    };

    try {
      const res = await fetch(`${API_URL}/submission`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success("Submission successful!");
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
      toast.error("Error submitting manuscript");
    }
  };

  const getFileStatus = (reqTitle: string) => {
    return formData.files.find(f => f.requirement === reqTitle) ? "Uploaded" : "Pending";
  };

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

        {/* Steps - Responsive */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${currentStep >= step.number ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"}`}>
                  {currentStep > step.number ? <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6" /> : <step.icon className="h-5 w-5 sm:h-6 sm:w-6" />}
                </div>
                <div className="ml-2 sm:ml-3 text-sm font-medium hidden sm:block">{step.title}</div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block h-0.5 w-8 lg:w-16 mx-2 lg:mx-4 ${currentStep > step.number ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            ))}
          </div>
          {/* Mobile step titles */}
          <div className="sm:hidden flex justify-between mt-4 px-2">
            {steps.map((step) => (
              <div key={step.number} className="text-xs text-center max-w-16 truncate">
                {step.title}
              </div>
            ))}
          </div>
        </div>

        {/* Card */}
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
                    <Select value={formData.topic} onValueChange={(value) => setFormData({...formData, topic: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Topic"/>
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
                {formData.authors.map((author, i) => (
                  <Card key={i} className="shadow-soft">
                    <CardHeader>
                      <CardTitle className="text-base sm:text-lg">
                        Author {i+1} 
                        {i===0 && <Badge className="ml-2 text-xs">Corresponding</Badge>}
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
                <Button onClick={addAuthor} variant="outline" className="w-full">
                  Add Another Author
                </Button>
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
                          <Upload className="mr-2 h-4 w-4"/> 
                          Upload
                          <input 
                            type="file" 
                            hidden 
                            onChange={(e) => handleFileUpload(e, req.title)} 
                            className="sr-only"
                          />
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
                <h2 className="text-xl sm:text-2xl font-bold mb-6">Review & Submit</h2>

                {/* Manuscript Details */}
                <Card className="shadow-soft">
                  <CardHeader>
                    <CardTitle className="text-lg">Manuscript Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p><b>Title:</b> {formData.manuscriptTitle || <span className="text-muted-foreground">Not provided</span>}</p>
                    <p><b>Topic:</b> {formData.topic || <span className="text-muted-foreground">Not selected</span>}</p>
                    <p><b>Keywords:</b> {formData.keywords || <span className="text-muted-foreground">Not provided</span>}</p>
                    <div>
                      <b>Abstract:</b>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {formData.abstract || "Not provided"}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Authors Table */}
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
                          {formData.authors.map((a, i) => (
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

                {/* Files Table */}
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
                            const uploadedFile = formData.files.find(f => f.requirement === req.title);
                            return (
                              <tr key={i} className="hover:bg-muted-foreground/5">
                                <td className="border border-border px-3 py-2 font-medium">{req.title}</td>
                                <td className="border border-border px-3 py-2 hidden sm:table-cell">
                                  {uploadedFile?.fileName || "-"}
                                </td>
                                <td className="border border-border px-3 py-2">
                                  <Badge variant={uploadedFile ? "secondary" : "destructive"} className="text-xs">
                                    {uploadedFile ? "Uploaded" : "Pending"}
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
                    <p className="text-sm text-muted-foreground mt-1">
                      Please confirm each declaration before submitting your manuscript.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted-foreground/5 transition">
                      <div className="flex-1 mr-4">
                        <p className="font-medium">Ethics Approval</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          I confirm that all research involving human or animal subjects has received ethics approval.
                        </p>
                      </div>
                      <Checkbox 
                        checked={formData.ethics} 
                        onCheckedChange={(v) => setFormData({ ...formData, ethics: v as boolean })} 
                      />
                    </div>

                    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted-foreground/5 transition">
                      <div className="flex-1 mr-4">
                        <p className="font-medium">Conflict of Interest</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          I declare that there are no conflicts of interest related to this manuscript.
                        </p>
                      </div>
                      <Checkbox 
                        checked={formData.conflicts} 
                        onCheckedChange={(v) => setFormData({ ...formData, conflicts: v as boolean })} 
                      />
                    </div>

                    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted-foreground/5 transition">
                      <div className="flex-1 mr-4">
                        <p className="font-medium">Copyright Transfer</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          I confirm that I have the right to transfer copyright to the publisher upon acceptance.
                        </p>
                      </div>
                      <Checkbox 
                        checked={formData.copyright} 
                        onCheckedChange={(v) => setFormData({ ...formData, copyright: v as boolean })} 
                      />
                    </div>
                  </CardContent>
                </Card>

              </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 md:pt-8">
              <Button 
                variant="outline" 
                onClick={prevStep} 
                disabled={currentStep===1}
                className="order-2 sm:order-1"
              >
                Previous
              </Button>
              {currentStep < 4 ? (
                <Button onClick={nextStep} className="order-1 sm:order-2 w-full sm:w-auto">
                  Next
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.ethics || !formData.conflicts || !formData.copyright}
                  className="order-1 sm:order-2 w-full sm:w-auto"
                >
                  <Send className="mr-2 h-4 w-4"/>
                  Submit Manuscript
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