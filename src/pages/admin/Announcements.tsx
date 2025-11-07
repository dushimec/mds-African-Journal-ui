import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface Announcement {
  id: string;
  title: string;
  description: string;
  date: string;
}

const Announcements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", date: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("access_token");
    return { Authorization: `Bearer ${token}` };
  };

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/announcements`, {
        headers: getAuthHeaders(),
      });
      if (Array.isArray(res.data.data.announcements)) {
        setAnnouncements(res.data.data.announcements);
      }
    } catch (error) {
      toast.error("Failed to load announcements");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/announcements/${editingId}`,
          form,
          { headers: getAuthHeaders() }
        );
        toast.success("Announcement updated");
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/announcements`,
          form,
          { headers: getAuthHeaders() }
        );
        toast.success("Announcement created");
      }
      setForm({ title: "", description: "", date: "" });
      setEditingId(null);
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to save announcement");
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setForm({
      title: announcement.title,
      description: announcement.description,
      date: announcement.date,
    });
    setEditingId(announcement.id);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/announcements/${id}`, {
        headers: getAuthHeaders(),
      });
      toast.success("Announcement deleted");
      fetchAnnouncements();
    } catch (error) {
      toast.error("Failed to delete announcement");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Announcements</h1>

      {/* Form */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Title"
          className="border p-2 rounded mb-2 w-full"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea
          placeholder="Description"
          className="border p-2 rounded mb-2 w-full"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="date"
          className="border p-2 rounded mb-2 w-full"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
        />
        <button
          onClick={handleSubmit}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          {editingId ? "Update" : "Create"} Announcement
        </button>
      </div>

      {/* Announcement List */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-3">
          {announcements.map((a) => (
            <li
              key={a.id}
              className="border p-4 rounded flex justify-between items-start"
            >
              <div>
                <h2 className="font-bold">{a.title}</h2>
                <p>{a.description}</p>
                <p className="text-xs text-gray-400">
                  {new Date(a.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(a)} className="text-blue-600">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(a.id)}
                  className="text-red-600"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Announcements;
