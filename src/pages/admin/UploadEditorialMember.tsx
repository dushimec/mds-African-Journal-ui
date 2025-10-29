import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from "sweetalert2";
import { Trash2, ChevronDown, ChevronUp, Check, X, Eye, Edit, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EditorialMember {
  id: string;
  fullName: string;
  role: string;
  email: string;
  qualifications: string;
  affiliation: string;
  bio: string;
  isActive: boolean;
  profileImage?: string;
}

const EditorialBoard: React.FC = () => {
  const [members, setMembers] = useState<EditorialMember[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [viewMember, setViewMember] = useState<EditorialMember | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingMember, setEditingMember] = useState<EditorialMember | null>(null);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    qualifications: "",
    affiliation: "",
    bio: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("access_token");
  const API_URL = `${import.meta.env.VITE_API_URL}/editorial-board-member`;

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: `Bearer ${token}` } });
      setMembers(Array.isArray(res.data.data) ? res.data.data : [res.data.data]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch members");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImageFile(e.target.files[0]);
  };

  // Add / Edit member
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    submitData.append("fullName", formData.fullName);
    submitData.append("email", formData.email);
    submitData.append("role", formData.role);
    submitData.append("qualifications", formData.qualifications);
    submitData.append("affiliation", formData.affiliation);
    submitData.append("bio", formData.bio);
    submitData.append("isActive", editingMember ? String(editingMember.isActive) : "false");
    if (imageFile) submitData.append("profileImage", imageFile);

    try {
      if (editingMember) {
        await axios.put(`${API_URL}/${editingMember.id}`, submitData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Member updated successfully!");
      } else {
        await axios.post(API_URL, submitData, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Member added! Awaiting admin approval.");
      }
      setShowModal(false);
      setEditingMember(null);
      setFormData({ fullName: "", email: "", role: "", qualifications: "", affiliation: "", bio: "" });
      setImageFile(null);
      fetchMembers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit member");
    } finally {
      setSubmitting(false);
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
        await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        toast.success("Member deleted!");
        setMembers((prev) => prev.filter((m) => m.id !== id));
        setViewMember(null);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete member");
      }
    }
  };

  const toggleApproval = async (member: EditorialMember) => {
    try {
      await axios.put(`${API_URL}/${member.id}`, { isActive: !member.isActive }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(member.isActive ? "Member disapproved!" : "Member approved!");
      fetchMembers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update member status");
    }
  };

  const handleEdit = (member: EditorialMember) => {
    setEditingMember(member);
    setFormData({
      fullName: member.fullName,
      email: member.email,
      role: member.role,
      qualifications: member.qualifications,
      affiliation: member.affiliation,
      bio: member.bio,
    });
    setShowModal(true);
  };

  const displayedMembers = showAll ? members : members.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Editorial Board Members</h2>
        <Button onClick={() => setShowModal(true)}>Add Member</Button>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
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
                {displayedMembers.map((member) => (
                  <tr key={member.id} className="border-t">
                    <td className="p-2 flex items-center gap-2">
                      {member.profileImage && <img src={member.profileImage} alt={member.fullName} className="w-8 h-8 rounded-full object-cover" />}
                      {member.fullName}
                    </td>
                    <td className="p-2">{member.role}</td>
                    <td className="p-2">{member.email}</td>
                    <td className="p-2">{member.isActive ? "Approved" : "Pending"}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        onClick={() => toggleApproval(member)}
                        className={`flex items-center gap-1 ${member.isActive ? "text-red-600 hover:text-red-800" : "text-green-600 hover:text-green-800"}`}
                      >
                        {member.isActive ? <XCircle size={16} /> : <Check size={16} />}
                        {member.isActive ? "Disapprove" : "Approve"}
                      </button>
                      <button onClick={() => setViewMember(member)} className="text-blue-600 hover:text-blue-800 flex items-center gap-1">
                        <Eye size={16} /> View
                      </button>
                      <button onClick={() => handleEdit(member)} className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1">
                        <Edit size={16} /> Edit
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {members.length > 3 && (
          <button onClick={() => setShowAll((prev) => !prev)} className="mt-4 flex items-center gap-1 text-blue-600 hover:text-blue-800">
            {showAll ? <>Show Less <ChevronUp size={18} /></> : <>Show More <ChevronDown size={18} /></>}
          </button>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[450px]">
            <h3 className="text-lg font-semibold mb-4">{editingMember ? "Edit Member" : "Add Member"}</h3>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input type="text" name="fullName" placeholder="Full Name" required className="border p-2 rounded" value={formData.fullName} onChange={handleChange} />
              <input type="email" name="email" placeholder="Email" required className="border p-2 rounded" value={formData.email} onChange={handleChange} />
              <input type="text" name="role" placeholder="Role" required className="border p-2 rounded" value={formData.role} onChange={handleChange} />
              <input type="text" name="qualifications" placeholder="Qualifications" className="border p-2 rounded" value={formData.qualifications} onChange={handleChange} />
              <input type="text" name="affiliation" placeholder="Affiliation" className="border p-2 rounded" value={formData.affiliation} onChange={handleChange} />
              <textarea name="bio" placeholder="Bio" rows={3} className="border p-2 rounded" value={formData.bio} onChange={handleChange}></textarea>
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <div className="flex justify-end gap-2 mt-2">
                <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingMember(null); }}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : editingMember ? "Update" : "Submit"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewMember && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[450px]">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">{viewMember.fullName}</h3>
              <button onClick={() => setViewMember(null)} className="text-gray-600 hover:text-red-600"><X /></button>
            </div>
            <div className="flex flex-col gap-3">
              {viewMember.profileImage && <img src={viewMember.profileImage} className="w-32 h-32 object-cover rounded mb-2" />}
              <p><strong>Role:</strong> {viewMember.role}</p>
              <p><strong>Email:</strong> {viewMember.email}</p>
              <p><strong>Qualifications:</strong> {viewMember.qualifications}</p>
              <p><strong>Affiliation:</strong> {viewMember.affiliation}</p>
              <p><strong>Bio:</strong> {viewMember.bio}</p>
              <p><strong>Status:</strong> {viewMember.isActive ? "Approved" : "Pending"}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setViewMember(null)} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorialBoard;
