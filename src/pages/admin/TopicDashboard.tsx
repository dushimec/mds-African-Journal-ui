import React, { useState, useEffect } from "react";
import axios from "axios";
import { Edit, Trash2 } from "lucide-react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Topic {
  id: string;
  name: string;
}

const TopicDashboard: React.FC = () => {
  const [name, setName] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [editId, setEditId] = useState<string | null>(null);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("access_token");

  // 📥 Fetch topics
  const fetchTopics = async () => {
    try {
      const res = await axios.get(`${API_URL}/topic`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTopics(res.data.data || []);
    } catch (error) {
      console.error("Error fetching topics:", error);
      toast.error("Failed to load topics");
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  // ➕ Create / ✏️ Update Topic
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(
          `${API_URL}/topic/${editId}`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Topic updated successfully");
      } else {
        await axios.post(
          `${API_URL}/topic`,
          { name },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Topic added successfully");
      }
      setName("");
      setEditId(null);
      fetchTopics();
    } catch (error) {
      console.error("Error saving topic:", error);
      toast.error("Failed to save topic");
    }
  };

  // 📝 Edit
  const handleEdit = (topic: Topic) => {
    setName(topic.name);
    setEditId(topic.id);
    toast.info("Editing mode enabled");
  };

  // 🗑️ Delete
  const handleDelete = async (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This topic will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_URL}/topic/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Topic deleted successfully");
          fetchTopics();
        } catch (error) {
          console.error("Error deleting topic:", error);
          toast.error("Failed to delete topic");
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Topic Management</h1>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 shadow rounded mb-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Topic Name</label>
          <input
            type="text"
            placeholder="e.g., Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded focus:outline-none focus:ring"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          {editId ? "Update Topic" : "Add Topic"}
        </button>
      </form>

      {/* Table */}
      <table className="w-full bg-white shadow rounded border-collapse">
        <thead className="bg-gray-100 text-left">
          <tr>
            <th className="p-3 border-b">#</th>
            <th className="p-3 border-b">Name</th>
            <th className="p-3 border-b text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {topics.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-4 text-center text-gray-500">
                No topics found
              </td>
            </tr>
          ) : (
            topics.map((topic, index) => (
              <tr key={topic.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{index + 1}</td>
                <td className="p-3 border-b">{topic.name}</td>
                <td className="p-3 border-b text-center flex justify-center gap-3">
                  <button
                    onClick={() => handleEdit(topic)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(topic.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopicDashboard;
