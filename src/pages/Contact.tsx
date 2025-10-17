import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  FileText,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

interface Faq {
  id: string;
  question: string;
  answer: string;
}

const Contact: React.FC = () => {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [institution, setInstitution] = useState("");
  const [inquiryType, setInquiryType] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Newsletter subscription
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_API_URL;

  interface SocialLinks {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  }

  interface ContactInfo {
    id: string;
    intro: string;
    editorEmail: string;
    submissionsEmail: string;
    email?: string;
    phone?: string;
    mailingAddress: string;
    officeHours: string;
    locationDescription: string;
    social: SocialLinks;
    updatedAt?: string;
  }

  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loadingContactInfo, setLoadingContactInfo] = useState(false);

  const fetchContactInfo = async () => {
    setLoadingContactInfo(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/contact-info`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.status === "success" && res.data.data?.contactInfo) {
        setContactInfo(res.data.data.contactInfo);
      } else {
        setContactInfo(null);
      }
    } catch (error) {
      console.error("Failed to fetch contact info:", error);
      setContactInfo(null);
    } finally {
      setLoadingContactInfo(false);
    }
  };

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const inquiryTypes = [
    "General Information",
    "Submission Guidelines",
    "Peer Review Process",
    "Technical Support",
    "Editorial Board",
    "Subscription & Access",
    "Copyright & Permissions",
    "Other",
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !firstName ||
      !lastName ||
      !email ||
      !inquiryType ||
      !subject ||
      !message
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/contact-messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          institution,
          inquiryType: inquiryType.toLowerCase().replace(/\s+/g, "-"),
          subject,
          message,
        }),
      });

      const data = await res.json();
      if (data.status === "success") {
        toast.success("Message sent successfully!");
        setFirstName("");
        setLastName("");
        setEmail("");
        setInstitution("");
        setInquiryType("");
        setSubject("");
        setMessage("");
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewsletterSubscribe = async () => {
    if (!newsletterEmail) {
      toast.error("Please enter your email");
      return;
    }

    setNewsletterLoading(true);
    try {
      const res = await fetch(`${baseUrl}/newsletter/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newsletterEmail }),
      });

      const data = await res.json();
      if (res.ok && data.status === "success") {
        toast.success("Subscribed to newsletter successfully!");
        setNewsletterEmail("");
      } else {
        toast.error(data.message || "Failed to subscribe");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  const displayedFaqs = showAllFaqs ? faqs : faqs.slice(0, 5);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get in touch with our editorial team for any questions about
            submissions, peer review, or journal policies.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="shadow-strong">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageSquare className="mr-3 h-6 w-6 text-primary" />
                  Send us a Message
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        placeholder="Enter your first name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        placeholder="Enter your last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="institution">Institution/Affiliation</Label>
                    <Input
                      id="institution"
                      placeholder="Enter your institution"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="inquiryType">Inquiry Type *</Label>
                    <Select
                      onValueChange={(val) => setInquiryType(val)}
                      value={inquiryType}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        {inquiryTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type.toLowerCase().replace(/\s+/g, "-")}
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Provide detailed information..."
                      className="mt-1 min-h-32"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                  </div>

                  <Button
                    size="lg"
                    className="w-full font-semibold mt-2"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info with Skeleton Loader */}
          <div className="space-y-6">
            {loadingContactInfo ? (
              <>
                <div className="p-6 border rounded-lg animate-pulse space-y-3">
                  <div className="h-5 w-1/3 bg-gray-300 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                  <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
                </div>
                <div className="p-6 border rounded-lg animate-pulse space-y-3">
                  <div className="h-5 w-1/3 bg-gray-300 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                </div>
                <div className="p-6 border rounded-lg animate-pulse space-y-3">
                  <div className="h-5 w-1/3 bg-gray-300 rounded"></div>
                  <div className="h-4 w-2/3 bg-gray-300 rounded"></div>
                </div>
              </>
            ) : (
              contactInfo && (
                <>
                  {/* Editorial Emails */}
                  <Card className="shadow-medium">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Mail className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">
                            Editorial Office
                          </h3>
                          <p className="text-muted-foreground text-sm mb-1">
                            {contactInfo.editorEmail}
                          </p>
                          <p className="text-muted-foreground text-sm mb-1">
                            {contactInfo.submissionsEmail}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Mailing Address */}
                  <Card className="shadow-medium">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Mailing Address</h3>
                          <p className="text-muted-foreground text-sm mb-1">
                            {contactInfo.mailingAddress}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Office Hours */}
                  <Card className="shadow-medium">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Clock className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Office Hours</h3>
                          <p className="text-muted-foreground text-sm mb-1">
                            {contactInfo.officeHours}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )
            )}
          </div>
        </div>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          {loadingFaqs ? (
            <div className="max-w-4xl mx-auto space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="p-6 border rounded-lg animate-pulse space-y-3"
                >
                  <div className="h-5 w-2/3 bg-gray-300 rounded"></div>
                  <div className="h-4 w-full bg-gray-300 rounded"></div>
                  <div className="h-4 w-5/6 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : faqs.length === 0 ? (
            <p className="text-center text-muted-foreground">
              No FAQs available.
            </p>
          ) : (
            <>
              <div className="max-w-4xl mx-auto space-y-4">
                {displayedFaqs.map((faq) => (
                  <Card key={faq.id} className="shadow-soft">
                    <CardContent className="p-6">
                      <h3 className="font-semibold mb-3 flex items-start">
                        <FileText className="mr-2 h-5 w-5 text-primary mt-0.5" />
                        {faq.question}
                      </h3>
                      <p className="text-muted-foreground ml-7">{faq.answer}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {faqs.length > 5 && (
                <div className="text-center mt-6">
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => setShowAllFaqs(!showAllFaqs)}
                  >
                    {showAllFaqs ? "Show Less" : "View More"}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>

        {/* Location & Social */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="font-heading flex items-center">
                  <MapPin className="mr-3 h-6 w-6 text-primary" />
                  Our Location
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg h-48 flex items-center justify-center mb-4">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-12 w-12 mx-auto mb-2" />
                    <p>Interactive Map</p>
                    <p className="text-sm">123 Academic Plaza, Research City</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  {contactInfo?.locationDescription}
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="font-heading flex items-center">
                  <Globe className="mr-3 h-6 w-6 text-primary" />
                  Connect With Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Stay updated with the latest research and journal news
                    through our social media channels.
                  </p>
                  <div className="flex gap-3">
                    <a href={`${contactInfo?.social.twitter}`}>
                      <Button variant="outline" size="sm">
                        Twitter
                      </Button>
                    </a>
                    <a href={`${contactInfo?.social.linkedin}`}>
                      <Button variant="outline" size="sm">
                        LinkedIn
                      </Button>
                    </a>
                    <a href={`${contactInfo?.social.instagram}`}>
                      <Button variant="outline" size="sm">
                        Instagram
                      </Button>
                    </a>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <h4 className="font-semibold mb-2">Newsletter</h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Subscribe to receive updates on new issues and calls for
                      papers.
                    </p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter email"
                        className="flex-1"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                      />
                      <Button
                        size="sm"
                        disabled={newsletterLoading}
                        onClick={handleNewsletterSubscribe}
                      >
                        {newsletterLoading ? "..." : "Subscribe"}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;
