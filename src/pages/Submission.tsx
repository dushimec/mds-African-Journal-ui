import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle,
  Users,
  Send,
  Loader2, 
} from "lucide-react";
import { toast } from "react-toastify";

const Submission = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [topics, setTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ NEW

  const [formData, setFormData] = useState<any>({
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

  useEffect(() => {
    const savedData = localStorage.getItem("submission_form");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.ethics === undefined) parsed.ethics = false;
        if (parsed.conflicts === undefined) parsed.conflicts = false;
        if (parsed.copyright === undefined) parsed.copyright = false;
        setFormData(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("submission_form", JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await fetch(`${API_URL}/topic`);
        const data = await res.json();
        setTopics(data.data?.map((t: any) => t.name) || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTopics();
  }, []);

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
    {
      title: "Manuscript File",
      description: "Main manuscript in .docx or .pdf format",
      required: true,
    },
    {
      title: "Cover Letter",
      description: "Brief description of significance and novelty",
      required: true,
    },
    {
      title: "Ethics Documentation",
      description: "Ethics approval for human/animal studies",
      required: false,
    },
  ];

  const addAuthor = () =>
    setFormData({
      ...formData,
      authors: [...formData.authors, { fullName: "", email: "", affiliation: "" }],
    });

  const updateAuthor = (index: number, field: string, value: string) => {
    const updated = formData.authors.map((a: any, i: number) =>
      i === index ? { ...a, [field]: value } : a
    );
    setFormData({ ...formData, authors: updated });
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    requirement: string
  ) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files).map((file) => ({
      file,
      requirement,
      fileName: file.name,
      mimeType: file.type,
      fileSize: file.size,
    }));

    setFormData((prev: any) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));

    toast.success(`${files.length} file(s) added`);
  };

  const nextStep = () => currentStep < 4 && setCurrentStep(currentStep + 1);
  const prevStep = () => currentStep > 1 && setCurrentStep(currentStep - 1);


  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const data = new FormData();
    data.append("manuscriptTitle", formData.manuscriptTitle);
    data.append("topic", formData.topic);
    data.append("abstract", formData.abstract);
    data.append("keywords", formData.keywords);

    data.append(
      "authors",
      JSON.stringify(
        formData.authors.map((a: any, i: number) => ({
          ...a,
          isCorresponding: i === 0,
          order: i + 1,
        }))
      )
    );

    data.append(
      "declarations",
      JSON.stringify([
        { type: "ETHICAL_CONDUCT", isChecked: formData.ethics },
        { type: "CONFLICT_OF_INTEREST", isChecked: formData.conflicts },
        { type: "COPYRIGHT_TRANSFER", isChecked: formData.copyright },
      ])
    );

    formData.files.forEach((f: any) => {
      if (f?.file) data.append("files", f.file, f.fileName);
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
        setCurrentStep(1);
      } else {
        toast.error(result.message || "Submission failed");
      }
    } catch (err) {
      toast.error("Error submitting manuscript");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileStatus = (req: string) =>
    formData.files.find((f: any) => f.requirement === req)
      ? "Uploaded"
      : "Pending";

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto max-w-4xl px-4">
        <Card>
          <CardContent className="p-6">

            {/* STEP CONTENTS (UNCHANGED) */}

            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1 || isSubmitting}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button onClick={nextStep}>Next</Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    isSubmitting ||
                    !(formData.ethics && formData.conflicts && formData.copyright)
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Submit Manuscript
                    </>
                  )}
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
