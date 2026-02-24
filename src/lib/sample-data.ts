export const SAMPLE_COURSES = [
  { id: "sample-1", code: "CS757", name: "Corporate Strategy", professor: "Prof. Deepak Chandrashekar", term: "Term 4", category: "elective" as const, domain: "strategy" as const, avg_rating: 4.2, review_count: 1 },
  { id: "sample-2", code: "EC747", name: "Business, Finance and Intl Economy", professor: "Prof. Anubha Dhasmana", term: "Term 4", category: "elective" as const, domain: "economics" as const, avg_rating: 4.2, review_count: 1 },
  { id: "sample-3", code: "DN714", name: "Zen and Mind Training", professor: "Prof. Dinesh Kumar & Nitesh Batra", term: "Term 4", category: "elective" as const, domain: "interdisciplinary" as const, avg_rating: 4.2, review_count: 1 },
  { id: "sample-4", code: "PO705", name: "Supply Chain Management", professor: "Prof. Jishnu Hazra", term: "Term 4", category: "elective" as const, domain: "operations" as const, avg_rating: 4.2, review_count: 1 },
  { id: "sample-5", code: "DS718", name: "Predictive and Generative AI", professor: "Prof. Naveen Kumar Bhansali", term: "Term 4", category: "elective" as const, domain: "analytics" as const, avg_rating: 3.2, review_count: 1 },
  { id: "sample-6", code: "FI701", name: "Investments", professor: "Prof. Srijith Mohanan", term: "Term 4", category: "elective" as const, domain: "finance" as const, avg_rating: 4.2, review_count: 1 },
];

export const SAMPLE_EXCHANGE = [
  { id: "sample-e1", name: "HEC Paris", country: "France", region: "europe" as const, avg_rating: 4.6, review_count: 5, highlights: ["Great social life", "Paris location", "Strong finance"] },
  { id: "sample-e2", name: "NUS Business School", country: "Singapore", region: "asia" as const, avg_rating: 4.4, review_count: 7, highlights: ["Asia hub", "Tech ecosystem", "Clean city"] },
  { id: "sample-e3", name: "Bocconi University", country: "Italy", region: "europe" as const, avg_rating: 4.5, review_count: 4, highlights: ["Milan lifestyle", "Fashion & luxury", "Great food"] },
];

export const SAMPLE_INTERNSHIPS = [
  { id: "sample-i1", name: "McKinsey & Company", domain: "consulting" as const, avg_rating: 4.5, review_count: 9, avg_stipend: "₹2.5L/mo", highlights: ["Steep learning", "Great mentors", "Travel"] },
  { id: "sample-i2", name: "Goldman Sachs", domain: "finance" as const, avg_rating: 4.2, review_count: 6, avg_stipend: "₹2L/mo", highlights: ["Finance depth", "Network", "Brand"] },
  { id: "sample-i3", name: "Google", domain: "pm" as const, avg_rating: 4.8, review_count: 3, avg_stipend: "₹1.8L/mo", highlights: ["Culture", "Innovation", "Perks"] },
];

export const SAMPLE_PAPERS = [
  { id: "sample-p1", title: "Corporate Strategy End Term 2024", exam_type: "end_term" as const, year: 2024, vote_count: 34, file_url: "#", courses: { code: "CS757", name: "Corporate Strategy" } },
  { id: "sample-p2", title: "Supply Chain Management Mid Term 2024", exam_type: "mid_term" as const, year: 2024, vote_count: 21, file_url: "#", courses: { code: "PO705", name: "Supply Chain Management" } },
  { id: "sample-p3", title: "Behavioral Economics Quiz 3", exam_type: "quiz" as const, year: 2024, vote_count: 15, file_url: "#", courses: { code: "EC745", name: "Behavioral Economics" } },
];

export const SAMPLE_TIPS = [
  { id: "sample-t1", name: "Third Wave Coffee", category: "food_cafes" as const, rating: 4.5, tip_text: "Best coffee on campus. Try the cold brew — perfect for late-night study sessions. Also has great Wi-Fi.", useful_count: 28 },
  { id: "sample-t2", name: "Library Level 3", category: "study_spots" as const, rating: 4.8, tip_text: "Quietest floor in the library. Window seats have a garden view. Gets crowded after 8 PM during exams.", useful_count: 45 },
  { id: "sample-t3", name: "Nandi Hills Day Trip", category: "weekend_getaways" as const, rating: 4.3, tip_text: "Just 60km from campus. Go at sunrise — it's magical. Book an Uber early or split with friends.", useful_count: 19 },
  { id: "sample-t4", name: "Campus Gym", category: "gyms_sports" as const, rating: 4.0, tip_text: "Free for all students. Best time is 6-7 AM when it's empty. Has basic equipment but does the job.", useful_count: 32 },
];
