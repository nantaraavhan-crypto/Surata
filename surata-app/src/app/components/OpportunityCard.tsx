type OpportunityCardProps = {
  tag: string;
  title: string;
  description: string;
  location: string;
  stipend: string;
  duration: string;
  buttonText: string;
};

export default function OpportunityCard({
  tag,
  title,
  description,
  location,
  stipend,
  duration,
  buttonText,
}: OpportunityCardProps) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 hover:scale-105 transition">

      <span className="bg-cyan-500 text-black px-4 py-2 rounded-full text-sm font-bold">
        {tag}
      </span>

      <h2 className="text-3xl font-bold mt-6">
        {title}
      </h2>

      <p className="text-slate-400 mt-5 leading-8">
        {description}
      </p>

      <div className="mt-6 space-y-2 text-slate-300">

        <p>📍 Location: {location}</p>

        <p>💰 Stipend: {stipend}</p>

        <p>🕒 Duration: {duration}</p>

      </div>

      <button className="mt-8 bg-cyan-500 hover:bg-cyan-600 transition px-6 py-3 rounded-xl font-semibold">

        {buttonText}

      </button>

    </div>
  );
}