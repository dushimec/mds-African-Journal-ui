// src/pages/dashboard/UsersPage.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";

const API_URL = `${import.meta.env.VITE_API_URL}`; // or your baseUrl
const token = localStorage.getItem("access_token");

interface User {
  id: string;
  firstName: string;
  email: string;
  role: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // Delete user with SweetAlert confirmation
  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers((prev) => prev.filter((user) => user.id !== id));
        Swal.fire("Deleted!", "The user has been deleted.", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        Swal.fire("Error", "Failed to delete user.", "error");
      }
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">User Management</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left text-gray-700">Name</th>
                <th className="px-4 py-2 text-left text-gray-700">Email</th>
                <th className="px-4 py-2 text-left text-gray-700">Role</th>
                <th className="px-4 py-2 text-left text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? (
                users.map((user) => (
                  <tr key={user.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{user.firstName}</td>
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-md bg-red-500 text-white hover:bg-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-4 text-center text-gray-500"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
