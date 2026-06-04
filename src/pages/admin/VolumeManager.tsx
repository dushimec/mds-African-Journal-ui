import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { validateIssuesPerVolume } from "@/lib/issueValidation";

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

      let issuesData = Array.isArray(res.data) ? res.data : res.data?.data || [];
      
      // ✅ Validate: max 2 issues per volume
      issuesData = validateIssuesPerVolume(issuesData);

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
              {volumes.map((volume) => {
                const isComplete = volume.issueCount === 2;
                return (
                  <Card key={volume.volume} className={`border ${isComplete ? 'border-green-300' : 'border-yellow-300'}`}>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-bold">
                              Volume {volume.volume}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Year: {volume.year}
                            </p>
                          </div>
                          <Badge 
                            variant={isComplete ? "default" : "secondary"}
                            className={isComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}
                          >
                            {isComplete ? '✓ Complete' : '⚠ Incomplete'}
                          </Badge>
                        </div>

                        <div className={`${isComplete ? 'bg-green-50' : 'bg-yellow-50'} p-3 rounded`}>
                          <p className="text-sm text-muted-foreground mb-1">
                            Issues
                          </p>
                          <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-bold text-primary">
                              {volume.issueCount || 0}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              / 2 (max)
                            </p>
                          </div>
                          {!isComplete && (
                            <p className="text-xs text-yellow-700 mt-2">
                              Missing {2 - (volume.issueCount || 0)} issue(s)
                            </p>
                          )}
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
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">📋 Journal Structure & Rules</h3>
            <div className="bg-white p-3 rounded border-l-4 border-blue-500">
              <p className="text-sm font-medium text-gray-700 mb-2">🔑 Key Constraint:</p>
              <p className="text-sm text-gray-600 mb-3">
                <strong>Each Volume can have a maximum of 2 Issues only</strong>
              </p>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>
                  <strong>Volume</strong> = One publication year (e.g., 2026, 2027)
                </li>
                <li>
                  <strong>Issue 1:</strong> January – June publication period
                </li>
                <li>
                  <strong>Issue 2:</strong> July – December publication period
                </li>
                <li>
                  Total: 2 issues per volume, no more, no less
                </li>
              </ul>
            </div>
            <div className="text-xs text-gray-600 space-y-1 pt-2">
              <p>✅ How to create a volume:</p>
              <p className="ml-2">1. Go to Issue Manager</p>
              <p className="ml-2">2. Create Issue 1 with Volume number (e.g., 1)</p>
              <p className="ml-2">3. Create Issue 2 with same Volume number</p>
              <p className="ml-2">4. Volume will appear here automatically</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
