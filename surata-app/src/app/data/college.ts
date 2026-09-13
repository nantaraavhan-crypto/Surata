export interface Hackathon {
  id: string;
  title: string;
  organizer: string;
  description: string;
  startDate: string;
  endDate: string;
  prize: string;
  teamSize: string;
  mode: string;
  applyUrl: string;
  skills: string[];
}

export const hackathons: Hackathon[] = [
  {
    id: "h-1",
    title: "Smart India Hackathon 2026",
    organizer: "Government of India",
    description: "India's biggest hackathon solving real-world problems from government ministries.",
    startDate: "2026-08-01",
    endDate: "2026-08-03",
    prize: "₹1,00,00,000",
    teamSize: "6-8 members",
    mode: "Offline (SIH Centers)",
    applyUrl: "https://sih.gov.in/",
    skills: ["AI/ML", "IoT", "Blockchain", "Web Dev"],
  },
  {
    id: "h-2",
    title: "Google Hackathon 2026",
    organizer: "Google",
    description: "Build innovative solutions using Google Cloud, AI, and Android technologies.",
    startDate: "2026-09-15",
    endDate: "2026-09-17",
    prize: "$50,000",
    teamSize: "2-5 members",
    mode: "Hybrid",
    applyUrl: "https://devfolio.co/googlehackathon",
    skills: ["Google Cloud", "TensorFlow", "Android", "Flutter"],
  },
  {
    id: "h-3",
    title: "Microsoft Imagine Cup 2026",
    organizer: "Microsoft",
    description: "Global student technology competition to solve the world's toughest problems.",
    startDate: "2026-10-01",
    endDate: "2026-10-03",
    prize: "$100,000",
    teamSize: "1-4 members",
    mode: "Online + Finals in Seattle",
    applyUrl: "https://imaginecup.microsoft.com/",
    skills: ["Azure", "AI", "Cloud", "Full Stack"],
  },
  {
    id: "h-4",
    title: "MLH Season Finale 2026",
    organizer: "Major League Hacking",
    description: "The grand finale hackathon of the 2026 MLH season with top prizes.",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    prize: "$25,000",
    teamSize: "1-4 members",
    mode: "Online",
    applyUrl: "https://mlh.io/",
    skills: ["Any Tech Stack", "Open Source"],
  },
  {
    id: "h-5",
    title: "Devfolio Build With India",
    organizer: "Devfolio",
    description: "India's premier hackathon celebrating Indian builders and innovators.",
    startDate: "2026-08-15",
    endDate: "2026-08-17",
    prize: "₹15,00,000",
    teamSize: "2-5 members",
    mode: "Online",
    applyUrl: "https://devfolio.co/",
    skills: ["Web3", "AI/ML", "Full Stack", "Mobile"],
  },
  {
    id: "h-6",
    title: "NITI Aayog Youth Hackathon",
    organizer: "NITI Aayog",
    description: "Hackathon focused on solving India's sustainable development challenges.",
    startDate: "2026-09-20",
    endDate: "2026-09-22",
    prize: "₹50,00,000",
    teamSize: "3-6 members",
    mode: "Offline (Delhi)",
    applyUrl: "https://niti.gov.in/",
    skills: ["AI", "Data Science", "IoT", "Mobile"],
  },
];

export interface Competition {
  id: string;
  title: string;
  organizer: string;
  type: string;
  description: string;
  deadline: string;
  prize: string;
  eligibility: string;
  applyUrl: string;
}

export const competitions: Competition[] = [
  {
    id: "comp-1",
    title: "ACM ICPC 2026",
    organizer: "ACM",
    type: "Programming",
    description: "World's most prestigious programming contest for university students.",
    deadline: "2026-09-15",
    prize: "Global Finals + Prizes",
    eligibility: "University students",
    applyUrl: "https://icpc.global/",
  },
  {
    id: "comp-2",
    title: "Google Code Jam 2026",
    organizer: "Google",
    type: "Programming",
    description: "Global programming competition with algorithmic challenges.",
    deadline: "2026-04-01",
    prize: "$15,000 (Grand Prize)",
    eligibility: "Everyone",
    applyUrl: "https://codingcompetitions.withgoogle.com/codejam",
  },
  {
    id: "comp-3",
    title: "TCS CodeVita Season 13",
    organizer: "TCS",
    type: "Programming",
    description: "Global coding competition with largest participation worldwide.",
    deadline: "2026-06-30",
    prize: "$20,000",
    eligibility: "Students & Professionals",
    applyUrl: "https://codevita.tcs.com/",
  },
  {
    id: "comp-4",
    title: "Hackerearth March Circuits",
    organizer: "HackerEarth",
    type: "Competitive Programming",
    description: "Monthly competitive programming challenge with prizes.",
    deadline: "2026-03-31",
    prize: "₹2,00,000",
    eligibility: "Everyone",
    applyUrl: "https://www.hackerearth.com/",
  },
  {
    id: "comp-5",
    title: "Flipkart GRiD 6.0",
    organizer: "Flipkart",
    type: "Hackathon",
    description: "Flipkart's flagship hackathon for engineering students.",
    deadline: "2026-08-30",
    prize: "PPOs + Prizes",
    eligibility: "B.Tech students",
    applyUrl: "https://grid.flipkart.com/",
  },
];

