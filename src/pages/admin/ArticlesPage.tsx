import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Edit, Trash2, Plus, Save, X, RefreshCcw } from "lucide-react";

export default function ArticleDashboard() {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    authors: "",
    abstract: "",
    pdfUrl: "",
    keywords: "",
    issue: "",
  });

  const API_URL = "http://localhost:3005/api/v1/articles";

  // Fetch all articles
  const fetchArticles = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in to view articles.");
        return;
      }
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setArticles(res.data.data || []);
    } catch (err) {
      console.error("Error fetching articles:", err);
      alert("Failed to fetch articles.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Insert / Update
  const handleSave = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in to save articles.");
        return;
      }

      // Validate required fields
      if (!formData.title || !formData.authors || !formData.keywords || !formData.issue) {
        alert("Please fill in all required fields: title, authors, keywords, and issue.");
        return;
      }

      // Convert authors string to array of objects
      const authorsArray = formData.authors
        .split(",")
        .map((name) => ({ fullName: name.trim() }));

      // Map issue input to topicId
      const topicId = formData.issue;

      // Set publishedAt to now
      const publishedAt = new Date().toISOString();

      // Prepare FormData for file upload
      const payload = new FormData();
      payload.append("title", formData.title);
      payload.append("authors", JSON.stringify(authorsArray));
      payload.append("abstract", formData.abstract || "");
      payload.append("keywords", formData.keywords);
      payload.append("topicId", topicId);
      payload.append("publishedAt", publishedAt);
      if (pdfFile) payload.append("pdf", pdfFile);

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await axios.post(API_URL, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      // Reset form
      setFormData({
        title: "",
        authors: "",
        abstract: "",
        pdfUrl: "",
        keywords: "",
        issue: "",
      });
      setPdfFile(null);
      setEditingId(null);
      setOpenForm(false);
      fetchArticles();
    } catch (err: any) {
      console.error("Error saving article:", err);
      alert(err.response?.data?.message || "Failed to save article.");
    }
  };

  // Handle Edit
  const handleEdit = async (id: string) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in to edit articles.");
        return;
      }

      const res = await axios.get(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;

      setFormData({
        title: data.title || "",
        authors: Array.isArray(data.authors) ? data.authors.map((a: any) => a.fullName).join(", ") : data.authors || "",
        abstract: data.abstract || "",
        pdfUrl: data.pdfUrl || "",
        keywords: data.keywords || "",
        issue: data.issue || "",
      });

      setEditingId(id);
      setOpenForm(true);
    } catch (err) {
      console.error("Error fetching article:", err);
      alert("Failed to fetch article for editing.");
    }
  };

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this article?")) return;

    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        alert("You must be logged in to delete articles.");
        return;
      }

      await axios.delete(`${API_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchArticles();
    } catch (err) {
      console.error("Error deleting article:", err);
      alert("Failed to delete article.");
    }
  };

  // Filter logic
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const authorNames = Array.isArray(article.authors)
        ? article.authors.map((a: any) => a.fullName).join(" ")
        : typeof article.authors === "string"
        ? article.authors
        : "";

      const matchesSearch =
        article.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        authorNames.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDate = filterDate
        ? article.publishedAt?.startsWith(filterDate) ?? false
        : true;

      return matchesSearch && matchesDate;
    });
  }, [articles, searchTerm, filterDate]);

  useEffect(() => {
    fetchArticles();
  }, []);

  return (
    <div className="min-h-screen w-full px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold">📄 Articles Management</h1>
        <div className="flex flex-col md:flex-row gap-3">
          <Input
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" onClick={fetchArticles}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setOpenForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableCell>Title</TableCell>
              <TableCell>Authors</TableCell>
              <TableCell>Abstract</TableCell>
              <TableCell>Keywords</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Issue</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  Loading articles...
                </TableCell>
              </TableRow>
            ) : filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-medium">{article.title}</TableCell>
                  <TableCell>
                    {Array.isArray(article.authors)
                      ? article.authors.map((a: any) => a.fullName).join(", ")
                      : typeof article.authors === "string"
                      ? article.authors
                      : ""}
                  </TableCell>
                  <TableCell
                    className="max-w-sm truncate"
                    title={article.abstract}
                  >
                    {article.abstract}
                  </TableCell>
                  <TableCell>{article.keywords}</TableCell>
                  <TableCell>
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{article.issue || "—"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(article.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(article.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                  No articles found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal Form */}
      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Article" : "Add New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              placeholder="Authors (comma separated)"
              value={formData.authors}
              onChange={(e) => setFormData({ ...formData, authors: e.target.value })}
            />
            <Input
              placeholder="Abstract"
              value={formData.abstract}
              onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
            />
            <Input
              type="file"
              accept="application/pdf"
              onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
            />
            <Input
              placeholder="Keywords"
              value={formData.keywords}
              onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
            />
            <Input
              placeholder="Issue / Topic"
              value={formData.issue}
              onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
            />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setOpenForm(false)}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                {editingId ? "Update" : "Insert"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}