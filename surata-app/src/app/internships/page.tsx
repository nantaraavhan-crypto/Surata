import { internships } from "../data/internships";
import Navbar from "../components/Navbar";
import OpportunityCard from "../components/OpportunityCard";

export default function InternshipsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-8 py-16">

      {/* Heading */}

      <div className="text-center mb-20">

        <h1 className="text-6xl font-extrabold text-cyan-400 mb-6">
          Latest Internships
        </h1>

        <p className="text-slate-400 text-xl max-w-3xl mx-auto leading-9">

          Discover the latest internships from top companies,
          startups, IITs and global organizations.

        </p>

      </div>

      {/* Search Bar */}

      <div className="flex justify-center mb-16">

        <input
          type="text"
          placeholder="Search internships..."
          className="w-full md:w-[700px] px-6 py-5 rounded-2xl bg-slate-900 border border-slate-700 outline-none text-lg"
        />

      </div>

      {/* Internship Cards */}

      <div className="grid md:grid-cols-3 gap-8">
{internships.map((internship, index) => (
  <OpportunityCard
    key={index}
    tag={internship.tag}
    title={internship.title}
    description={internship.description}
    location={internship.location}
    stipend={internship.stipend}
    duration={internship.duration}
    buttonText={internship.buttonText}
  />
))}
        

      </div>

      {/* Advertisement Space */}

      <section className="mt-24">

        <div className="bg-slate-900 border border-dashed border-slate-700 rounded-3xl p-16 text-center">

          <h2 className="text-3xl font-bold text-slate-400">
            Advertisement Space
          </h2>

          <p className="text-slate-500 mt-4">
            Internship promotions and Google Ads will appear here.
          </p>

        </div>

      </section>

    </main>
  );
}