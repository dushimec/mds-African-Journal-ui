import { useEffect, useState } from "react";
import axios from "axios";
import { useGlobalSearch } from "@/components/GlobalSearchContext";

const SearchResults = () => {
const { searchQuery } = useGlobalSearch();
const [results, setResults] = useState([]);

useEffect(() => {
const fetchResults = async () => {
if (!searchQuery.trim()) {
setResults([]);
return;
}
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/search?q=${encodeURIComponent(searchQuery)}`
    );

    if (res.data?.results) {
      const allResults = [
        ...res.data.results.users.map(r => ({ ...r, type: "User" })),
        ...res.data.results.submissions.map(r => ({ ...r, type: "Submission" })),
        ...res.data.results.authors.map(r => ({ ...r, type: "Author" })),
        ...res.data.results.announcements.map(r => ({ ...r, type: "Announcement" })),
        ...res.data.results.topics.map(r => ({ ...r, type: "Topic" })),
        ...res.data.results.faqs.map(r => ({ ...r, type: "FAQ" })),
        ...res.data.results.messages.map(r => ({ ...r, type: "Message" })),
      ];

      setResults(allResults);
    } else {
      setResults([]);
    }
  } catch (error) {
    console.error("Search error:", error);
    setResults([]);
  }
};

fetchResults();

}, [searchQuery]);

return ( <div className="container mx-auto py-6"> <h1 className="text-xl font-bold mb-4">
Search results for: "{searchQuery}" </h1>
  {results.length === 0 ? (
    <p>No results found.</p>
  ) : (
    <ul className="space-y-3">
      {results.map(item => (
        <li key={item.id} className="p-3 border rounded">
          <h2 className="font-semibold">
            {item.title || item.fullName || item.manuscriptTitle || item.subject || "No Title"}
          </h2>
          <p>
            {item.abstract || item.description || item.message || item.answer || "No description"}
          </p>
          <small className="text-gray-500">{item.type}</small>
        </li>
      ))}
    </ul>
  )}
</div>

);
};

export default SearchResults;
