import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How SURATA collects, uses, and protects information when you use the platform.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="space-y-8 text-slate-300 leading-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
            <p>
              SURATA (&quot;we&quot;, &quot;us&quot;) is an information platform
              that aggregates publicly available opportunities such as jobs,
              internships, scholarships, exam notifications, and results. This
              policy explains what information is handled when you use
              surata.vercel.app and the choices available to you.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Information we collect
            </h2>
            <p className="mb-3">
              SURATA does not require an account, and we do not ask for your
              name, email address, phone number, or payment details.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <span className="text-white">Usage data.</span> Like most
                websites, our hosting provider may process standard technical
                information such as IP address, browser type, pages visited, and
                timestamps for security and reliability purposes.
              </li>
              <li>
                <span className="text-white">Cookies and local storage.</span>{" "}
                We use browser storage to remember interface preferences such as
                filters and saved items, and to keep the site functioning.
              </li>
              <li>
                <span className="text-white">Information you send us.</span> If
                you contact us by email, we receive only what you choose to
                include in that message.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              How we use information
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>To operate, secure, and improve the platform.</li>
              <li>To remember your preferences between visits.</li>
              <li>To respond to messages you send us.</li>
              <li>
                To understand which sections are useful so we can prioritise
                them.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Advertising
            </h2>
            <p className="mb-3">
              SURATA may display advertising operated by third parties,
              including Google AdSense. These services may use cookies or
              similar technologies to serve ads based on your prior visits to
              this or other websites.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Google&apos;s use of advertising cookies enables it and its
                partners to serve ads based on your visits to this site and/or
                other sites on the internet.
              </li>
              <li>
                You may opt out of personalised advertising by visiting{" "}
                <a
                  href="https://www.google.com/settings/ads"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  Google Ads Settings
                </a>
                , or opt out of third-party vendor cookies at{" "}
                <a
                  href="https://www.aboutads.info/choices/"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="text-cyan-400 hover:text-cyan-300 underline"
                >
                  aboutads.info
                </a>
                .
              </li>
            </ul>
            <p className="mt-3">
              We do not control these third parties, and we recommend reviewing
              their own privacy policies for full details.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              External links
            </h2>
            <p>
              Listings on SURATA link to original sources such as government
              portals and third-party job boards. Those sites operate under
              their own privacy policies, which we do not control. We encourage
              you to review them before submitting any personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Data retention and security
            </h2>
            <p>
              We retain information only as long as needed for the purposes
              described here. Standard technical measures are used to protect
              the platform, but no method of transmission over the internet is
              completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Your rights
            </h2>
            <p>
              You can clear cookies and local storage through your browser
              settings at any time. If you have contacted us and would like
              your message deleted, write to us and we will remove it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Changes to this policy
            </h2>
            <p>
              We may update this policy from time to time. The latest version
              will always be published on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">Contact</h2>
            <p>
              Questions about this policy can be sent to{" "}
              <a
                href="mailto:surata12q@gmail.com"
                className="text-cyan-400 hover:text-cyan-300 underline"
              >
                surata12q@gmail.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
