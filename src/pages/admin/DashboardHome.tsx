import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FileText,
  Bell,
  BookOpen,
  Layers,
  MessageCircle,
  UserCheck,
  Users,
} from "lucide-react";

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState({
    submissions: 0,
    subscribers: 0,
    topics: 0,
    issues: 0,
    messages: 0,
    editorialMembers: 0,
    users: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { Authorization: `Bearer ${token}` };

        const [
          submissionsRes,
          subscribersRes,
          topicsRes,
          issuesRes,
          messagesRes,
          editorialMembersRes,
          usersRes,
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/submission`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/newsletter/subscribers`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/topic`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/issues`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/contact-messages`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/editorial-board-member`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/users`, { headers }),
        ]);

        setStats({
          submissions: Array.isArray(submissionsRes.data.data) ? submissionsRes.data.data.length : 0,
          subscribers: Array.isArray(subscribersRes.data.data?.subscribers)
            ? subscribersRes.data.data.subscribers.length
            : 0,
          topics: Array.isArray(topicsRes.data.data) ? topicsRes.data.data.length : 0,
          issues: Array.isArray(issuesRes.data.data) ? issuesRes.data.data.length : 0,
          messages: Array.isArray(messagesRes.data.data?.contactMessages)
            ? messagesRes.data.data.contactMessages.length
            : 0,
          editorialMembers: Array.isArray(editorialMembersRes.data.data)
            ? editorialMembersRes.data.data.length
            : 0,
          users: Array.isArray(usersRes.data.data) ? usersRes.data.data.length : 0,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    { title: "Users", icon: Users, value: stats.users, color: "bg-blue-500" },
    { title: "Submissions", icon: FileText, value: stats.submissions, color: "bg-green-500" },
    { title: "Subscribers", icon: Bell, value: stats.subscribers, color: "bg-purple-500" },
    { title: "Topics", icon: BookOpen, value: stats.topics, color: "bg-pink-500" },
    { title: "Issues", icon: Layers, value: stats.issues, color: "bg-indigo-500" },
    { title: "Messages", icon: MessageCircle, value: stats.messages, color: "bg-red-500" },
    { title: "Editorial Members", icon: UserCheck, value: stats.editorialMembers, color: "bg-orange-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-5 flex items-center justify-between hover:shadow-xl transition"
          >
            <div>
              <p className="text-gray-500 text-sm">{card.title}</p>
              <h2 className="text-2xl font-bold">{card.value}</h2>
            </div>
            <div className={`${card.color} p-3 rounded-full text-white`}>
              <card.icon size={24} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardHome;
