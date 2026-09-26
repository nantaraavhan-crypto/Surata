import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "The terms that govern your use of the SURATA opportunity platform.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-16 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-cyan-400 mb-2">Terms of Use</h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: {new Date().getFullYear()}
        </p>

        <div className="space-y-8 text-slate-300 leading-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              1. Acceptance of terms
            </h2>
            <p>
              By accessing or using SURATA, you agree to these terms. If you do
              not agree, please discontinue use of the platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              2. What SURATA provides
            </h2>
            <p className="mb-3">
              SURATA aggregates publicly available information about jobs,
              internships, scholarships, competitions, exams, results, and
              related opportunities, and presents it in one place for
              convenience.
            </p>
            <p>
              We are an information service only. We are not an employer,
              recruiter, scholarship provider, exam authority, or educational
              institution, and we do not conduct any selection process.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              3. No guarantee of accuracy or availability
            </h2>
            <p className="mb-3">
              Listings are collected automatically from third-party and official
              sources. Details including eligibility, dates, fees, and
              vacancies can change without notice, and a listing may occasionally
              be incomplete or out of date.
            </p>
            <p>
              <span className="text-white font-medium">
                Always verify the information on the official source page before
                applying or paying any fee.
              </span>{" "}
              We make no warranty that any listing is accurate, complete, or
              still open.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              4. External links
            </h2>
            <p>
              Apply and notification links lead to third-party websites we do
              not own or control. Your interactions with those sites are
              governed solely by their terms and privacy policies. We are not
              responsible for their content, practices, or any loss arising
              from your use of them.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              5. Your responsibility
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Verify all details against the official source before acting.
              </li>
              <li>
                Never share passwords, OTPs, or payment information on the
                basis of a listing alone.
              </li>
              <li>
                Comply with the laws of India and the rules of any application
                you submit.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              6. Acceptable use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Use automated tools to extract or mirror content from SURATA at
                scale.
              </li>
              <li>Attempt to disrupt, overload, or gain unauthorised access.</li>
              <li>Redistribute listings as your own curated service.</li>
              <li>Use the platform for any unlawful or misleading purpose.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              7. Intellectual property
            </h2>
            <p>
              The platform&apos;s design, text, and code are property of
              SURATA. Individual listings remain the property of their original
              publishers and are shown with a link back to the source.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              8. Limitation of liability
            </h2>
            <p>
              To the maximum extent permitted by law, SURATA is not liable for
              any indirect, incidental, or consequential loss arising from your
              reliance on information presented here, including missed
              deadlines, missed opportunities, or decisions made on incomplete
              details. The platform is provided &quot;as is&quot; without
              warranties of any kind.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              9. Changes to these terms
            </h2>
            <p>
              We may revise these terms at any time. Continued use of the
              platform after changes means you accept the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">10. Contact</h2>
            <p>
              Questions about these terms can be sent to{" "}
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
