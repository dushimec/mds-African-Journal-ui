import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

interface AuthorPageContent {
  id: string;
  title: string;
  tagline: string;
  submissionSteps: any[];
  articleTypes: any[];
  guidelines: any[];
  updatedAt: string;
}

const AuthorPageManager = () => {
  const [content, setContent] = useState<AuthorPageContent | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    tagline: "",
    submissionStepsJson: "",
    articleTypesJson: "",
    guidelinesJson: "",
  });
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("access_token");

  // Fetch author page content
  useEffect(() => {
    fetchAuthorPageContent();
  }, []);

  const fetchAuthorPageContent = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/author-page`);
      const data = res.data.data;
      setContent(data);
      setFormData({
        title: data.title,
        tagline: data.tagline,
        submissionStepsJson: JSON.stringify(data.submissionSteps, null, 2),
        articleTypesJson: JSON.stringify(data.articleTypes, null, 2),
        guidelinesJson: JSON.stringify(data.guidelines, null, 2),
      });
    } catch (error: any) {
      console.error("Error fetching author page content:", error);
      toast.error(error.response?.data?.message || "Failed to fetch author page content");
    } finally {
      setLoading(false);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm("Are you sure? This will reset all content to defaults.")) {
      fetchAuthorPageContent();
      toast.info("Content reset to defaults");
    }
  };

  const handleSaveContent = async () => {
    try {
      if (!formData.title.trim() || !formData.tagline.trim()) {
        toast.error("Title and tagline are required");
        return;
      }

      // Validate JSON
      let submissionSteps, articleTypes, guidelines;
      try {
        submissionSteps = formData.submissionStepsJson ? JSON.parse(formData.submissionStepsJson) : [];
        articleTypes = formData.articleTypesJson ? JSON.parse(formData.articleTypesJson) : [];
        guidelines = formData.guidelinesJson ? JSON.parse(formData.guidelinesJson) : [];
      } catch (e) {
        toast.error("Invalid JSON format in one or more sections");
        return;
      }

      setIsSaving(true);
      const response = await axios.patch(
        `${API_URL}/author-page`,
        {
          title: formData.title,
          tagline: formData.tagline,
          submissionSteps,
          articleTypes,
          guidelines,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Author page content updated successfully");
        setContent(response.data.data);
        setFormData({
          title: response.data.data.title,
          tagline: response.data.data.tagline,
          submissionStepsJson: JSON.stringify(response.data.data.submissionSteps, null, 2),
          articleTypesJson: JSON.stringify(response.data.data.articleTypes, null, 2),
          guidelinesJson: JSON.stringify(response.data.data.guidelines, null, 2),
        });
      }
    } catch (error: any) {
      console.error("Error saving author page content:", error);
      toast.error(error.response?.data?.message || "Failed to save author page content");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Author Page - Full Content Editor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            Edit all dynamic content for the Author Guidelines page. All changes are saved in real-time on the frontend.
          </p>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="steps">Submission Steps</TabsTrigger>
              <TabsTrigger value="types">Article Types</TabsTrigger>
              <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            </TabsList>

            {/* Basic Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter page title"
                  disabled={isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tagline">Page Tagline / Subtitle</Label>
                <Textarea
                  id="tagline"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  placeholder="Enter page tagline"
                  className="min-h-[100px]"
                  disabled={isSaving}
                />
              </div>
            </TabsContent>

            {/* Submission Steps Tab */}
            <TabsContent value="steps" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="stepsJson">Submission Steps (JSON)</Label>
                <Textarea
                  id="stepsJson"
                  value={formData.submissionStepsJson}
                  onChange={(e) => setFormData({ ...formData, submissionStepsJson: e.target.value })}
                  placeholder="Enter submission steps as JSON"
                  className="min-h-[400px] font-mono text-sm"
                  disabled={isSaving}
                />
                <p className="text-xs text-gray-500">
                  Edit the JSON array for submission steps. Each step should have: step (number), title, description, and icon (string).
                </p>
              </div>
            </TabsContent>

            {/* Article Types Tab */}
            <TabsContent value="types" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="typesJson">Article Types (JSON)</Label>
                <Textarea
                  id="typesJson"
                  value={formData.articleTypesJson}
                  onChange={(e) => setFormData({ ...formData, articleTypesJson: e.target.value })}
                  placeholder="Enter article types as JSON"
                  className="min-h-[400px] font-mono text-sm"
                  disabled={isSaving}
                />
                <p className="text-xs text-gray-500">
                  Edit the JSON array for article types. Each type should have: type, description, items (array), and optional description2.
                </p>
              </div>
            </TabsContent>

            {/* Guidelines Tab */}
            <TabsContent value="guidelines" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="guidelinesJson">Guidelines (JSON)</Label>
                <Textarea
                  id="guidelinesJson"
                  value={formData.guidelinesJson}
                  onChange={(e) => setFormData({ ...formData, guidelinesJson: e.target.value })}
                  placeholder="Enter guidelines as JSON"
                  className="min-h-[400px] font-mono text-sm"
                  disabled={isSaving}
                />
                <p className="text-xs text-gray-500">
                  Edit the JSON array for guidelines. Each guideline should have: category and items (array of strings).
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {content && (
            <div className="text-xs text-gray-500">
              Last updated: {new Date(content.updatedAt).toLocaleDateString()} at {new Date(content.updatedAt).toLocaleTimeString()}
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleResetToDefaults} disabled={isSaving}>
              <RotateCcw size={16} className="mr-2" />
              Reset to Defaults
            </Button>
            <Button onClick={handleSaveContent} disabled={isSaving}>
              {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
              {isSaving ? "Saving..." : "Save All Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthorPageManager;

