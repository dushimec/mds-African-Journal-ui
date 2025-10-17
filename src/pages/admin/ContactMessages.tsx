import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { Edit, Trash2, User, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ContactMessage {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  institution?: string;
  inquiryType: string;
  subject: string;
  message: string;
  submittedAt: string;
  isRead: boolean;
}

const ContactMessages: React.FC = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ContactMessage>>({});

  const baseUrl = import.meta.env.VITE_API_URL;

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/contact-messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      const data = await res.json();
      if (data.status === "success" && data.data?.contactMessages) {
        setMessages(data.data.contactMessages);
      } else {
        setMessages([]);
      }
    } catch (err) {
      console.error(err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This will permanently delete the message!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        const res = await fetch(`${baseUrl}/contact-messages/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        if (!res.ok) throw new Error("Failed to delete message");

        setMessages(messages.filter((m) => m.id !== id));
        Swal.fire("Deleted!", "Message has been deleted.", "success");
      } catch (err) {
        console.error(err);
        Swal.fire("Error", "Something went wrong while deleting.", "error");
      }
    }
  };

  const handleEdit = (msg: ContactMessage) => {
    setEditId(msg.id);
    setEditData(msg);
  };

  const handleUpdate = async () => {
    if (!editId) return;
    try {
      const res = await fetch(`${baseUrl}/contact-messages/${editId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      if (data.status === "success") {
        toast.success("Message updated successfully!");
        setMessages(messages.map((msg) => (msg.id === editId ? { ...msg, ...editData } : msg)));
        setEditId(null);
        setEditData({});
      } else {
        toast.error(data.message || "Failed to update message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong while updating.");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <h2 className="text-3xl font-bold mb-6 text-center">Contact Messages</h2>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : messages.length === 0 ? (
        <p className="text-center text-muted-foreground">No messages available.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-1/6">Name</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-1/6">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-1/6">Subject</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-2/6">Message</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-700 w-1/6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className="border-b hover:bg-gray-50">
                  {/* Name */}
                  <td className="px-6 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <User size={16} />
                      {editId === msg.id ? (
                        <Input
                          value={editData.firstName}
                          onChange={(e) =>
                            setEditData({ ...editData, firstName: e.target.value })
                          }
                          className="w-24"
                        />
                      ) : (
                        `${msg.firstName} ${msg.lastName}`
                      )}
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <Mail size={16} />
                      {editId === msg.id ? (
                        <Input
                          value={editData.email}
                          onChange={(e) =>
                            setEditData({ ...editData, email: e.target.value })
                          }
                          className="w-48"
                        />
                      ) : (
                        msg.email
                      )}
                    </div>
                  </td>

                  {/* Subject */}
                  <td className="px-6 py-3 align-middle">
                    {editId === msg.id ? (
                      <Input
                        value={editData.subject}
                        onChange={(e) =>
                          setEditData({ ...editData, subject: e.target.value })
                        }
                      />
                    ) : (
                      msg.subject
                    )}
                  </td>

                  {/* Message */}
                  <td className="px-6 py-3 align-middle whitespace-pre-wrap">
                    {editId === msg.id ? (
                      <Input
                        value={editData.message}
                        onChange={(e) =>
                          setEditData({ ...editData, message: e.target.value })
                        }
                      />
                    ) : (
                      msg.message
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-3 align-middle">
                    <div className="flex justify-center gap-2">
                      {editId === msg.id ? (
                        <>
                          <Button size="sm" onClick={handleUpdate}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditId(null)}>
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" onClick={() => handleEdit(msg)}>
                            <Edit size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(msg.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ContactMessages;
