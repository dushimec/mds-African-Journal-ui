import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Pencil } from "lucide-react";

interface SocialLinks {
  facebook: string;
  twitter: string;
  linkedin: string;
  instagram: string;
}

interface ContactInfo {
  id?: string;
  intro: string;
  editorEmail: string;
  submissionsEmail: string;
  phone: string;
  mailingAddress: string;
  officeHours: string;
  locationDescription: string;
  social: SocialLinks;
}

const ContactInfoManager: React.FC = () => {
  const [formData, setFormData] = useState<ContactInfo>({
    intro: "",
    editorEmail: "",
    submissionsEmail: "",
    phone: "",
    mailingAddress: "",
    officeHours: "",
    locationDescription: "",
    social: { facebook: "", twitter: "", linkedin: "", instagram: "" },
  });

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  };

  // ✅ Fetch single contact info
  const fetchContactInfo = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/contact-info`, { headers });
      if (res.data?.data?.contactInfo) {
        setContactInfo(res.data.data.contactInfo);
      }
    } catch (err) {
      console.error("Error fetching contact info", err);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  // ✅ Add / Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/contact-info`, formData, { headers });
        Swal.fire("Updated!", "Contact info updated successfully.", "success");
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/contact-info`, formData, { headers });
        Swal.fire("Added!", "Contact info added successfully.", "success");
      }
      setFormData({
        intro: "",
        editorEmail: "",
        submissionsEmail: "",
        phone: "",
        mailingAddress: "",
        officeHours: "",
        locationDescription: "",
        social: { facebook: "", twitter: "", linkedin: "", instagram: "" },
      });
      setEditId(null);
      fetchContactInfo();
    } catch (err) {
      Swal.fire("Error", "Something went wrong!", "error");
    }
  };

  // ✏️ Edit
  const handleEdit = (info: ContactInfo) => {
    setFormData(info);
    setEditId(info.id!);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        {editId ? "Edit Contact Info" : "Add Contact Info"}
      </h1>

      {/* 📩 Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <textarea
          placeholder="Intro"
          value={formData.intro}
          onChange={(e) => setFormData({ ...formData, intro: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Editor Email"
          value={formData.editorEmail}
          onChange={(e) => setFormData({ ...formData, editorEmail: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="email"
          placeholder="Submissions Email"
          value={formData.submissionsEmail}
          onChange={(e) => setFormData({ ...formData, submissionsEmail: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Mailing Address"
          value={formData.mailingAddress}
          onChange={(e) => setFormData({ ...formData, mailingAddress: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Office Hours"
          value={formData.officeHours}
          onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />
        <input
          type="text"
          placeholder="Location Description"
          value={formData.locationDescription}
          onChange={(e) => setFormData({ ...formData, locationDescription: e.target.value })}
          className="w-full border p-2 rounded"
          required
        />

        {/* 🌐 Social Links */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="url"
            placeholder="Facebook"
            value={formData.social.facebook}
            onChange={(e) =>
              setFormData({ ...formData, social: { ...formData.social, facebook: e.target.value } })
            }
            className="border p-2 rounded"
          />
          <input
            type="url"
            placeholder="Twitter"
            value={formData.social.twitter}
            onChange={(e) =>
              setFormData({ ...formData, social: { ...formData.social, twitter: e.target.value } })
            }
            className="border p-2 rounded"
          />
          <input
            type="url"
            placeholder="LinkedIn"
            value={formData.social.linkedin}
            onChange={(e) =>
              setFormData({ ...formData, social: { ...formData.social, linkedin: e.target.value } })
            }
            className="border p-2 rounded"
          />
          <input
            type="url"
            placeholder="Instagram"
            value={formData.social.instagram}
            onChange={(e) =>
              setFormData({
                ...formData,
                social: { ...formData.social, instagram: e.target.value },
              })
            }
            className="border p-2 rounded"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
        >
          {editId ? "Update Contact Info" : "Add Contact Info"}
        </button>
      </form>

      {/* 📊 Display single contact info */}
      {contactInfo && (
        <div className="mt-8 overflow-x-auto bg-white shadow rounded-xl p-4">
          <h2 className="text-xl font-semibold mb-4">Current Contact Info</h2>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 border">Intro</th>
                <th className="p-2 border">Editor Email</th>
                <th className="p-2 border">Submissions Email</th>
                <th className="p-2 border">Phone</th>
                <th className="p-2 border">Mailing Address</th>
                <th className="p-2 border">Office Hours</th>
                <th className="p-2 border">Social</th>
                <th className="p-2 border text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2 border">{contactInfo.intro}</td>
                <td className="p-2 border">{contactInfo.editorEmail}</td>
                <td className="p-2 border">{contactInfo.submissionsEmail}</td>
                <td className="p-2 border">{contactInfo.phone}</td>
                <td className="p-2 border">{contactInfo.mailingAddress}</td>
                <td className="p-2 border">{contactInfo.officeHours}</td>
                <td className="p-2 border">
                  FB: {contactInfo.social.facebook} <br />
                  TW: {contactInfo.social.twitter} <br />
                  LI: {contactInfo.social.linkedin} <br />
                  IG: {contactInfo.social.instagram}
                </td>
                <td className="p-2 border text-center flex items-center justify-center space-x-2">
                  <button
                    onClick={() => handleEdit(contactInfo)}
                    className="p-2 rounded bg-green-500 text-white hover:bg-green-600"
                  >
                    <Pencil size={16} />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactInfoManager;
