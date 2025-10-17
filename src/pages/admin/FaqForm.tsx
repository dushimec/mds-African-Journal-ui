import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Edit2, Trash2 } from "lucide-react";
import Swal from "sweetalert2";

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const FaqManager: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [editingFaq, setEditingFaq] = useState<Faq | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;

  // Fetch FAQs
  const fetchFaqs = async () => {
    setLoadingFaqs(true);
    try {
      const res = await fetch(`${baseUrl}/faqs`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await res.json();
      if (data.status === "success" && data.data?.faqs) {
        setFaqs(data.data.faqs);
      } else {
        setFaqs([]);
        console.error("Failed to fetch FAQs:", data);
      }
    } catch (err) {
      console.error("Error fetching FAQs:", err);
      setFaqs([]);
    } finally {
      setLoadingFaqs(false);
    }
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  // Add or Update FAQ
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !answer) {
      toast.error("Please fill in both fields");
      return;
    }

    setLoading(true);

    try {
      const method = editingFaq ? "PATCH" : "POST";
      const url = editingFaq
        ? `${baseUrl}/faqs/${editingFaq.id}`
        : `${baseUrl}/faqs`;

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify({ question, answer }),
      });

      const data = await res.json();

      if (data.status === "success") {
        toast.success(`FAQ ${editingFaq ? "updated" : "added"} successfully!`);
        setQuestion("");
        setAnswer("");
        setEditingFaq(null);
        fetchFaqs();
      } else {
        toast.error(data.message || "Failed to save FAQ");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  // Delete FAQ

const handleDelete = async (id: string) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This will permanently delete the FAQ!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
    cancelButtonText: "Cancel",
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${baseUrl}/faqs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      // Check HTTP response instead of just data
      if (res.ok) {
        Swal.fire("Deleted!", "FAQ has been deleted.", "success");
        setFaqs(faqs.filter((f) => f.id !== id));
      } else {
        // Try to parse error message from API
        let errorMsg = "Failed to delete FAQ";
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg;
        } catch (err) {
          console.error("Failed to parse error response:", err);
        }
        Swal.fire("Error", errorMsg, "error");
      }
    } catch (err) {
      console.error(err);
      Swal.fire("Error", "Something went wrong.", "error");
    }
  }
};


  const startEdit = (faq: Faq) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const displayedFaqs = showAll ? faqs : faqs.slice(0, 5);

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Add/Edit Form */}
      <div className="max-w-lg mx-auto mb-12 p-6 bg-white rounded-lg shadow-md border">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          {editingFaq ? "Edit FAQ" : "Add FAQ"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Question</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter question"
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Answer</label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              className="w-full border rounded px-3 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter answer"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : editingFaq ? "Update FAQ" : "Submit FAQ"}
          </button>
        </form>
      </div>

      {/* FAQ Table */}
      <h3 className="text-2xl font-semibold mb-6 text-center">
        Frequently Asked Questions
      </h3>
      {loadingFaqs ? (
        <p className="text-center">Loading FAQs...</p>
      ) : faqs.length === 0 ? (
        <p className="text-center text-muted-foreground">No FAQs available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 border">Question</th>
                <th className="px-4 py-2 border">Answer</th>
                <th className="px-4 py-2 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {displayedFaqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{faq.question}</td>
                  <td className="px-4 py-2 border">{faq.answer}</td>
                  <td className="px-4 py-2 border flex gap-2">
                    <button
                      onClick={() => startEdit(faq)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {faqs.length > 5 && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowAll(!showAll)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                {showAll ? "Show Less" : `View More (${faqs.length - 5})`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FaqManager;
