import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

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

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/editorial-board-member`
        );
        const data = await res.json();
        if (data.success) {
          const chief = data.data.find(
            (m: any) =>
              m.role.toLowerCase().includes("editor-in-chief") ||
              m.role.toLowerCase().includes("managing editor")
          );
          const others = data.data.filter((m: any) => m !== chief);
          setEditorInChief(chief);
          setAssociateEditors(others);
        }
      } catch (err) {
        console.error("Failed to fetch editorial board members:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEditors();
  }, []);

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Editorial Board
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our Editorial Board brings together scholars and practitioners who
            share a commitment to rigorous, policy-oriented research that
            advances inclusive and sustainable development across Africa and
            beyond.
          </p>
        </div>

        {/* Managing Editor Skeleton / Real */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Managing Editor
          </h2>
          {loading ? (
            <SkeletonCard type="chief" />
          ) : (
            editorInChief && (
              <Card className="max-w-3xl mx-auto shadow-lg hover:shadow-xl transition-shadow">
                <CardContent>
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-64 h-64 flex-shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={editorInChief.profileImage || "/managing.webp"}
                        alt="Managing Editor"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-2xl font-bold mb-2">
                        {editorInChief.fullName}
                      </h3>
                      <p className="text-gray-600 mb-4">{editorInChief.bio}</p>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-4 w-4" /> Contact
                      </Button>
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
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} type="editor" />
                ))
              : associateEditors.map((editor, index) => (
                  <Card
                    key={index}
                    className="shadow-md hover:shadow-lg transition-shadow w-full max-w-sm mx-auto"
                  >
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                      <div className="w-60 h-40 overflow-hidden flex items-center justify-center rounded-lg mb-4">
                        <img
                          src={editor.profileImage || "/editor.webp"}
                          alt={editor.fullName}
                          className="w-full h-full object-contain object-center"
                        />
                      </div>
                      <h3 className="text-xl font-bold mb-1">
                        {editor.fullName}
                      </h3>
                      <Badge variant="secondary" className="text-xs mb-3">
                        {editor.role}
                      </Badge>
                      {editor.expertise && (
                        <div className="flex flex-wrap gap-2 mb-3 justify-center">
                          {editor.expertise.map((area: string, i: number) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mb-1">{editor.bio}</p>
                      <p className="text-sm text-gray-600 mb-1">
                        {editor.affiliation}
                      </p>
                      <p className="text-sm text-gray-600 mb-4">
                        {editor.qualifications}
                      </p>
                      <Button variant="outline" size="sm">
                        <Mail className="mr-2 h-3 w-3" /> Contact Editor
                      </Button>
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
