import React, { useState, useEffect } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Edit2, Save, X } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = import.meta.env.VITE_API_URL;

interface Author {
  id: string;
  fullName: string;
  email: string;
  affiliation?: string;
  pageContent?: string;
  updatedAt: string;
}

interface AuthorContentManagementProps {
  onClose?: () => void;
}

const AuthorContentManagement = ({ onClose }: AuthorContentManagementProps) => {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingAuthor, setEditingAuthor] = useState<Author | null>(null);
  const [pageContent, setPageContent] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const token = localStorage.getItem("access_token");

  // Fetch all authors with content
  useEffect(() => {
    fetchAuthors();
  }, []);

  const fetchAuthors = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/author-content`, {
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

  const handleEditAuthorContent = (author: Author) => {
    setEditingAuthor(author);
    setPageContent(author.pageContent || "");
    setIsDialogOpen(true);
  };

  const handleSaveContent = async () => {
    if (!editingAuthor) return;

    try {
      setIsSaving(true);
      const response = await axios.patch(
        `${API_URL}/author-content/${editingAuthor.id}`,
        { pageContent },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        toast.success("Author content updated successfully");
        setAuthors(
          authors.map((author) =>
            author.id === editingAuthor.id
              ? { ...author, pageContent, updatedAt: new Date().toISOString() }
              : author
          )
        );
        setIsDialogOpen(false);
        setEditingAuthor(null);
        setPageContent("");
      }
    } catch (error: any) {
      console.error("Error saving author content:", error);
      toast.error(error.response?.data?.message || "Failed to save author content");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingAuthor(null);
    setPageContent("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Manage Author Page Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 mb-4">
            Edit and manage individual author profile page content. This content will be
            displayed on each author's profile page.
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="animate-spin" />
            </div>
          ) : authors.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No authors found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Affiliation</TableHead>
                    <TableHead>Content Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authors.map((author) => (
                    <TableRow key={author.id}>
                      <TableCell className="font-medium">{author.fullName}</TableCell>
                      <TableCell className="text-sm">{author.email}</TableCell>
                      <TableCell className="text-sm">{author.affiliation || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={author.pageContent ? "default" : "outline"}>
                          {author.pageContent ? "Has Content" : "No Content"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(author.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditAuthorContent(author)}
                          className="gap-2"
                        >
                          <Edit2 size={16} />
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Author Content Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Author Page Content</DialogTitle>
            <DialogDescription>
              Add or edit content for {editingAuthor?.fullName}'s profile page
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm">
                <strong>Author:</strong> {editingAuthor?.fullName}
              </div>
              <div className="mb-4 text-sm">
                <strong>Email:</strong> {editingAuthor?.email}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="pageContent">
                Page Content <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="pageContent"
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                placeholder="Enter author profile page content. You can use HTML or plain text."
                className="min-h-[300px] font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Tip: Use clear formatting. This content will be displayed on the author's profile page.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseDialog} disabled={isSaving}>
                <X size={16} className="mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSaveContent} disabled={isSaving}>
                {isSaving && <Loader2 size={16} className="mr-2 animate-spin" />}
                {isSaving ? "Saving..." : "Save Content"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuthorContentManagement;
