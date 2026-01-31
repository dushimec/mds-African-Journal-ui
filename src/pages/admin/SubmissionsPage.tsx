import React, { useEffect, useState, useRef } from "react";
import { Eye, EyeOff, Edit3, Trash2, X } from "lucide-react";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

interface Author {
  id: string;
  fullName: string;
}

interface File {
  id: string;
  fileName: string;
  fileType: string;
  fileUrl: string;
  fileSize: number;
  isEdited?: boolean;
}

interface User {
  firstName: string;
  lastName: string;
  email: string;
}

interface Submission {
  id: string;
  status: string;
  manuscriptTitle: string;
  abstract: string;
  keywords: string;
  createdAt: string;
  authors: Author[];
  files: File[];
  user: User;
}

interface Stats {
  [key: string]: number;
}

const ITEMS_PER_PAGE = 5;

const STATUS_ENUMS = [
  "DRAFT",
  "SUBMITTED",
  "UNDER_REVIEW",
  "REVISION_REQUESTED",
  "ACCEPTED",
  "REJECTED",
  "PUBLISHED",
];

const SubmissionsPage: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editing, setEditing] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [uploadingFileId, setUploadingFileId] = useState<string | null>(null);
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});


  const token = localStorage.getItem("access_token");

  const fetchSubmissions = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/submission/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) setSubmissions(json.data);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/submission/stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const json = await res.json();
      if (json.success && json.data) {

        if (Array.isArray(json.data)) {
          const normalized: Stats = json.data.reduce((acc: Stats, item: any) => {
            if (item && typeof item === "object") {
              const key = item.status ?? item.key ?? String(item[0] ?? "");
              const value = typeof item.count === "number" ? item.count : Number(item.count) || 0;
              if (key) acc[key] = value;
            }
            return acc;
          }, {});
          setStats(normalized);
        } else if (typeof json.data === "object") {
          // Normalize object map values to numbers. Backend may return a map
          // where each key maps to either a number or an object like {status, count}
          const normalized: Stats = Object.entries(json.data).reduce(
            (acc: Stats, [k, v]) => {
              if (typeof v === "number") {
                acc[k] = v;
              } else if (v && typeof v === "object") {
                // Prefer common numeric fields
                if (typeof (v as any).count === "number") acc[k] = (v as any).count;
                else if (typeof (v as any).total === "number") acc[k] = (v as any).total;
                else acc[k] = Number((v as any).count ?? (v as any).total ?? 0) || 0;
              } else {
                acc[k] = Number(v) || 0;
              }
              return acc;
            },
            {}
          );
          setStats(normalized);
        } else {
          console.warn("Unexpected stats format:", json.data);
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    fetchStats();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded(expanded === id ? null : id);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/submission/${editing.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: editing.status }),
        }
      );
      const data = await res.json();
      if (data.success) {
        toast.success("Status updated successfully!");
        setEditing(null);
        fetchSubmissions();
        fetchStats();
      } else {
        toast.error("Failed to update status.");
      }
    } catch (err) {
      console.error("Error updating submission:", err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/submission/${id}`,
          {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();

        if (data.success) {
          toast.success("Submission deleted!");
          setSubmissions(submissions.filter((s) => s.id !== id));
          fetchStats();
        } else {
          toast.error("Failed to delete submission.");
        }
      } catch (err) {
        console.error("Error deleting submission:", err);
        toast.error("Something went wrong.");
      }
    }
  };

  const handleEditedFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>,
  submissionId: string,
  fileId: string
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  try {
    setUploadingFileId(fileId);

    const res = await fetch(
      `${import.meta.env.VITE_API_URL}/submission/${submissionId}/files/${fileId}/edited`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      }
    );

    const json = await res.json();

    if (json.success) {
      toast.success("File updated successfully!");
      fetchSubmissions();
    } else {
      toast.error("Failed to upload edited file.");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error uploading file.");
  } finally {
    setUploadingFileId(null);
    // Reset the file input value to allow re-uploading the same file
    if (fileInputRefs.current[fileId]) {
      fileInputRefs.current[fileId]!.value = "";
    }
  }
};
  const handleFileDownload = async (submissionId: string, file: File) => {
    try {
      setDownloadingFileId(file.id);

      // Call backend endpoint to stream/download the file
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/submission/${submissionId}/file?fileId=${encodeURIComponent(
          file.id
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error('File download failed:', res.status, text);
        throw new Error('Failed to download file');
      }

      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error("Failed to download file.");
      console.error(err);
    } finally {
      setDownloadingFileId(null);
    }
  };

  const totalPages = Math.ceil(submissions.length / ITEMS_PER_PAGE);
  const paginated = submissions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const nextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
  const prevPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Submissions Dashboard</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        {Object.keys(stats).map((status) => (
          <div
            key={status}
            className="bg-gray-100 p-4 rounded shadow w-32 text-center"
          >
            <div className="text-sm font-medium">{status}</div>
            <div className="text-xl font-bold">{stats[status]}</div>
          </div>
        ))}
      </div>

      <table className="min-w-full border-collapse bg-white rounded-lg shadow-md text-sm">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-3">Title</th>
            <th className="p-3">Status</th>
            <th className="p-3">Authors</th>
            <th className="p-3">Submitted By</th>
            <th className="p-3">Created At</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginated.map((s) => (
            <React.Fragment key={s.id}>
              <tr className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{s.manuscriptTitle}</td>
                <td className="p-3">{s.status}</td>
                <td className="p-3">
                  {s.authors.map((a) => a.fullName).join(", ")}
                </td>
                <td className="p-3">
                  {s.user?.firstName} {s.user?.lastName}
                </td>
                <td className="p-3">
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3 flex items-center justify-center gap-3">
                  <button
                    onClick={() => toggleExpand(s.id)}
                    className="text-blue-600"
                  >
                    {expanded === s.id ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                  <button
                    onClick={() => setEditing(s)}
                    className="text-yellow-600"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>

              {expanded === s.id && (
                <tr>
                  <td colSpan={6} className="bg-gray-50 p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold mb-1">Abstract</h3>
                        <p className="text-gray-700">{s.abstract}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Keywords</h3>
                        <p className="text-gray-700">{s.keywords}</p>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1">Files</h3>
                        <ul className="space-y-2">
                          {s.files.map((f) => (
                            <li
                              key={f.id}
                              className="p-2 bg-white rounded border flex justify-between items-center"
                            >
                              <div>
                                <p className="font-medium">{f.fileName}</p>
                                <p className="text-xs text-gray-500">
                                  {f.fileType} •{" "}
                                  {(f.fileSize / 1024).toFixed(1)} KB
                                  {f.isEdited && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-green-200 text-green-700 rounded">
                                      Edited
                                    </span>
                                  )}
                                </p>
                              </div>

                              <div className="flex gap-3">

                                {/* 🔥 NEW DOWNLOAD BUTTON */}
                                <button
                                  onClick={() => handleFileDownload(s.id, f)}
                                  className="px-2 py-1 bg-blue-600 text-white rounded text-xs"
                                  disabled={downloadingFileId === f.id}
                                >
                                  {downloadingFileId === f.id
                                    ? "Downloading..."
                                    : "Download"}
                                </button>

                                <label className="px-2 cursor-pointer py-1 bg-yellow-600 text-white rounded text-xs">
                                  {uploadingFileId === f.id ? "Uploading..." : "Upload Edited"}
                                  <input
                                    ref={(el) => (fileInputRefs.current[f.id] = el)}
                                    type="file"
                                    className="hidden"
                                    disabled={uploadingFileId === f.id}
                                    onChange={(e) =>
                                      handleEditedFileUpload(e, s.id, f.id)
                                    }
                                  />
                                </label>

                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>

      {submissions.length === 0 && (
        <p className="text-center text-gray-500 mt-4">No submissions found.</p>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-sm shadow-lg relative">
            <button
              onClick={() => setEditing(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-black"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Change Status</h2>

            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
                className="w-full border px-3 py-2 rounded"
              >
                {STATUS_ENUMS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleUpdate}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mt-4"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmissionsPage;
