import React, { useEffect, useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { Trash2, Edit2, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface LogoData {
  id: string;
  name: string;
  publisher: string;
  logoUrl: string;
}

const baseUrl = import.meta.env.VITE_API_URL;

const LogoManager: React.FC = () => {
  const [logoData, setLogoData] = useState<LogoData | null>(null);
  const [name, setName] = useState("");
  const [publisher, setPublisher] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("access_token");
  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchLogo = async () => {
    try {
      const res = await axios.get(`${baseUrl}/logo/`, authHeaders);
      const data: LogoData = res.data.data;
      setLogoData(data);
      setName(data.name || "");
      setPublisher(data.publisher || "");
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchLogo();
  }, []);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    if (selected) setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !publisher) return toast.error("Please fill all fields!");

    const formData = new FormData();
    formData.append("name", name);
    formData.append("publisher", publisher);
    if (file) formData.append("logo", file);

    try {
      setLoading(true);

      await axios.put(`${baseUrl}/logo/`, formData, {
        headers: { ...authHeaders.headers, "Content-Type": "multipart/form-data" },
      });

      toast.success(isEditing ? "Updated successfully " : "Uploaded successfully ");
      setFile(null);
      setPreview(null);
      setIsEditing(false);
      fetchLogo();
    } catch (error) {
      toast.error("Action failed ");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!logoData) return;
    setIsEditing(true);
    setPreview(logoData.logoUrl);
  };

  const handleDelete = async () => {
    if (!logoData) return;

    Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${baseUrl}/logo/${logoData.id}`, authHeaders);
          toast.success("Deleted successfully ");
          setLogoData(null);
          setName("");
          setPublisher("");
          setPreview(null);
          setIsEditing(false);
        } catch {
          toast.error("Delete failed ");
        }
      }
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <ToastContainer />
      <h1 className="text-xl font-bold mb-5 text-gray-800">
        {isEditing ? "Edit Logo Info" : "Upload Logo"}
      </h1>

      <form onSubmit={handleUpload} className="space-y-4">
        <input
          type="text"
          placeholder="Enter Name"
          className="border w-full p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="text"
          placeholder="Enter Publisher"
          className="border w-full p-2 rounded"
          value={publisher}
          onChange={(e) => setPublisher(e.target.value)}
        />

        <input
          type="file"
          accept="image/*"
          className="border w-full p-2 rounded"
          onChange={handleFileChange}
        />

        {preview && (
          <img src={preview} alt="Preview" className="w-32 mt-2 rounded border" />
        )}

        <button
          type="submit"
          disabled={loading}
          className={`py-2 px-4 rounded text-white w-full ${
            isEditing ? "bg-primary" : "bg-blue-600 hover:bg-blue-700"
          } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loading ? (isEditing ? "Updating..." : "Uploading...") : isEditing ? "Update Data" : "Upload Logo"}
        </button>
      </form>

      <hr className="my-6" />

      {logoData ? (
        <table className="w-full text-left border rounded">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 border">Logo</th>
              <th className="px-3 py-2 border">Name</th>
              <th className="px-3 py-2 border">Publisher</th>
              <th className="px-3 py-2 border text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr className="hover:bg-gray-50">
              <td className="p-2 border">
                <img src={logoData.logoUrl} className="w-14 rounded" />
              </td>
              <td className="p-2 border">{logoData.name}</td>
              <td className="p-2 border">{logoData.publisher}</td>

              <td className="p-2 border flex justify-center gap-4">
                {/* <button
                  className="text-blue-600 hover:text-blue-800"
                  onClick={() => window.open(logoData.logoUrl)}
                >
                  <Eye size={18} />
                </button> */}
                <button
                  className="text-green-600 hover:text-green-800"
                  onClick={handleEdit}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={handleDelete}
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <p className="text-gray-500 text-center">No logo uploaded yet</p>
      )}
    </div>
  );
};

export default LogoManager;
