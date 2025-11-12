import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "react-toastify";

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

  const [showModal, setShowModal] = useState(false);
  const [expandedBioId, setExpandedBioId] = useState<string | null>(null);

  const toggleBio = (id: string) => {
    setExpandedBioId((prev) => (prev === id ? null : id));
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    qualifications: "",
    affiliation: "",
    bio: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchEditors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/editorial-board-member`);
      const data = await res.json();

      if (data.success) {
        const members = data.data.filter((m: any) => m.isActive);

        const chief = members.find((m: any) =>
          m.role?.toLowerCase().includes("managing")
        );

        const others = members.filter((m: any) => m !== chief);

        setEditorInChief(chief);
        setAssociateEditors(others);
      }
    } catch (error) {
      console.error("Failed to load board members", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditors();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const submitData = new FormData();
    submitData.append("fullName", formData.fullName);
    submitData.append("email", formData.email);
    submitData.append("qualifications", formData.qualifications);
    submitData.append("affiliation", formData.affiliation);
    submitData.append("bio", formData.bio);
    submitData.append("isActive", "false");

    if (imageFile) {
      submitData.append("profileImage", imageFile);
    }

    try {
      const res = await fetch(`${API_URL}/editorial-board-member`, {
        method: "POST",
        body: submitData,
      });

      if (!res.ok) throw new Error("Request failed");

      toast.success(
        "Your request has been submitted! Awaiting admin approval "
      );
      setShowModal(false);

      setFormData({
        fullName: "",
        email: "",
        qualifications: "",
        affiliation: "",
        bio: "",
      });
      setImageFile(null);

      fetchEditors();
    } catch (err) {
      console.error(err);
      alert("Submission failed ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Editorial Board
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
            Our Editorial Board consists of distinguished experts dedicated to
            supporting research.
          </p>
          <Button onClick={() => setShowModal(true)}>
            Join Editorial Board
          </Button>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h2 className="text-2xl font-bold mb-4">Join Editorial Board</h2>

              <form onSubmit={handleSubmit} className="grid gap-3">
                <input
                  type="text"
                  name="fullName"
                  placeholder="Full Name"
                  required
                  className="border p-2 rounded"
                  value={formData.fullName}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  required
                  className="border p-2 rounded"
                  value={formData.email}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="qualifications"
                  placeholder="Qualifications"
                  className="border p-2 rounded"
                  value={formData.qualifications}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="affiliation"
                  placeholder="Affiliation"
                  className="border p-2 rounded"
                  value={formData.affiliation}
                  onChange={handleChange}
                />
                <textarea
                  name="bio"
                  placeholder="Short Bio"
                  className="border p-2 rounded"
                  rows={3}
                  value={formData.bio}
                  onChange={handleChange}
                ></textarea>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />

                <div className="flex justify-end gap-2 mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Managing Editor */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Managing Editor
          </h2>
          {loading ? (
            <SkeletonCard type="chief" />
          ) : (
            editorInChief && (
              <Card className="max-w-3xl mx-auto shadow-lg hover:shadow-xl">
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="w-64 h-64 flex-shrink-0 overflow-hidden rounded-lg ">
                      <img
                        src={editorInChief.profileImage || "/managing.webp"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold">
                        {editorInChief.fullName}
                      </h3>
                      <p className="text-gray-600 mb-4">
                        {editorInChief.email}
                      </p>
                      <p className="text-gray-600 mb-4">
                        {editorInChief.affiliation}
                      </p>
                      

                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" /> Contact
                      </Button>
                      <div className="mt-5">
                        <button
                          onClick={() => toggleBio(editorInChief.id)}
                          className="bg-primary rounded-md text-white py-1 px-10"
                        >
                          {expandedBioId === editorInChief.id
                            ? "Hide"
                            : "Read More"}
                        </button>
                        {expandedBioId === editorInChief.id && (
                          <p className="mt-2 text-gray-700">
                            {editorInChief.bio}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </section>

        {/* Board Members */}
        <section>
          <h2 className="text-3xl font-bold text-center mb-8">Our Board</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? [...Array(6)].map((_, i) => (
                  <SkeletonCard key={i} type="editor" />
                ))
              : associateEditors.map((editor: any, i) => (
                  <Card key={i} className="shadow-md hover:shadow-lg">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <div className="w-60 h-40 rounded-lg overflow-hidden mb-4">
                        <img
                          src={editor.profileImage || "/editor.webp"}
                          className="w-full h-full object-contain object-center"
                        />
                      </div>
                      <h3 className="text-xl font-bold">{editor.fullName}</h3>
                      <Badge variant="secondary" className="text-xs my-3">
                        {editor.role}
                      </Badge>
                      <p className="text-sm text-gray-600 mb-4">
                        {editor.qualifications}
                      </p>
                       <p className="text-sm text-gray-600 mb-4">
                        {editor.email}
                      </p>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-3 w-3" /> Contact
                      </Button>
                      <div className="mt-5">
                        <button
                          onClick={() => toggleBio(editor.id)}
                          className="bg-primary rounded-md text-white py-1 px-10"
                        >
                          {expandedBioId === editor.id ? "Hide" : "Read More"}
                        </button>
                        {expandedBioId === editor.id && (
                          <p className="mt-2 text-gray-700">{editor.bio}</p>
                        )}
                      </div>
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
