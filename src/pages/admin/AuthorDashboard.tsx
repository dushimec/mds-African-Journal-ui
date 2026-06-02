import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2, Search } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

const API_URL = import.meta.env.VITE_API_URL;

interface Author {
  id?: string;
  fullName: string;
  email: string;
  affiliation?: string;
  isCorresponding?: boolean;
}

const AuthorDashboard = () => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [formData, setFormData] = useState<Author>({
    fullName: "",
    email: "",
    affiliation: "",
  });

  const token = localStorage.getItem("access_token");

  // Fetch authors
  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/authors`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAuthors(res.data.data || []);
    } catch (error: any) {
      console.error("Error fetching authors:", error);
      toast.error(error.response?.data?.message || "Failed to fetch authors");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (author?: Author) => {
    if (author) {
      setEditingAuthor(author);
      setFormData(author);
    } else {
      setEditingAuthor(null);
      setFormData({ fullName: "", email: "", affiliation: "" });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAuthor(null);
    setFormData({ fullName: "", email: "", affiliation: "" });
  };

  const handleSave = async () => {
    // Validate
    if (!formData.fullName.trim()) {
      toast.error("Full name is required");
      return;
    }
    if (!formData.email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };

      if (editingAuthor?.id) {
        // Update
        const res = await axios.put(
          `${API_URL}/authors/${editingAuthor.id}`,
          formData,
          { headers }
        );
        toast.success("Author updated successfully");
        setAuthors(authors.map(a => a.id === editingAuthor.id ? res.data.data : a));
      } else {
        // Create
        const res = await axios.post(`${API_URL}/authors`, formData, {
          headers,
        });
        toast.success("Author created successfully");
        setAuthors([...authors, res.data.data]);
      }

      handleCloseDialog();
    } catch (error: any) {
      console.error("Error saving author:", error);
      toast.error(error.response?.data?.message || "Failed to save author");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This author record will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Delete",
    });

    if (!result.isConfirmed) return;

    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/authors/${id}`, { headers });
      toast.success("Author deleted successfully");
      setAuthors(authors.filter(a => a.id !== id));
    } catch (error: any) {
      console.error("Error deleting author:", error);
      toast.error(error.response?.data?.message || "Failed to delete author");
    }
  };

  const filteredAuthors = authors.filter(author =>
    author.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    author.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Author Management</h1>
          <p className="text-muted-foreground">Manage journal authors and co authors</p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Author
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading && !authors.length ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead className="hidden lg:table-cell">Affiliation</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAuthors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No authors found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAuthors.map((author) => (
                      <TableRow key={author.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{author.fullName}</p>
                            <p className="text-sm text-muted-foreground md:hidden">{author.email}</p>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">{author.email}</TableCell>
                        <TableCell className="hidden lg:table-cell">{author.affiliation || "-"}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenDialog(author)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => author.id && handleDelete(author.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAuthor ? "Edit Author" : "Add New Author"}
            </DialogTitle>
            <DialogDescription>
              {editingAuthor
                ? "Update author information"
                : "Create a new author record"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="john@example.com"
              />
            </div>

            <div>
              <Label htmlFor="affiliation">Affiliation</Label>
              <Input
                id="affiliation"
                value={formData.affiliation}
                onChange={(e) =>
                  setFormData({ ...formData, affiliation: e.target.value })
                }
                placeholder="University/Institution"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingAuthor ? "Update" : "Create"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorDashboard;
