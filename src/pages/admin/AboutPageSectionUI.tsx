import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Pencil, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface AboutPageSection {
  id: string;
  section: string;
  title?: string;
  content: string;
  order: number;
}

const AboutSectionEnum = [
  "HEADER",
  "WHAT_IS_MDS_JAED",
  "WHY_PUBLISH_WITH_US",
  "HOW_TO_CONTRIBUTE",
  "AIMS_AND_SCOPE",
  "PUBLICATION_FREQUENCY",
  "INDEXING_AND_ACCESSIBILITY",
  "RESEARCH_EXCELLENCE",
  "POLICY_IMPACT",
  "ENGAGEMENT_WITH_PRACTITIONERS",
  "JOIN_OUR_COMMUNITY",
];

const AboutSectionManager: React.FC = () => {
  const [sections, setSections] = useState<AboutPageSection[]>([]);
  const [formData, setFormData] = useState({
    section: "",
    title: "",
    content: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");

  // Fetch sections safely
 const fetchSections = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/about-sections`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Since API returns an array directly
    const data = Array.isArray(res.data) ? res.data.filter(Boolean) : [];
    setSections(data);
  } catch (err) {
    console.error(err);
    toast.error("Failed to fetch sections");
  }
};


  useEffect(() => {
    fetchSections();
  }, []);
  console.log(sections)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: name === "order" ? Number(value) : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.section || !formData.content) {
      toast.error("Section and content are required");
      return;
    }

    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`${import.meta.env.VITE_API_URL}/about-sections/${editingId}`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Section updated successfully!");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/about-sections`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Section added successfully!");
      }

      setFormData({ section: "", title: "", content: ""});
      setEditingId(null);
      fetchSections();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the section!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${import.meta.env.VITE_API_URL}/about-sections/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Section deleted!");
        setSections((prev) => prev.filter((s) => s.id !== id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete section");
      }
    }
  };

  const handleEdit = (section: AboutPageSection) => {
    setFormData({
      section: section.section,
      title: section.title || "",
      content: section.content,
    });
    setEditingId(section.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {editingId ? "Edit About Page Section" : "Add About Page Section"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <select
            name="section"
            value={formData.section}
            onChange={handleChange}
            required
            className="border rounded p-2 col-span-2"
          >
            <option value="">Select Section</option>
            {AboutSectionEnum.map((sec) => (
              <option key={sec} value={sec}>
                {sec.split("_").join(" ")}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="title"
            placeholder="Title (optional)"
            value={formData.title}
            onChange={handleChange}
            className="border rounded p-2 col-span-2"
          />
          <textarea
            name="content"
            placeholder="Content"
            value={formData.content}
            onChange={handleChange}
            required
            className="border rounded p-2 col-span-2"
            rows={4}
          ></textarea>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2 rounded col-span-2 hover:bg-blue-700"
          >
            {loading ? "Submitting..." : editingId ? "Update Section" : "Add Section"}
          </button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">About Page Sections</h2>
        {sections.length === 0 ? (
          <p>No sections found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Section</th>
                  <th className="p-2">Title</th>
                  <th className="p-2">Content</th>
                  <th className="p-2">Order</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((section) => (
                  <tr key={section?.id} className="border-t">
                    <td className="p-2">{section?.section?.split("_").join(" ")}</td>
                    <td className="p-2">{section?.title || "-"}</td>
                    <td className="p-2">{section?.content}</td>
                    <td className="p-2">{section?.order}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => section && handleEdit(section)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => section && handleDelete(section.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AboutSectionManager;
