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
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Issue</label>
            <input
              type="number"
              placeholder="Enter issue number"
              value={formData.issue}
              onChange={(e) =>
                setFormData({ ...formData, issue: Number(e.target.value) })
              }
              className="border p-2 rounded w-full"
              required
            />
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
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
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
                <th className="p-2 border">Year</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(issues) && issues.length > 0 ? (
                issues.map((issue) => (
                  <tr key={issue.id}>
                    <td className="p-2 border">{issue.volume}</td>
                    <td className="p-2 border">{issue.issue}</td>
                    <td className="p-2 border">{issue.year}</td>
                    <td className="p-2 border text-center flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleEdit(issue)}
                        className="p-2 rounded bg-green-500 text-white hover:bg-green-600"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(issue.id!)}
                        className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No issues found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