export interface Fellowship {
  id: string;
  title: string;
  organization: string;
  description: string;
  duration: string;
  stipend: string;
  deadline: string;
  eligibility: string;
  applyUrl: string;
}

export const fellowships: Fellowship[] = [
  {
    id: "f-1",
    title: "Teach For India Fellowship",
    organization: "Teach For India",
    description: "Two-year fellowship working in underserved communities to end educational inequity.",
    duration: "2 Years",
    stipend: "₹20,000/month + housing",
    deadline: "2026-05-30",
    eligibility: "Graduates from any discipline",
    applyUrl: "https://www.teachforindia.org/",
  },
  {
    id: "f-2",
    title: "Azim Premji Foundation Fellowship",
    organization: "Azim Premji Foundation",
    description: "Fellowship for young professionals committed to improving education in rural India.",
    duration: "1 Year",
    stipend: "₹30,000/month",
    deadline: "2026-06-15",
    eligibility: "Postgraduates with 2+ years experience",
    applyUrl: "https://azimpremjiuniversity.edu.in/",
  },
  {
    id: "f-3",
    title: "Young India Fellowship",
    organization: "Ashoka University",
    description: "One-year multidisciplinary program for young leaders across India.",
    duration: "1 Year",
    stipend: "Full tuition + living",
    deadline: "2026-03-15",
    eligibility: "Young professionals under 28",
    applyUrl: "https://yif ashoka.edu.in/",
  },
  {
    id: "f-4",
    title: "Gandhi Fellowship",
    organization: "PIRT",
    description: "Two-year fellowship to develop leadership skills while working in rural schools.",
    duration: "2 Years",
    stipend: "₹14,000/month + travel",
    deadline: "2026-04-30",
    eligibility: "Graduates under 26",
    applyUrl: "https://www.gandhifellowship.org/",
  },
  {
    id: "f-5",
    title: "Stanford Africa MBA Fellowship",
    organization: "Stanford GSB",
    description: "Full fellowship for African leaders to pursue MBA at Stanford.",
    duration: "2 Years",
    stipend: "Full tuition + living",
    deadline: "2026-09-10",
    eligibility: "African nationals with leadership experience",
    applyUrl: "https://www.gsb.stanford.edu/",
  },
];

export interface CampusAmbassador {
  id: string;
  company: string;
  program: string;
  description: string;
  perks: string;
  duration: string;
  applyUrl: string;
}

export const campusAmbassadors: CampusAmbassador[] = [
  {
    id: "ca-1",
    company: "Microsoft",
    program: "Microsoft Learn Student Ambassador",
    description: "Represent Microsoft on campus, organize events, and build community.",
    perks: "Azure credits, Swag, Networking, Internship priority",
    duration: "1 Year (Renewable)",
    applyUrl: "https://studentambassadors.microsoft.com/",
  },
  {
    id: "ca-2",
    company: "Google",
    program: "Google Developer Student Club Lead",
    description: "Lead a developer community at your college with Google's support.",
    perks: "Google Swag, Mentoring, Event funding, Certificates",
    duration: "1 Year",
    applyUrl: "https://developers.google.com/community/gdsc",
  },
  {
    id: "ca-3",
    company: "AWS",
    program: "AWS Student Community Leader",
    description: "Build AWS community on campus and organize cloud workshops.",
    perks: "AWS Credits, Swag, Training, Certification vouchers",
    duration: "1 Year",
    applyUrl: "https://aws.amazon.com/developer-community/",
  },
  {
    id: "ca-4",
    company: "GitHub",
    program: "GitHub Campus Expert",
    description: "Lead GitHub community on campus and teach open source.",
    perks: "GitHub Swag, Training, Conference tickets, Networking",
    duration: "1 Year",
    applyUrl: "https://education.github.com/",
  },
  {
    id: "ca-5",
    company: "IBM",
    program: "IBM Student Ambassador",
    description: "Represent IBM and organize tech events on campus.",
    perks: "IBM Swag, Cloud credits, Internship priority",
    duration: "1 Year",
    applyUrl: "https://www.ibm.com/developer",
  },
];
