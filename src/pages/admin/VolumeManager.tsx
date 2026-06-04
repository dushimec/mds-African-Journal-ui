import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Volume {
  id?: string;
  volume: number;
  year: number;
  issueCount?: number;
}

export default function VolumeManager() {
  const [formData, setFormData] = useState<Volume>({
    volume: 1,
    year: new Date().getFullYear(),
  });

  const [volumes, setVolumes] = useState<Volume[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Get token from local storage
  const token = localStorage.getItem("access_token");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch volumes (from issues grouped by volume)
  const fetchVolumes = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/issues/`,
        config
      );

      const issuesData = Array.isArray(res.data) ? res.data : res.data?.data || [];

      // Group issues by volume
      const volumeMap: { [key: number]: Volume } = {};
      issuesData.forEach((issue: any) => {
        if (!volumeMap[issue.volume]) {
          volumeMap[issue.volume] = {
            volume: issue.volume,
            year: issue.year,
            issueCount: 0,
          };
        }
        volumeMap[issue.volume].issueCount = (volumeMap[issue.volume].issueCount || 0) + 1;
      });

      const volumeList = Object.values(volumeMap).sort(
        (a, b) => b.volume - a.volume
      );
      setVolumes(volumeList);
    } catch (err) {
      console.error("Error fetching volumes:", err);
      Swal.fire("Error", "Failed to fetch volumes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVolumes();
  }, []);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.volume || !formData.year) {
      Swal.fire("Error", "Please fill in all fields", "error");
      return;
    }

    try {
      if (editId) {
        // Note: Volumes are created through issues, so we'd need to update the issue model
        // For now, we'll show a message
        Swal.fire(
          "Info",
          "Volumes are managed through issues. Edit issues to change volume details.",
          "info"
        );
      } else {
        // Creating a new volume is typically done by creating issues
        Swal.fire(
          "Info",
          "To create a new volume, create issues with the new volume number.",
          "info"
        );
      }

      setFormData({
        volume: 1,
        year: new Date().getFullYear(),
      });
      setEditId(null);
    } catch (error: any) {
      console.error("Error:", error);
      Swal.fire("Error", error.response?.data?.message || "An error occurred", "error");
    }
  };

  // Handle delete
  const handleDelete = async (volumeId: string | undefined) => {
    if (!volumeId) {
      Swal.fire("Error", "Volume ID is missing", "error");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will delete the entire volume and all related issues!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        // Note: Would need to implement volume deletion in backend
        Swal.fire(
          "Info",
          "Volume deletion would need backend support.",
          "info"
        );
        await fetchVolumes();
      } catch (error: any) {
        Swal.fire(
          "Error",
          error.response?.data?.message || "Failed to delete volume",
          "error"
        );
      }
    }
  };

  // Handle edit
  const handleEdit = (volume: Volume) => {
    setFormData({
      volume: volume.volume,
      year: volume.year,
    });
    setEditId(volume.id || null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold">Volume Manager</h2>
        <Badge variant="secondary">{volumes.length} Volumes</Badge>
      </div>

      {/* Form Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {editId ? "Edit Volume" : "Create Volume"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Volume Number
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.volume}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      volume: parseInt(e.target.value),
                    })
                  }
                  placeholder="e.g., 1, 2, 3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Publication Year
                </label>
                <Input
                  type="number"
                  min="2000"
                  max={new Date().getFullYear() + 5}
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      year: parseInt(e.target.value),
                    })
                  }
                  placeholder={new Date().getFullYear().toString()}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Processing..." : editId ? "Update Volume" : "Create Volume"}
              </Button>
              {editId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      volume: 1,
                      year: new Date().getFullYear(),
                    });
                    setEditId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Volumes List */}
      <Card>
        <CardHeader>
          <CardTitle>Published Volumes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-muted-foreground">Loading volumes...</p>
          ) : volumes.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No volumes created yet
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {volumes.map((volume) => (
                <Card key={volume.volume} className="border">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-bold">
                          Volume {volume.volume}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Year: {volume.year}
                        </p>
                      </div>

                      <div className="bg-slate-50 p-3 rounded">
                        <p className="text-sm text-muted-foreground mb-1">
                          Issues
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          {volume.issueCount || 0}
                        </p>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(volume)}
                          className="flex-1"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(volume.id)}
                          className="flex-1"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm">How Volumes Work</h3>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>
                Volumes are automatically created when issues are created with a
                new volume number
              </li>
              <li>Each volume typically contains 2 issues per year</li>
              <li>
                Volume numbers should be sequential (1, 2, 3, etc.)
              </li>
              <li>
                To create a new volume, create issues using the Issue Manager
                with the new volume number
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
