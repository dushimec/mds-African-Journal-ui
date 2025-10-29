import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

// SkeletonCard stays unchanged
const SkeletonCard = ({ type }: { type: "chief" | "editor" }) => {
  if (type === "chief") {
    return (
      <Card className="max-w-3xl mx-auto shadow-lg">
        <CardContent>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 animate-pulse">
            <div className="w-64 h-64 bg-gray-300 rounded-lg"></div>
            <div className="flex-1 space-y-4 w-full">
              <div className="h-6 bg-gray-300 rounded w-1/2"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-10 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-md w-full max-w-sm mx-auto">
      <CardContent className="pt-6 flex flex-col items-center text-center animate-pulse">
        <div className="w-60 h-40 bg-gray-300 rounded-lg mb-4"></div>
        <div className="h-5 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2 mb-3"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>
        <div className="h-10 bg-gray-300 rounded w-32 mt-2"></div>
      </CardContent>
    </Card>
  );
};

const EditorialBoard = () => {
  const [editorInChief, setEditorInChief] = useState<any>(null);
  const [associateEditors, setAssociateEditors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    role: "",
    email: "",
    qualifications: "",
    affiliation: "",
    bio: "",
    profileImage: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    fetchEditors();
  }, []);

  const fetchEditors = async () => {
    try {
      const res = await fetch(`${API_URL}/editorial-board-member`);
      const data = await res.json();
      if (data.success) {
        // Only show approved members (isActive = true)
        const approvedMembers = data.data.filter((m: any) => m.isActive);
        const chief = approvedMembers.find(
          (m: any) =>
            m.role.toLowerCase().includes("editor-in-chief") ||
            m.role.toLowerCase().includes("managing editor")
        );
        const others = approvedMembers.filter((m: any) => m !== chief);
        setEditorInChief(chief);
        setAssociateEditors(others);
      }
    } catch (err) {
      console.error("Failed to fetch editorial board members:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let profileImageUrl = "";
      if (imageFile) {
        const imgData = new FormData();
        imgData.append("file", imageFile);
        const res = await fetch(`${API_URL}/upload`, {
          method: "POST",
          body: imgData,
        });
        const data = await res.json();
        profileImageUrl = data.url;
      }

      const payload = {
        ...formData,
        profileImage: profileImageUrl,
        isActive: false, // Needs admin approval
      };

      await fetch(`${API_URL}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      alert("Your request has been submitted! Waiting for admin approval.");
      setShowModal(false);
      setFormData({
        fullName: "",
        role: "",
        email: "",
        qualifications: "",
        affiliation: "",
        bio: "",
        profileImage: "",
      });
      setImageFile(null);
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Editorial Board</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Our Editorial Board brings together scholars and practitioners who
            share a commitment to rigorous research.
          </p>
          <Button onClick={() => setShowModal(true)}>Join Editorial Board</Button>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md relative">
              <h2 className="text-2xl font-bold mb-4">Join Editorial Board</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3">
                <input type="text" name="fullName" placeholder="Full Name" value={formData.fullName} onChange={handleChange} required className="border p-2 rounded" />
                <input type="text" name="role" placeholder="Role" value={formData.role} onChange={handleChange} required className="border p-2 rounded" />
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="border p-2 rounded" />
                <input type="text" name="qualifications" placeholder="Qualifications" value={formData.qualifications} onChange={handleChange} className="border p-2 rounded" />
                <input type="text" name="affiliation" placeholder="Affiliation" value={formData.affiliation} onChange={handleChange} className="border p-2 rounded" />
                <textarea name="bio" placeholder="Short Bio" value={formData.bio} onChange={handleChange} className="border p-2 rounded" rows={3}></textarea>
                <input type="file" onChange={handleFileChange} accept="image/*" />
                <div className="flex justify-end gap-2 mt-3">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                  <Button type="submit" disabled={submitting}>{submitting ? "Submitting..." : "Submit"}</Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Managing Editor */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Managing Editor</h2>
          {loading ? (
            <SkeletonCard type="chief" />
          ) : (
            editorInChief && (
              <Card className="max-w-3xl mx-auto shadow-lg hover:shadow-xl transition-shadow">
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-64 h-64 flex-shrink-0 overflow-hidden rounded-lg">
                      <img src={editorInChief.profileImage || "/managing.webp"} alt="Managing Editor" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">{editorInChief.fullName}</h3>
                      <p className="text-gray-600 mb-4">{editorInChief.bio}</p>
                      <Button variant="outline" size="sm"><Mail className="mr-2 h-4 w-4" /> Contact</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </section>

        {/* Associate Editors */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Our Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} type="editor" />)
              : associateEditors.map((editor, index) => (
                  <Card key={index} className="shadow-md hover:shadow-lg transition-shadow w-full max-w-sm mx-auto">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <div className="w-60 h-40 overflow-hidden flex items-center justify-center rounded-lg mb-4">
                        <img src={editor.profileImage || "/editor.webp"} alt={editor.fullName} className="w-full h-full object-contain object-center" />
                      </div>
                      <h3 className="text-xl font-bold mb-1">{editor.fullName}</h3>
                      <Badge variant="secondary" className="text-xs mb-3">{editor.role}</Badge>
                      <p className="text-sm text-gray-600 mb-1">{editor.bio}</p>
                      <p className="text-sm text-gray-600 mb-1">{editor.affiliation}</p>
                      <p className="text-sm text-gray-600 mb-4">{editor.qualifications}</p>
                      <Button variant="outline" size="sm"><Mail className="mr-2 h-3 w-3" /> Contact Editor</Button>
                    </CardContent>
                  </Card>
                ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default EditorialBoard;
