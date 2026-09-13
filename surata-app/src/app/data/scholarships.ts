export interface Scholarship {
  id: string;
  title: string;
  provider: string;
  description: string;
  amount: string;
  deadline: string;
  eligibility: string;
  applyUrl: string;
}

export const scholarships: Scholarship[] = [
  {
    id: "pm-scholarship-2026",
    title: "PM Scholarship Scheme 2026",
    provider: "Government of India",
    description:
      "Scholarship for children of ex-servicemen and widows of armed forces personnel.",
    amount: "₹25,000/year",
    deadline: "2026-10-31",
    eligibility: "Dependents of ex-servicemen, 12th pass",
    applyUrl: "https://www.knowafro.com/",
  },
  {
    id: "aicte-scholarship-2026",
    title: "AICTE Pragati Scholarship 2026",
    provider: "AICTE",
    description:
      "Scholarship for girl students pursuing technical education at AICTE approved institutions.",
    amount: "₹50,000/year",
    deadline: "2026-11-15",
    eligibility: "Girl students in B.Tech/BCA/Diploma",
    applyUrl: "https://scholarships.gov.in/",
  },
  {
    id: "inspire-scholarship-2026",
    title: "INSPIRE Scholarship 2026",
    provider: "DST, Government of India",
    description:
      "Innovation in Science Pursuit for Inspired Research — scholarship for top 1% of board exam students.",
    amount: "₹80,000/year",
    deadline: "2026-09-30",
    eligibility: "Top 1% in 12th board exams",
    applyUrl: "https://www.online-inspire.gov.in/",
  },
  {
    id: "tatkal-scholarship-2026",
    title: "Tata Trusts Undergraduate Scholarship",
    provider: "Tata Trusts",
    description:
      "Need-based scholarship for undergraduate students from economically weaker backgrounds.",
    amount: "₹1,20,000/year",
    deadline: "2026-08-15",
    eligibility: "Family income < ₹3 lakh/year",
    applyUrl: "https://www.tatatrusts.org/",
  },
  {
    id: "kvp-y-2026",
    title: "KVPY Fellowship 2026",
    provider: "IISc Bangalore",
    description:
      "Kishore Vaigyanik Protsahan Yojana — fellowship for students pursuing basic science research.",
    amount: "₹84,000/year",
    deadline: "2026-07-20",
    eligibility: "1st year BSc/Integrated MSc students",
    applyUrl: "https://kvpy.iisc.ac.in/",
  },
  {
    id: "post-matric-sc-scholarship",
    title: "Post-Matric SC Scholarship 2026",
    provider: "Ministry of Social Justice",
    description:
      "Scholarship for SC students pursuing post-matriculation education.",
    amount: "₹15,000-60,000/year",
    deadline: "2026-12-31",
    eligibility: "SC category students, post-matric",
    applyUrl: "https://scholarships.gov.in/",
  },
  {
    id: "minority-scholarship-2026",
    title: "Maulana Azad National Scholarship 2026",
    provider: "Ministry of Minority Affairs",
    description:
      "Scholarship for meritorious students from minority communities.",
    amount: "₹12,000-25,000/year",
    deadline: "2026-10-15",
    eligibility: "Minority community students, 50% in previous exam",
    applyUrl: "https://scholarships.gov.in/",
  },
  {
    id: "swami-vivekananda-scholarship",
    title: "Swami Vivekananda Merit-cum-Means Scholarship",
    provider: "Government of West Bengal",
    description:
      "Merit-cum-means scholarship for meritorious students from economically weaker families.",
    amount: "₹60,000-1,20,000/year",
    deadline: "2026-11-30",
    eligibility: "WB domicile, 75%+ in previous exam",
    applyUrl: "https://svmcm.wbhed.gov.in/",
  },
  {
    id: "cbse-single-girl-child",
    title: "CBSE Single Girl Child Scholarship 2026",
    provider: "CBSE",
    description:
      "Scholarship for single girl child who passed CBSE Class X with 60%+ marks.",
    amount: "₹6,000/year",
    deadline: "2026-12-10",
    eligibility: "Single girl child, 60%+ in CBSE Class X",
    applyUrl: "https://cbse.gov.in/",
  },
  {
    id: "google-women-techmakers",
    title: "Google Women Techmakers Scholarship",
    provider: "Google",
    description:
      "Scholarship for women in computer science and technology to encourage diversity in tech.",
    amount: "₹1,50,000",
    deadline: "2026-06-30",
    eligibility: "Women in B.Tech/MTech CS, 7.0+ CGPA",
    applyUrl: "https://buildyourfuture.withgoogle.com/",
  },
  {
    id: "reliance-foundation-scholarship",
    title: "Reliance Foundation Undergraduate Scholarship",
    provider: "Reliance Foundation",
    description:
      "Need and merit-based scholarship for undergraduate students across India.",
    amount: "₹2,00,000/year",
    deadline: "2026-09-15",
    eligibility: "1st year UG students, family income < ₹15 LPA",
    applyUrl: "https://www.reliancefoundation.org/",
  },
  {
    id: "lic-golden-jubilee",
    title: "LIC Golden Jubilee Scholarship 2026",
    provider: "LIC of India",
    description:
      "Scholarship for students from economically weaker sections to pursue higher education.",
    amount: "₹20,000-40,000/year",
    deadline: "2026-11-20",
    eligibility: "12th pass, family income < ₹2 LPA",
    applyUrl: "https://licindia.in/",
  },
];
