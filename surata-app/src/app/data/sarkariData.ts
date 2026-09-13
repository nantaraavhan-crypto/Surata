export interface ExamResult {
  id: string;
  title: string;
  organization: string;
  category: string;
  resultDate: string;
  resultLink: string;
  meritList: boolean;
  status: "declared" | "expected" | "awaited";
}

export const examResults: ExamResult[] = [
  // UPSC
  { id: "r-1", title: "UPSC Civil Services 2025 Final Result", organization: "UPSC", category: "Civil Services", resultDate: "2026-04-20", resultLink: "https://upsc.gov.in/", meritList: true, status: "declared" },
  { id: "r-2", title: "UPSC IFS 2025 Final Result", organization: "UPSC", category: "Civil Services", resultDate: "2026-05-10", resultLink: "https://upsc.gov.in/", meritList: true, status: "declared" },
  { id: "r-3", title: "UPSC Engineering Services 2025 Final Result", organization: "UPSC", category: "Engineering", resultDate: "2026-06-01", resultLink: "https://upsc.gov.in/", meritList: true, status: "declared" },
  { id: "r-4", title: "UPSC CMS 2025 Final Result", organization: "UPSC", category: "Medical", resultDate: "2026-06-15", resultLink: "https://upsc.gov.in/", meritList: true, status: "declared" },
  { id: "r-5", title: "UPSC NDA NA 1 2025 Result", organization: "UPSC", category: "Defence", resultDate: "2026-05-20", resultLink: "https://upsc.gov.in/", meritList: false, status: "declared" },
  { id: "r-6", title: "UPSC CSE Prelims 2025 Result", organization: "UPSC", category: "Civil Services", resultDate: "2026-07-15", resultLink: "https://upsc.gov.in/", meritList: false, status: "declared" },

  // SSC
  { id: "r-7", title: "SSC CGL 2025 Tier-II Final Result", organization: "SSC", category: "Staff Selection", resultDate: "2026-06-20", resultLink: "https://ssc.nic.in/", meritList: true, status: "declared" },
  { id: "r-8", title: "SSC CHSL 2025 Final Result", organization: "SSC", category: "Staff Selection", resultDate: "2026-05-15", resultLink: "https://ssc.nic.in/", meritList: true, status: "declared" },
  { id: "r-9", title: "SSC GD Constable 2025 Final Result", organization: "SSC", category: "Police", resultDate: "2026-04-30", resultLink: "https://ssc.nic.in/", meritList: true, status: "declared" },
  { id: "r-10", title: "SSC Delhi Police Constable 2025 Result", organization: "SSC", category: "Police", resultDate: "2026-05-25", resultLink: "https://ssc.nic.in/", meritList: false, status: "declared" },
  { id: "r-11", title: "SSC MTS 2025 Final Result", organization: "SSC", category: "Staff Selection", resultDate: "2026-06-10", resultLink: "https://ssc.nic.in/", meritList: true, status: "declared" },
  { id: "r-12", title: "SSC Stenographer 2025 Final Result", organization: "SSC", category: "Staff Selection", resultDate: "2026-05-30", resultLink: "https://ssc.nic.in/", meritList: true, status: "declared" },
  { id: "r-13", title: "SSC CPO 2025 Final Result", organization: "SSC", category: "Police", resultDate: "2026-06-25", resultLink: "https://ssc.nic.in/", meritList: true, status: "declared" },

  // IBPS
  { id: "r-14", title: "IBPS PO XV Final Result", organization: "IBPS", category: "Banking", resultDate: "2026-05-10", resultLink: "https://www.ibps.in/", meritList: true, status: "declared" },
  { id: "r-15", title: "IBPS Clerk XII Final Result", organization: "IBPS", category: "Banking", resultDate: "2026-04-20", resultLink: "https://www.ibps.in/", meritList: true, status: "declared" },
  { id: "r-16", title: "IBPS SO XV Final Result", organization: "IBPS", category: "Banking", resultDate: "2026-06-05", resultLink: "https://www.ibps.in/", meritList: true, status: "declared" },
  { id: "r-17", title: "IBPS RRB XII Final Result", organization: "IBPS", category: "Banking", resultDate: "2026-05-25", resultLink: "https://www.ibps.in/", meritList: true, status: "declared" },

  // Railways
  { id: "r-18", title: "Railway RRB Group D CEN 08/2024 Result", organization: "RRB", category: "Railways", resultDate: "2026-06-25", resultLink: "https://indianrailways.gov.in/", meritList: false, status: "declared" },
  { id: "r-19", title: "Railway RRB NTPC CEN 06/2025 Result", organization: "RRB", category: "Railways", resultDate: "2026-07-10", resultLink: "https://indianrailways.gov.in/", meritList: false, status: "declared" },
  { id: "r-20", title: "Railway RRB ALP CEN 01/2025 Result", organization: "RRB", category: "Railways", resultDate: "2026-06-15", resultLink: "https://indianrailways.gov.in/", meritList: false, status: "declared" },
  { id: "r-21", title: "Railway RRB JE CEN 05/2025 Result", organization: "RRB", category: "Railways", resultDate: "2026-06-30", resultLink: "https://indianrailways.gov.in/", meritList: false, status: "declared" },
  { id: "r-22", title: "RRB Section Controller CEN 04/2025 CBAT Score Card", organization: "RRB", category: "Railways", resultDate: "2026-07-01", resultLink: "https://indianrailways.gov.in/", meritList: false, status: "declared" },

  // State - UP
  { id: "r-23", title: "UPSSSC Technical Assistant Group C AGTA Result 2026", organization: "UPSSSC", category: "State Government", resultDate: "2026-06-20", resultLink: "https://upsssc.gov.in/", meritList: false, status: "declared" },
  { id: "r-24", title: "UP Polytechnic JEECUP Allotment Result 2026", organization: "JEECUP", category: "State Government", resultDate: "2026-06-25", resultLink: "https://jeecup.admissions.nic.in/", meritList: false, status: "declared" },
  { id: "r-25", title: "UPESSC UP TGT 2022 Result", organization: "UPESSC", category: "Teaching", resultDate: "2026-05-15", resultLink: "https://upessvac.in/", meritList: true, status: "declared" },
  { id: "r-26", title: "UP Police Home Guard Result 2026", organization: "UPPRPB", category: "Police", resultDate: "2026-07-05", resultLink: "https://uppbpb.gov.in/", meritList: false, status: "declared" },
  { id: "r-27", title: "UPSSSC Lekhpal Revised Answer Key 2026", organization: "UPSSSC", category: "State Government", resultDate: "2026-06-15", resultLink: "https://upsssc.gov.in/", meritList: false, status: "declared" },
  { id: "r-28", title: "ABVMU UP CAHET 2026 Result", organization: "ABVMU", category: "University", resultDate: "2026-06-28", resultLink: "https://abvmuup.in/", meritList: false, status: "declared" },

  // State - Bihar
  { id: "r-29", title: "Bihar 2 Year BEd Admissions Test 1st Round Allotment Result 2026", organization: "BCECEB", category: "Education", resultDate: "2026-06-30", resultLink: "https://bceceboard.bihar.gov.in/", meritList: false, status: "declared" },
  { id: "r-30", title: "Bihar Police BPSSC Havildar Clerk Home Guard Result 2026", organization: "BPSSSC", category: "Police", resultDate: "2026-06-20", resultLink: "https://bpssc.bih.nic.in/", meritList: false, status: "declared" },
  { id: "r-31", title: "JPSC Pre 2026 Result", organization: "JPSC", category: "Civil Services", resultDate: "2026-07-01", resultLink: "https://jpsc.gov.in/", meritList: false, status: "declared" },

  // State - Rajasthan
  { id: "r-32", title: "RPSC Rajasthan Police SI, Platoon Commander Interview Letter 2026", organization: "RPSC", category: "Police", resultDate: "2026-07-02", resultLink: "https://rpsc.rajasthan.gov.in/", meritList: false, status: "declared" },
  { id: "r-33", title: "Rajasthan RSSB Class 4th Revised Result 2026", organization: "RSSB", category: "State Government", resultDate: "2026-06-18", resultLink: "https://rsmssb.rajasthan.gov.in/", meritList: false, status: "declared" },
  { id: "r-34", title: "Rajasthan PTET Result 2026", organization: "PTET", category: "Education", resultDate: "2026-06-25", resultLink: "https://ptetggtu.com/", meritList: false, status: "declared" },
  { id: "r-35", title: "Rajasthan RSSB Village Development Officer VDO 2025 Final Result", organization: "RSSB", category: "State Government", resultDate: "2026-05-20", resultLink: "https://rsmssb.rajasthan.gov.in/", meritList: true, status: "declared" },

  // Banking - SBI
  { id: "r-36", title: "State Bank of India SBI CBO Result 2026", organization: "SBI", category: "Banking", resultDate: "2026-06-22", resultLink: "https://sbi.co.in/", meritList: true, status: "declared" },
  { id: "r-37", title: "SBI PO 2025 Final Result", organization: "SBI", category: "Banking", resultDate: "2026-04-15", resultLink: "https://sbi.co.in/", meritList: true, status: "declared" },
  { id: "r-38", title: "SBI Clerk 2025 Final Result", organization: "SBI", category: "Banking", resultDate: "2026-05-05", resultLink: "https://sbi.co.in/", meritList: true, status: "declared" },

  // LIC
  { id: "r-39", title: "LIC HFL Assistant Result 2026", organization: "LIC", category: "Insurance", resultDate: "2026-06-15", resultLink: "https://licindia.in/", meritList: true, status: "declared" },
  { id: "r-40", title: "LIC AAO 2025 Final Result", organization: "LIC", category: "Insurance", resultDate: "2026-04-25", resultLink: "https://licindia.in/", meritList: true, status: "declared" },

  // Defence
  { id: "r-41", title: "MHA IB Junior Intelligence Officer JIO/Tech 2025 Final Result", organization: "MHA IB", category: "Defence", resultDate: "2026-06-10", resultLink: "https://mha.gov.in/", meritList: true, status: "declared" },
  { id: "r-42", title: "Indian Air Force Agniveervayu Result 2026", organization: "IAF", category: "Defence", resultDate: "2026-05-30", resultLink: "https://agnipathvayu.cdac.in/", meritList: false, status: "declared" },

  // University
  { id: "r-43", title: "NTA JIPMAT 2026 Entrance Exam Result", organization: "NTA", category: "MBA", resultDate: "2026-06-20", resultLink: "https://nta.ac.in/", meritList: false, status: "declared" },
  { id: "r-44", title: "Rajasthan State Open School RSOS Class 10th and 12th Result 2026", organization: "RSOS", category: "Education", resultDate: "2026-06-28", resultLink: "https://rsosadmission.rajasthan.gov.in/", meritList: false, status: "declared" },
  { id: "r-45", title: "Bihar BCECE 2026 Result / Rank Card", organization: "BCECEB", category: "Engineering", resultDate: "2026-07-05", resultLink: "https://bceceboard.bihar.gov.in/", meritList: false, status: "declared" },

  // Expected/Awaited
  { id: "r-46", title: "SSC CGL 2026 Tier-I Result (Expected)", organization: "SSC", category: "Staff Selection", resultDate: "2026-08-15", resultLink: "https://ssc.nic.in/", meritList: false, status: "expected" },
  { id: "r-47", title: "IBPS PO XVI Final Result (Expected)", organization: "IBPS", category: "Banking", resultDate: "2026-11-01", resultLink: "https://www.ibps.in/", meritList: false, status: "expected" },
  { id: "r-48", title: "RRB NTPC CEN 06/2025 Final Result (Expected)", organization: "RRB", category: "Railways", resultDate: "2026-10-15", resultLink: "https://indianrailways.gov.in/", meritList: false, status: "expected" },
  { id: "r-49", title: "UPSC CSE Mains 2025 Result (Awaited)", organization: "UPSC", category: "Civil Services", resultDate: "2027-01-15", resultLink: "https://upsc.gov.in/", meritList: false, status: "awaited" },
  { id: "r-50", title: "NEET UG 2026 Result (Expected)", organization: "NTA", category: "Medical", resultDate: "2026-06-20", resultLink: "https://neet.nta.ac.in/", meritList: false, status: "expected" },
];

