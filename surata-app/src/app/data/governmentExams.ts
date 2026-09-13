export interface GovernmentExam {
  id: string;
  title: string;
  category: string;
  description: string;
  notificationDate: string;
  examDate: string;
  eligibility: string;
  applyUrl: string;
}

export const governmentExams: GovernmentExam[] = [
  {
    id: "upsc-cse-2026",
    title: "UPSC Civil Services Examination 2026",
    category: "Civil Services",
    description:
      "IAS, IPS, IFS and other Group A/B services recruitment through the Union Public Service Commission.",
    notificationDate: "2026-02-12",
    examDate: "2026-06-01",
    eligibility: "Graduate from any recognized university, Age 21-32",
    applyUrl: "https://upsc.gov.in/",
  },
  {
    id: "ssc-cgl-2026",
    title: "SSC CGL 2026",
    category: "Staff Selection",
    description:
      "Combined Graduate Level examination for Group B and Group C posts in central government ministries.",
    notificationDate: "2026-03-15",
    examDate: "2026-07-10",
    eligibility: "Graduate from any recognized university",
    applyUrl: "https://ssc.nic.in/",
  },
  {
    id: "ibps-po-2026",
    title: "IBPS PO 2026",
    category: "Banking",
    description:
      "Probationary Officer recruitment in 11 public sector banks across India.",
    notificationDate: "2026-04-20",
    examDate: "2026-08-15",
    eligibility: "Graduate from any recognized university, Age 20-30",
    applyUrl: "https://www.ibps.in/",
  },
  {
    id: "rrb-ntpc-2026",
    title: "RRB NTPC 2026",
    category: "Railways",
    description:
      "Non-Technical Popular Categories recruitment for graduate and undergraduate posts in Indian Railways.",
    notificationDate: "2026-03-01",
    examDate: "2026-07-20",
    eligibility: "Graduate/Undergraduate depending on post",
    applyUrl: "https://indianrailways.gov.in/",
  },
  {
    id: "gate-2026",
    title: "GATE 2026",
    category: "Engineering",
    description:
      "Graduate Aptitude Test in Engineering for M.Tech admissions and PSU recruitment.",
    notificationDate: "2025-09-01",
    examDate: "2026-02-08",
    eligibility: "B.Tech/BE or final year students",
    applyUrl: "https://gate.iitd.ac.in/",
  },
  {
    id: "cat-2026",
    title: "CAT 2026",
    category: "MBA",
    description:
      "Common Admission Test for admission to IIMs and top B-schools across India.",
    notificationDate: "2026-07-30",
    examDate: "2026-11-24",
    eligibility: "Graduate with 50% marks (45% for reserved)",
    applyUrl: "https://iimcat.ac.in/",
  },
  {
    id: "neet-2026",
    title: "NEET UG 2026",
    category: "Medical",
    description:
      "National Eligibility cum Entrance Test for MBBS, BDS, and AYUSH admissions.",
    notificationDate: "2026-02-01",
    examDate: "2026-05-05",
    eligibility: "12th pass with PCB subjects",
    applyUrl: "https://nta.ac.in/",
  },
  {
    id: "clat-2026",
    title: "CLAT 2026",
    category: "Law",
    description:
      "Common Law Admission Test for admission to National Law Universities across India.",
    notificationDate: "2025-12-01",
    examDate: "2026-05-18",
    eligibility: "12th pass with 45% marks (40% for reserved)",
    applyUrl: "https://consortiumofnlus.ac.in/",
  },
  {
    id: "ctet-2026",
    title: "CTET 2026",
    category: "Teaching",
    description:
      "Central Teacher Eligibility Test for teaching positions in central government schools.",
    notificationDate: "2026-04-01",
    examDate: "2026-07-07",
    eligibility: "Graduate with B.Ed or D.Ed",
    applyUrl: "https://ctet.nic.in/",
  },
  {
    id: "nda-na-2026",
    title: "NDA & NA 2026",
    category: "Defence",
    description:
      "National Defence Academy and Naval Academy examination for officer recruitment in Indian Armed Forces.",
    notificationDate: "2026-01-15",
    examDate: "2026-04-12",
    eligibility: "12th pass (PCM for Air Force/Navy)",
    applyUrl: "https://upsc.gov.in/",
  },
  {
    id: "jnu-entrance-2026",
    title: "JNU Entrance Examination 2026",
    category: "University",
    description:
      "Jawaharlal Nehru University entrance exam for BA, MA, M.Phil, and PhD programs.",
    notificationDate: "2026-03-10",
    examDate: "2026-05-25",
    eligibility: "12th pass or Graduate depending on program",
    applyUrl: "https://www.jnu.ac.in/",
  },
  {
    id: "du-cuet-2026",
    title: "DU CUET 2026",
    category: "University",
    description:
      "Delhi University admission through Common University Entrance Test for undergraduate programs.",
    notificationDate: "2026-02-20",
    examDate: "2026-05-15",
    eligibility: "12th pass",
    applyUrl: "https://www.du.ac.in/",
  },
];
