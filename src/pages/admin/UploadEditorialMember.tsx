import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";

interface EditorialMember {
  id: string;
  fullName: string;
  role: string;
  email: string;
  qualifications: string;
  affiliation: string;
  bio: string;
  order?: number;
  isActive: boolean;
  profileImage?: string;
}

const EditorialBoard: React.FC = () => {
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    email: "",
    qualifications: "",
    affiliation: "",
    bio: "",
    order: 1,
    isActive: true,
    profileImage: "",
  });

  const token = localStorage.getItem("access_token");
  const API_URL = `${import.meta.env.VITE_API_URL}/editorial-board-member`;

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data.data) ? res.data.data : [res.data.data];
      setMembers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch members");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isActive: e.target.checked }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const uploadImageAndGetUrl = async () => {
    if (!imageFile) return formData.profileImage; // no new image selected

    // ⚠️ Example: if you have a separate upload endpoint
    const uploadURL = `${import.meta.env.VITE_API_URL}/upload`;
    const imgData = new FormData();
    imgData.append("file", imageFile);

    const res = await axios.post(uploadURL, imgData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.url; // assuming your upload endpoint returns { url: "https://..." }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const imgUrl = await uploadImageAndGetUrl();
      const payload = {
        ...formData,
        profileImage: imgUrl,
      };

      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Member updated successfully!");
      } else {
        await axios.post(API_URL, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        toast.success("Member added successfully!");
      }

      resetForm();
      fetchMembers();
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the member!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Member deleted!");
        setMembers(prev => prev.filter(m => m.id !== id));
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete member");
      }
    }
  };

  const handleEdit = (member: EditorialMember) => {
    setFormData({
      fullName: member.fullName,
      role: member.role,
      email: member.email,
      qualifications: member.qualifications,
      affiliation: member.affiliation,
      bio: member.bio,
      order: member.order || 1,
      isActive: member.isActive,
      profileImage: member.profileImage || "",
    });
    setEditingId(member.id);
    setImageFile(null);
    setPreviewImage(member.profileImage || null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      fullName: "",
      role: "",
      email: "",
      qualifications: "",
      affiliation: "",
      bio: "",
      order: 1,
      isActive: true,
      profileImage: "",
    });
    setImageFile(null);
    setPreviewImage(null);
    setEditingId(null);
  };

  const displayedMembers = showAll ? members : members.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      {/* Form */}
      <div className="bg-white p-6 rounded-xl shadow mb-8">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {editingId ? "Edit Editorial Board Member" : "Add Editorial Board Member"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="border rounded p-2 col-span-2" />
          <input type="text" name="role" placeholder="Role" value={formData.role} onChange={handleChange} required className="border rounded p-2" />
          <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="border rounded p-2" />
          <input type="text" name="qualifications" placeholder="Qualifications" value={formData.qualifications} onChange={handleChange} className="border rounded p-2" />
          <input type="text" name="affiliation" placeholder="Affiliation" value={formData.affiliation} onChange={handleChange} className="border rounded p-2" />
          <textarea name="bio" placeholder="Short Bio" value={formData.bio} onChange={handleChange} className="border rounded p-2 col-span-2" rows={3} />

          <div className="col-span-2">
            <label className="block mb-1 font-medium">Profile Image</label>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            {previewImage && (
              <img
                src={previewImage}
                alt="Preview"
                className="mt-2 w-24 h-24 rounded-full object-cover border"
              />
            )}
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <input type="checkbox" checked={formData.isActive} onChange={handleCheckbox} />
            <label>Active Member</label>
          </div>

          <button type="submit" disabled={loading} className="bg-blue-600 text-white py-2 rounded col-span-2 hover:bg-blue-700">
            {loading ? "Submitting..." : editingId ? "Update Member" : "Add Member"}
          </button>
        </form>
      </div>

      {/* Members Table */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">Editorial Board Members</h2>
        {members.length === 0 ? (
          <p>No members found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2">Name</th>
                  <th className="p-2">Role</th>
                  <th className="p-2">Email</th>
                  <th className="p-2">Status</th>
                  <th className="p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedMembers.map(member => (
                  <tr key={member.id} className="border-t">
                    <td className="p-2 flex items-center gap-2">
                      {member.profileImage && (
                        <img
                          src={member.profileImage}
                          alt={member.fullName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      )}
                      {member.fullName}
                    </td>
                    <td className="p-2">{member.role}</td>
                    <td className="p-2">{member.email}</td>
                    <td className="p-2">{member.isActive ? "Active" : "Inactive"}</td>
                    <td className="p-2 flex gap-2">
                      <button onClick={() => handleEdit(member)} className="text-blue-600 hover:text-blue-800">
                        <Pencil size={18} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {members.length > 3 && (
          <button onClick={() => setShowAll(prev => !prev)} className="mt-4 flex items-center gap-1 text-blue-600 hover:text-blue-800">
            {showAll ? (
              <>
                Show Less <ChevronUp size={18} />
              </>
            ) : (
              <>
                Show More <ChevronDown size={18} />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default EditorialBoard;