export interface AdmitCard {
  id: string;
  title: string;
  organization: string;
  category: string;
  examDate: string;
  downloadLink: string;
  status: "available" | "expected" | "released";
  cityLink?: string;
}

export const admitCards: AdmitCard[] = [
  // SSC
  { id: "ac-1", title: "SSC CGL 2025 Tier-II Admit Card", organization: "SSC", category: "Staff Selection", examDate: "2026-07-10", downloadLink: "https://ssc.nic.in/", status: "available" },
  { id: "ac-2", title: "SSC CHSL 2025 Tier-II Admit Card", organization: "SSC", category: "Staff Selection", examDate: "2026-07-15", downloadLink: "https://ssc.nic.in/", status: "available" },
  { id: "ac-3", title: "SSC GD Constable 2026 Admit Card", organization: "SSC", category: "Police", examDate: "2026-08-01", downloadLink: "https://ssc.nic.in/", status: "expected" },
  { id: "ac-4", title: "SSC MTS 2026 Admit Card", organization: "SSC", category: "Staff Selection", examDate: "2026-08-10", downloadLink: "https://ssc.nic.in/", status: "expected" },
  { id: "ac-5", title: "SSC Delhi Police Head Constable Admit Card", organization: "SSC", category: "Police", examDate: "2026-07-20", downloadLink: "https://ssc.nic.in/", status: "available" },

  // IBPS
  { id: "ac-6", title: "IBPS PO XVI Prelims Admit Card", organization: "IBPS", category: "Banking", examDate: "2026-08-15", downloadLink: "https://www.ibps.in/", status: "expected" },
  { id: "ac-7", title: "IBPS Clerk XIII Prelims Admit Card", organization: "IBPS", category: "Banking", examDate: "2026-09-01", downloadLink: "https://www.ibps.in/", status: "expected" },
  { id: "ac-8", title: "IBPS SO XVI Admit Card", organization: "IBPS", category: "Banking", examDate: "2026-08-25", downloadLink: "https://www.ibps.in/", status: "expected" },

  // Railways
  { id: "ac-9", title: "Railway RRB NTPC Graduate CEN 06/2025 CBT-II Exam City", organization: "RRB", category: "Railways", examDate: "2026-07-20", downloadLink: "https://indianrailways.gov.in/", status: "available", cityLink: "https://indianrailways.gov.in/" },
  { id: "ac-10", title: "Railway RRB Group D CEN 09/2025 Admit Card", organization: "RRB", category: "Railways", examDate: "2026-08-05", downloadLink: "https://indianrailways.gov.in/", status: "expected" },
  { id: "ac-11", title: "Railway RRB ALP CEN 01/2025 CBT-II Admit Card", organization: "RRB", category: "Railways", examDate: "2026-07-25", downloadLink: "https://indianrailways.gov.in/", status: "available" },
  { id: "ac-12", title: "Railway RRB JE CEN 05/2025 CBT-II Admit Card", organization: "RRB", category: "Railways", examDate: "2026-07-30", downloadLink: "https://indianrailways.gov.in/", status: "expected" },
  { id: "ac-13", title: "Railway RRB Technician CEN 02/2026 Exam City Details", organization: "RRB", category: "Railways", examDate: "2026-08-10", downloadLink: "https://indianrailways.gov.in/", status: "expected" },

  // UP
  { id: "ac-14", title: "UP Police Home Guard DV Admit Card 2026", organization: "UPPRPB", category: "Police", examDate: "2026-07-15", downloadLink: "https://uppbpb.gov.in/", status: "available" },
  { id: "ac-15", title: "UPSSSC Assistant Boring Technician Exam City 2026", organization: "UPSSSC", category: "State Government", examDate: "2026-07-20", downloadLink: "https://upsssc.gov.in/", status: "available" },
  { id: "ac-16", title: "UPSSSC Teacher Cadre JTC Exam City Details 2026", organization: "UPSSSC", category: "Teaching", examDate: "2026-07-25", downloadLink: "https://upsssc.gov.in/", status: "available" },
  { id: "ac-17", title: "UPTET 2026 Admit Card for Primary and Junior Level", organization: "UPBEB", category: "Teaching", examDate: "2026-07-25", downloadLink: "https://updeled.gov.in/", status: "expected" },

  // Rajasthan
  { id: "ac-18", title: "Rajasthan RIICO Various Post Admit Card 2026", organization: "RIICO", category: "State Government", examDate: "2026-07-18", downloadLink: "https://riico.co.in/", status: "available" },
  { id: "ac-19", title: "RPSC Rajasthan APO Exam Date 2026", organization: "RPSC", category: "Judiciary", examDate: "2026-08-01", downloadLink: "https://rpsc.rajasthan.gov.in/", status: "expected" },
  { id: "ac-20", title: "RPSC Senior Teacher TGT 07/2025 Exam City 2026", organization: "RPSC", category: "Teaching", examDate: "2026-07-22", downloadLink: "https://rpsc.rajasthan.gov.in/", status: "available" },
  { id: "ac-21", title: "RSSB LDC Grade II / Junior Assistant Admit Card 2026", organization: "RSSB", category: "State Government", examDate: "2026-07-28", downloadLink: "https://rsmssb.rajasthan.gov.in/", status: "expected" },

  // Bihar
  { id: "ac-22", title: "Bihar BPSC Prosecution Officer Exam Date 2026", organization: "BPSC", category: "Judiciary", examDate: "2026-07-20", downloadLink: "https://bpsc.bih.nic.in/", status: "expected" },

  // Delhi
  { id: "ac-23", title: "DSSSB Admit Card Exam 01-14 July 2026", organization: "DSSSB", category: "State Government", examDate: "2026-07-07", downloadLink: "https://dsssb.delhi.gov.in/", status: "available" },
  { id: "ac-24", title: "Delhi High Court Higher Judicial Service Admit Card", organization: "Delhi HC", category: "Judiciary", examDate: "2026-07-15", downloadLink: "https://delhihighcourt.nic.in/", status: "expected" },

  // Banking
  { id: "ac-25", title: "Central Bank of India CBI Apprentice Exam Date 2026", organization: "Central Bank", category: "Banking", examDate: "2026-07-20", downloadLink: "https://centralbankofindia.co.in/", status: "expected" },
  { id: "ac-26", title: "SBI Apprentices Admit Card 2026", organization: "SBI", category: "Banking", examDate: "2026-07-25", downloadLink: "https://sbi.co.in/", status: "expected" },
  { id: "ac-27", title: "SBI Circle Based Officers CBO Interview Letter 2026", organization: "SBI", category: "Banking", examDate: "2026-07-18", downloadLink: "https://sbi.co.in/", status: "available" },

  // MP
  { id: "ac-28", title: "MP ESB Nursing Admissions PNST Admit Card 2026", organization: "MPESB", category: "Medical", examDate: "2026-07-22", downloadLink: "https://mpesb.gov.in/", status: "available" },
  { id: "ac-29", title: "MP ESB Animal Husbandry Admission ADDET Admit Card 2026", organization: "MPESB", category: "Agriculture", examDate: "2026-07-25", downloadLink: "https://mpesb.gov.in/", status: "expected" },

  // Defence
  { id: "ac-30", title: "SSB Head Constable Ministerial 2020 Admit Card", organization: "SSB", category: "Defence", examDate: "2026-07-15", downloadLink: "https://ssbrectt.gov.in/", status: "available" },
  { id: "ac-31", title: "BSNL Senior Executive Trainee SET Admit Card 2026", organization: "BSNL", category: "Telecom", examDate: "2026-07-20", downloadLink: "https://bsnl.co.in/", status: "expected" },

  // NTA
  { id: "ac-32", title: "NTA ICAR AIEEA PG and PhD 2026 Admit Card", organization: "NTA", category: "Agriculture", examDate: "2026-07-15", downloadLink: "https://nta.ac.in/", status: "available" },
  { id: "ac-33", title: "NTA CUET UG 2026 Admit Card", organization: "NTA", category: "University", examDate: "2026-05-15", downloadLink: "https://nta.ac.in/", status: "released" },
  { id: "ac-34", title: "NTA NEET UG 2026 Admit Card", organization: "NTA", category: "Medical", examDate: "2026-05-05", downloadLink: "https://neet.nta.ac.in/", status: "released" },

  // Others
  { id: "ac-35", title: "CBSE Group A B C Skill Test Exam City Details", organization: "CBSE", category: "Education", examDate: "2026-07-10", downloadLink: "https://cbse.gov.in/", status: "available" },
  { id: "ac-36", title: "UPCISB UP Cooperative Bank Various Post Exam Date 2026", organization: "UPCISB", category: "Banking", examDate: "2026-07-22", downloadLink: "https://upcisb.org/", status: "expected" },
  { id: "ac-37", title: "UPHESC UP Assistant Professor 2022 Interview Letter", organization: "UPHESC", category: "Teaching", examDate: "2026-07-15", downloadLink: "https://uphed.ac.in/", status: "available" },
  { id: "ac-38", title: "UPPSC Staff Nurse 2023 DV Notice 2026", organization: "UPPSC", category: "Medical", examDate: "2026-07-20", downloadLink: "https://uppsc.up.nic.in/", status: "available" },
  { id: "ac-39", title: "HTET 2026 Admit Card", organization: "BSEH", category: "Teaching", examDate: "2026-07-18", downloadLink: "https://bseh.org.in/", status: "available" },
  { id: "ac-40", title: "RPSC RAS Pre 2026 Admit Card", organization: "RPSC", category: "Civil Services", examDate: "2026-09-20", downloadLink: "https://rpsc.rajasthan.gov.in/", status: "expected" },
];

