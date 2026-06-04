import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil, Trash2 } from "lucide-react";

interface Issue {
  id?: string;
  volume: number;
  issue: number;
  year: number;
}

export default function IssueManager() {
  const [formData, setFormData] = useState<Issue>({
    volume: 1,
    issue: 1,
    year: new Date().getFullYear(),
  });

  const [issues, setIssues] = useState<Issue[]>([]);
  const [editId, setEditId] = useState<number | null>(null);

  // 🧾 get token from local storage
  const token = localStorage.getItem("access_token");

  // 📡 axios config with auth header
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // ✅ Fetch Issues
  const fetchIssues = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/issues/`,
        config
      );
      console.log("API response:", res.data);

      const data = Array.isArray(res.data) ? res.data : res.data?.data;
      setIssues(data || []);
    } catch (err) {
      console.error("Error fetching issues", err);
      setIssues([]);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  // ✅ Add or Update Issue
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validation: Check if volume already has 2 issues (when creating new issue)
      if (!editId) {
        const issuesInVolume = issues.filter(
          (i) => i.volume === formData.volume
        );
        
        if (issuesInVolume.length >= 2) {
          Swal.fire(
            "Cannot Create Issue",
            `Volume ${formData.volume} already has 2 issues. Each volume can only contain a maximum of 2 issues (Issue 1: January-June and Issue 2: July-December).`,
            "warning"
          );
          return;
        }
      }

      if (editId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/issues/${editId}`,
          formData,
          config
        );
        Swal.fire("Updated!", "Issue updated successfully.", "success");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/issues/`,
          formData,
          config
        );
        Swal.fire("Added!", "New issue created successfully.", "success");
      }

      setFormData({
        volume: 1,
        issue: 1,
        year: new Date().getFullYear(),
      });
      setEditId(null);
      fetchIssues();
    } catch (err) {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // ✅ Delete Issue
  const handleDelete = async (id: number) => {
    const confirm = await Swal.fire({
      title: "Are you sure?",
      text: "This issue will be deleted permanently.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (confirm.isConfirmed) {
      try {
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/issues/${id}`,
          config
        );
        Swal.fire("Deleted!", "The issue has been deleted.", "success");
        fetchIssues();
      } catch (err) {
        Swal.fire("Error", "Failed to delete issue.", "error");
      }
    }
  };

  // ✅ Edit Issue
  const handleEdit = (issue: Issue) => {
    setFormData(issue);
    setEditId(issue.id!);
  };

  // Helper function to get available issue slots for a volume
  const getAvailableIssueSlots = (volume: number) => {
    const issuesInVolume = issues.filter((i) => i.volume === volume);
    return 2 - issuesInVolume.length;
  };

  // Helper function to get used issues for a volume
  const getUsedIssuesInVolume = (volume: number) => {
    return issues.filter((i) => i.volume === volume).map(i => i.issue);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {editId ? "Edit Issue" : "Add Issue"}
      </h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-white p-4 rounded-xl shadow"
      >
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Volume</label>
            <input
              type="number"
              placeholder="Enter volume"
              value={formData.volume}
              onChange={(e) =>
                setFormData({ ...formData, volume: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
              required
            />
            <p className="text-xs text-orange-600 mt-1">
              📌 Available slots: {getAvailableIssueSlots(formData.volume)} of 2
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Issue <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.issue}
              onChange={(e) =>
                setFormData({ ...formData, issue: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
              required
            >
              <option value="">Select Issue</option>
              <option value="1">Issue 1 (January – June)</option>
              <option value="2">Issue 2 (July – December)</option>
            </select>
            {getAvailableIssueSlots(formData.volume) === 0 && (
              <p className="text-xs text-red-600 mt-1">
                ⚠️ This volume is full (max 2 issues)
              </p>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              placeholder="Enter year"
              value={formData.year}
              onChange={(e) =>
                setFormData({ ...formData, year: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
              required
            />
          </div>
        </div>

        {/* Constraint Info */}
        <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
          <p className="text-blue-900 font-medium">📋 Journal Structure</p>
          <p className="text-blue-800 text-xs mt-1">
            • Each <strong>Volume</strong> represents one publication year
          </p>
          <p className="text-blue-800 text-xs">
            • Each Volume can have maximum <strong>2 Issues</strong>
          </p>
          <p className="text-blue-800 text-xs">
            • <strong>Issue 1:</strong> January – June | <strong>Issue 2:</strong> July – December
          </p>
        </div>

        <button
          type="submit"
          disabled={getAvailableIssueSlots(formData.volume) === 0 && !editId}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {editId ? "Update Issue" : "Add Issue"}
        </button>
      </form>

      {/* Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Issues List</h2>
        <div className="overflow-x-auto bg-white shadow rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Volume</th>
                <th className="p-2 border">Issue</th>
                <th className="p-2 border">Publication Period</th>
                <th className="p-2 border">Year</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(issues) && issues.length > 0 ? (
                issues.map((issue) => (
                  <tr key={issue.id} className="hover:bg-gray-50">
                    <td className="p-2 border font-semibold">Volume {issue.volume}</td>
                    <td className="p-2 border">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                        Issue {issue.issue}
                      </span>
                    </td>
                    <td className="p-2 border text-sm">
                      {issue.issue === 1 
                        ? "January – June" 
                        : issue.issue === 2 
                        ? "July – December" 
                        : "Custom"}
                    </td>
                    <td className="p-2 border">{issue.year}</td>
                    <td className="p-2 border text-center flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(issue)}
                        className="p-2 rounded bg-green-500 text-white hover:bg-green-600"
                        title="Edit Issue"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(issue.id!)}
                        className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                        title="Delete Issue"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-gray-500">
                    No issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Volume Overview */}
        {issues.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-3">Volume Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from(
                new Set(issues.map((i) => i.volume)),
                (vol) => vol
              ).sort((a, b) => b - a).map((vol) => {
                const volumeIssues = issues.filter((i) => i.volume === vol);
                const issueNumbers = volumeIssues.map((i) => i.issue).sort();
                return (
                  <div key={vol} className="bg-white p-3 rounded border">
                    <p className="font-medium">Volume {vol}</p>
                    <p className="text-sm text-gray-600 mb-2">
                      Year: {volumeIssues[0]?.year}
                    </p>
                    <div className="flex gap-2">
                      {[1, 2].map((issueNum) => (
                        <div
                          key={issueNum}
                          className={`flex-1 p-2 rounded text-center text-xs font-medium ${
                            issueNumbers.includes(issueNum)
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          Issue {issueNum}
                          {issueNumbers.includes(issueNum) ? "✓" : ""}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
