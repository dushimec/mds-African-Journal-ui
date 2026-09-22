import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-border bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-primary-foreground/80 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-4">
            <ShieldCheck className="h-10 w-10 text-white" aria-hidden="true" />
            <div>
              <p className="mb-2 text-sm uppercase tracking-[0.18em] text-primary-foreground/70">
                MDS African Journal
              </p>
              <h1 className="text-4xl md:text-5xl">Privacy Policy</h1>
            </div>
          </div>
          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/85">
            How we collect, use, and protect information when you visit our journal website.
          </p>
        </div>
      </section>

      <article className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="mb-10 text-muted-foreground">Last updated: September 22, 2026</p>

        <div className="space-y-10">
          <section>
            <h2 className="mb-3 text-3xl">Information we collect</h2>
            <p>
              We may collect information you provide when you create an account, submit research,
              contact the editorial team, subscribe to updates, or use other journal services. This
              can include your name, email address, affiliation, contact details, and manuscript
              information.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl">How we use information</h2>
            <p>
              We use information to operate the journal, process submissions, communicate with
              authors and reviewers, respond to enquiries, improve the website, and send updates
              when you have requested them.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl">Cookies</h2>
            <p>
              We use essential browser storage and cookies to support core functionality, remember
              your preferences, understand website usage, and keep the site reliable. You can
              accept or decline non-essential cookies using the notice shown on your first visit.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl">Sharing and security</h2>
            <p>
              We do not sell your personal information. Information may be shared with trusted
              service providers only when needed to provide journal services. We use reasonable
              technical and organizational safeguards, although no online service can guarantee
              complete security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-3xl">Your choices</h2>
            <p>
              You may request access to, correction of, or deletion of personal information held by
              us, subject to legal and editorial recordkeeping requirements. Contact the journal
              team at <a className="text-primary underline" href="mailto:info@majaed.org">info@majaed.org</a>.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
};

export default PrivacyPolicy;
