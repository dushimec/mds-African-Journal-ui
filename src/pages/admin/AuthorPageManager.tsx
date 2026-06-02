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
    submissionSteps: [] as any[],
    articleTypes: [] as any[],
    guidelines: [] as any[],
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
        submissionSteps: data.submissionSteps || [],
        articleTypes: data.articleTypes || [],
        guidelines: data.guidelines || [],
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

      setIsSaving(true);
      const response = await axios.patch(
        `${API_URL}/author-page`,
        {
          title: formData.title,
          tagline: formData.tagline,
          submissionSteps: formData.submissionSteps,
          articleTypes: formData.articleTypes,
          guidelines: formData.guidelines,
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
          submissionSteps: response.data.data.submissionSteps,
          articleTypes: response.data.data.articleTypes,
          guidelines: response.data.data.guidelines,
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
              <div className="space-y-4">
                {formData.submissionSteps.map((step, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Step Number</Label>
                          <Input
                            type="number"
                            value={step.step || index + 1}
                            onChange={(e) => {
                              const updated = [...formData.submissionSteps];
                              updated[index].step = parseInt(e.target.value);
                              setFormData({ ...formData, submissionSteps: updated });
                            }}
                            disabled={isSaving}
                          />
                        </div>
                        <div>
                          <Label>Icon</Label>
                          <Input
                            value={step.icon || ""}
                            onChange={(e) => {
                              const updated = [...formData.submissionSteps];
                              updated[index].icon = e.target.value;
                              setFormData({ ...formData, submissionSteps: updated });
                            }}
                            placeholder="e.g., FileText, Send, CheckCircle"
                            disabled={isSaving}
                          />
                        </div>
                      </div>
                      <div>
                        <Label>Title</Label>
                        <Input
                          value={step.title || ""}
                          onChange={(e) => {
                            const updated = [...formData.submissionSteps];
                            updated[index].title = e.target.value;
                            setFormData({ ...formData, submissionSteps: updated });
                          }}
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={step.description || ""}
                          onChange={(e) => {
                            const updated = [...formData.submissionSteps];
                            updated[index].description = e.target.value;
                            setFormData({ ...formData, submissionSteps: updated });
                          }}
                          className="min-h-[80px]"
                          disabled={isSaving}
                        />
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updated = formData.submissionSteps.filter((_, i) => i !== index);
                          setFormData({ ...formData, submissionSteps: updated });
                        }}
                        disabled={isSaving}
                      >
                        Remove Step
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      submissionSteps: [
                        ...formData.submissionSteps,
                        { step: formData.submissionSteps.length + 1, title: "", description: "", icon: "" },
                      ],
                    });
                  }}
                  disabled={isSaving}
                >
                  Add Submission Step
                </Button>
              </div>
            </TabsContent>

            {/* Article Types Tab */}
            <TabsContent value="types" className="space-y-4">
              <div className="space-y-4">
                {formData.articleTypes.map((type, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Type Name</Label>
                        <Input
                          value={type.type || ""}
                          onChange={(e) => {
                            const updated = [...formData.articleTypes];
                            updated[index].type = e.target.value;
                            setFormData({ ...formData, articleTypes: updated });
                          }}
                          disabled={isSaving}
                        />
                      </div>
                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={type.description || ""}
                          onChange={(e) => {
                            const updated = [...formData.articleTypes];
                            updated[index].description = e.target.value;
                            setFormData({ ...formData, articleTypes: updated });
                          }}
                          className="min-h-[80px]"
                          disabled={isSaving}
                        />
                      </div>
                      {type.description2 && (
                        <div>
                          <Label>Additional Description</Label>
                          <Textarea
                            value={type.description2 || ""}
                            onChange={(e) => {
                              const updated = [...formData.articleTypes];
                              updated[index].description2 = e.target.value;
                              setFormData({ ...formData, articleTypes: updated });
                            }}
                            className="min-h-[80px]"
                            disabled={isSaving}
                          />
                        </div>
                      )}
                      <div className="space-y-2">
                        <Label>Items</Label>
                        {(type.items || []).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <Input
                              value={item}
                              onChange={(e) => {
                                const updated = [...formData.articleTypes];
                                updated[index].items[itemIndex] = e.target.value;
                                setFormData({ ...formData, articleTypes: updated });
                              }}
                              placeholder="Enter item"
                              disabled={isSaving}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updated = [...formData.articleTypes];
                                updated[index].items = updated[index].items.filter((_: any, i: number) => i !== itemIndex);
                                setFormData({ ...formData, articleTypes: updated });
                              }}
                              disabled={isSaving}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = [...formData.articleTypes];
                            if (!updated[index].items) updated[index].items = [];
                            updated[index].items.push("");
                            setFormData({ ...formData, articleTypes: updated });
                          }}
                          disabled={isSaving}
                        >
                          Add Item
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updated = formData.articleTypes.filter((_, i) => i !== index);
                          setFormData({ ...formData, articleTypes: updated });
                        }}
                        disabled={isSaving}
                      >
                        Remove Type
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      articleTypes: [
                        ...formData.articleTypes,
                        { type: "", description: "", items: [] },
                      ],
                    });
                  }}
                  disabled={isSaving}
                >
                  Add Article Type
                </Button>
              </div>
            </TabsContent>

            {/* Guidelines Tab */}
            <TabsContent value="guidelines" className="space-y-4">
              <div className="space-y-4">
                {formData.guidelines.map((guideline, index) => (
                  <Card key={index} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={guideline.category || ""}
                          onChange={(e) => {
                            const updated = [...formData.guidelines];
                            updated[index].category = e.target.value;
                            setFormData({ ...formData, guidelines: updated });
                          }}
                          placeholder="e.g., Format, Structure, Citation"
                          disabled={isSaving}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Items</Label>
                        {(guideline.items || []).map((item, itemIndex) => (
                          <div key={itemIndex} className="flex gap-2">
                            <Textarea
                              value={item}
                              onChange={(e) => {
                                const updated = [...formData.guidelines];
                                updated[index].items[itemIndex] = e.target.value;
                                setFormData({ ...formData, guidelines: updated });
                              }}
                              placeholder="Enter guideline item"
                              className="min-h-[50px]"
                              disabled={isSaving}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updated = [...formData.guidelines];
                                updated[index].items = updated[index].items.filter((_: any, i: number) => i !== itemIndex);
                                setFormData({ ...formData, guidelines: updated });
                              }}
                              disabled={isSaving}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const updated = [...formData.guidelines];
                            if (!updated[index].items) updated[index].items = [];
                            updated[index].items.push("");
                            setFormData({ ...formData, guidelines: updated });
                          }}
                          disabled={isSaving}
                        >
                          Add Item
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          const updated = formData.guidelines.filter((_, i) => i !== index);
                          setFormData({ ...formData, guidelines: updated });
                        }}
                        disabled={isSaving}
                      >
                        Remove Category
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  onClick={() => {
                    setFormData({
                      ...formData,
                      guidelines: [
                        ...formData.guidelines,
                        { category: "", items: [] },
                      ],
                    });
                  }}
                  disabled={isSaving}
                >
                  Add Guideline Category
                </Button>
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

