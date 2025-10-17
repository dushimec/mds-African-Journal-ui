import React, { useEffect, useState } from "react";
import { Mail, Trash2, Edit2 } from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Subscriber {
  id: string;
  email: string;
  subscribedAt: string;
}

interface Newsletter {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

const NewsletterDashboard: React.FC = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");
  const API_URL = import.meta.env.VITE_API_URL;

  // ✅ Fetch subscribers
  const fetchSubscribers = async () => {
    try {
      const res = await axios.get(`${API_URL}/newsletter/subscribers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscribers(res.data.data.subscribers || []);
    } catch (error) {
      console.error("Error fetching subscribers:", error);
      toast.error("Failed to load subscribers.");
    }
  };

  // 📬 Fetch newsletters
  const fetchNewsletters = async () => {
    try {
      const res = await axios.get(`${API_URL}/newsletter/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNewsletters(res.data.data || []);
    } catch (error) {
      console.error("Error fetching newsletters:", error);
      toast.error("Failed to load newsletters.");
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchNewsletters();
  }, []);

  // 📬 Create or Update newsletter
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(
          `${API_URL}/newsletter/${editingId}`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Newsletter updated successfully!");
      } else {
        await axios.post(
          `${API_URL}/newsletter/send`,
          { title, content },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Newsletter sent successfully!");
      }

      setTitle("");
      setContent("");
      setEditingId(null);
      fetchNewsletters();
    } catch (error) {
      console.error("Error sending/updating newsletter:", error);
      toast.error("Failed to send or update newsletter.");
    }
  };

  // 🗑 Delete newsletter with confirmation
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the newsletter.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete it",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/newsletter/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Newsletter deleted successfully!");
        setNewsletters((prev) => prev.filter((n) => n.id !== id));
      } catch (error) {
        console.error("Error deleting newsletter:", error);
        toast.error("Failed to delete newsletter.");
      }
    }
  };

  // ✍️ Start editing a newsletter
  const handleEdit = (newsletter: Newsletter) => {
    setEditingId(newsletter.id);
    setTitle(newsletter.title);
    setContent(newsletter.content);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <Mail className="text-blue-600" /> Newsletter Management
      </h1>

      {/* ✨ Newsletter Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow rounded p-4 mb-6 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border rounded p-2 focus:outline-none focus:ring"
            placeholder="Weekly News..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full border rounded p-2 h-32 focus:outline-none focus:ring"
            placeholder="Write your newsletter content..."
            required
          />
        </div>

        <button
          type="submit"
          className={`${
            editingId ? "bg-yellow-600 hover:bg-yellow-700" : "bg-blue-600 hover:bg-blue-700"
          } text-white px-4 py-2 rounded transition`}
        >
          {editingId ? "Update Newsletter" : "Send Newsletter"}
        </button>
      </form>

      {/* 📨 Subscribers Table */}
      <div className="bg-white shadow rounded overflow-hidden mb-6">
        <h2 className="text-lg font-semibold p-4 border-b bg-gray-50">
          Subscribers ({subscribers.length})
        </h2>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Subscribed At</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-4 text-center text-gray-500">
                  No subscribers found
                </td>
              </tr>
            ) : (
              subscribers.map((sub, index) => (
                <tr key={sub.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{index + 1}</td>
                  <td className="p-3 border-b">{sub.email}</td>
                  <td className="p-3 border-b">
                    {new Date(sub.subscribedAt).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 📰 Newsletters Table */}
      <div className="bg-white shadow rounded overflow-hidden">
        <h2 className="text-lg font-semibold p-4 border-b bg-gray-50">
          Sent Newsletters ({newsletters.length})
        </h2>
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-3 border-b">#</th>
              <th className="p-3 border-b">Title</th>
              <th className="p-3 border-b">Date</th>
              {/* <th className="p-3 border-b">Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {newsletters.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No newsletters found
                </td>
              </tr>
            ) : (
              newsletters.map((n, index) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className="p-3 border-b">{index + 1}</td>
                  <td className="p-3 border-b">{n.title}</td>
                  <td className="p-3 border-b">
                    {new Date(n.createdAt).toLocaleString()}
                  </td>
                  {/* <td className="p-3 border-b space-x-2">
                    <button
                      onClick={() => handleEdit(n)}
                      className="p-2 rounded bg-yellow-500 text-white hover:bg-yellow-600"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="p-2 rounded bg-red-500 text-white hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td> */}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NewsletterDashboard;