export interface AnswerKey {
  id: string;
  title: string;
  organization: string;
  examDate: string;
  answerKeyLink: string;
  objectionLink?: string;
  status: "released" | "final" | "expected";
}

export const answerKeys: AnswerKey[] = [
  { id: "ak-1", title: "BSEB Bihar DELED 2026 Answer Key", organization: "BSEB", examDate: "2026-06-15", answerKeyLink: "https://bseb.ac.in/", status: "released" },
  { id: "ak-2", title: "UPSSSC UP Pollution Control Board Various Post Answer Key 2026", organization: "UPSSSC", examDate: "2026-06-20", answerKeyLink: "https://upsssc.gov.in/", status: "released" },
  { id: "ak-3", title: "UPSSSC Pharmacist Answer Key 2026", organization: "UPSSSC", examDate: "2026-06-18", answerKeyLink: "https://upsssc.gov.in/", status: "released" },
  { id: "ak-4", title: "UPSSSC BCG Technician Answer Key 2026", organization: "UPSSSC", examDate: "2026-06-22", answerKeyLink: "https://upsssc.gov.in/", status: "released" },
  { id: "ak-5", title: "ABVMU UP CAHET 2026 Answer Key", organization: "ABVMU", examDate: "2026-06-25", answerKeyLink: "https://abvmuup.in/", status: "released" },
  { id: "ak-6", title: "Railway RRB NTPC UG CEN 07/2025 Answer Key", organization: "RRB", examDate: "2026-06-30", answerKeyLink: "https://indianrailways.gov.in/", status: "released" },
  { id: "ak-7", title: "NTA NEET UG Re-Exam Answer Key 2026", organization: "NTA", examDate: "2026-05-10", answerKeyLink: "https://neet.nta.ac.in/", status: "final" },
  { id: "ak-8", title: "UPSC ISS Exam Answer Key 2026", organization: "UPSC", examDate: "2026-06-01", answerKeyLink: "https://upsc.gov.in/", status: "released" },
  { id: "ak-9", title: "SSC Delhi Police Head Constable Ministerial 2025 Final Answer Key", organization: "SSC", examDate: "2026-05-25", answerKeyLink: "https://ssc.nic.in/", status: "final" },
  { id: "ak-10", title: "MPESB Van Rakshak, Jail Prahari Answer Key 2026", organization: "MPESB", examDate: "2026-06-28", answerKeyLink: "https://mpesb.gov.in/", status: "released" },
  { id: "ak-11", title: "NTA CUET UG 2026 Final Answer Key", organization: "NTA", examDate: "2026-05-20", answerKeyLink: "https://nta.ac.in/", status: "final" },
  { id: "ak-12", title: "UP Police Constable Answer Key 2026", organization: "UPPRPB", examDate: "2026-06-15", answerKeyLink: "https://uppbpb.gov.in/", status: "released" },
  { id: "ak-13", title: "UPPSC GIC Lecturer Answer Key 2026", organization: "UPPSC", examDate: "2026-06-20", answerKeyLink: "https://uppsc.up.nic.in/", status: "released" },
  { id: "ak-14", title: "DRDO CEPTAM 11 Tier II Answer Key 2026", organization: "DRDO", examDate: "2026-06-25", answerKeyLink: "https://drdo.gov.in/", status: "released" },
  { id: "ak-15", title: "SSC Combined Graduate Level CGL 2025 Tier II Final Answer Key", organization: "SSC", examDate: "2026-06-10", answerKeyLink: "https://ssc.nic.in/", status: "final" },
  { id: "ak-16", title: "Rajasthan PTET 2026 Answer Key for 2 Yr and 4 Yr BED", organization: "PTET", examDate: "2026-06-22", answerKeyLink: "https://ptetggtu.com/", status: "released" },
  { id: "ak-17", title: "SSC Delhi Police Head Constable AWO/TPO Final Answer Key With Marks 2026", organization: "SSC", examDate: "2026-06-05", answerKeyLink: "https://ssc.nic.in/", status: "final" },
  { id: "ak-18", title: "SSC GD Constable Answer Key 2026", organization: "SSC", examDate: "2026-06-01", answerKeyLink: "https://ssc.nic.in/", status: "released" },
  { id: "ak-19", title: "Rajasthan RSSB Lab Assistant Answer Key 2026", organization: "RSSB", examDate: "2026-06-18", answerKeyLink: "https://rsmssb.rajasthan.gov.in/", status: "released" },
  { id: "ak-20", title: "UPSSSC Junior Assistant Revised Answer Key 2026", organization: "UPSSSC", examDate: "2026-06-12", answerKeyLink: "https://upsssc.gov.in/", status: "final" },
  { id: "ak-21", title: "DSSSB Various Post Answer Key", organization: "DSSSB", examDate: "2026-06-08", answerKeyLink: "https://dsssb.delhi.gov.in/", status: "released" },
  { id: "ak-22", title: "SSC CHSL 2025 Tier-I Final Answer Key", organization: "SSC", examDate: "2026-05-15", answerKeyLink: "https://ssc.nic.in/", status: "final" },
  { id: "ak-23", title: "NTA UGC NET December 2025 Answer Key", organization: "NTA", examDate: "2026-04-20", answerKeyLink: "https://nta.ac.in/", status: "final" },
  { id: "ak-24", title: "Bihar Police BPSSC SI Prelims Answer Key 2026", organization: "BPSSSC", examDate: "2026-06-28", answerKeyLink: "https://bpssc.bih.nic.in/", status: "released" },
  { id: "ak-25", title: "RRB ALP CEN 01/2025 CBT-I Answer Key", organization: "RRB", examDate: "2026-05-20", answerKeyLink: "https://indianrailways.gov.in/", status: "final" },
];
