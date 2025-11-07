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
  Megaphone,
} from "lucide-react";

interface Stats {
  submissions: number;
  subscribers: number;
  topics: number;
  issues: number;
  messages: number;
  editorialMembers: number;
  users: number;
  announcements: number;
}

const DashboardHome: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    submissions: 0,
    subscribers: 0,
    topics: 0,
    issues: 0,
    messages: 0,
    editorialMembers: 0,
    users: 0,
    announcements: 0,
  });

  const [announcementList, setAnnouncementList] = useState<any[]>([]);

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
          announcementsRes,
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/submission`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/newsletter/subscribers`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/topic`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/issues`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/contact-messages`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/editorial-board-member`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/users`, { headers }),
          axios.get(`${import.meta.env.VITE_API_URL}/announcements`, { headers }),
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
          announcements: Array.isArray(announcementsRes.data.data?.announcements)
            ? announcementsRes.data.data.announcements.length
            : 0,
        });

        if (Array.isArray(announcementsRes.data.data?.announcements)) {
          setAnnouncementList(announcementsRes.data.data.announcements);
        }
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
    { title: "Announcements", icon: Megaphone, value: stats.announcements, color: "bg-teal-500" },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>

      {/* Stat Cards */}
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

      {/* Announcement List */}
      {announcementList.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-4">Latest Announcements</h2>
          <ul className="space-y-4">
            {announcementList.map((announcement) => (
              <li key={announcement.id} className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition">
                <h3 className="font-semibold text-lg">{announcement.title}</h3>
                <p className="text-muted-foreground text-sm">{announcement.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(announcement.date).toLocaleDateString()}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DashboardHome;
