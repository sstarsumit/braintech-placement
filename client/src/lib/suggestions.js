// Curated suggestion datasets for autocomplete inputs.
// SKILLS is a static taxonomy (fast, always available); live job-derived
// suggestions from /api/jobs/search-meta are merged in at runtime.

export const SKILLS = [
  // IT & Software
  'JavaScript', 'TypeScript', 'React', 'React Native', 'Next.js', 'Node.js', 'Express',
  'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST APIs', 'HTML', 'CSS',
  'Tailwind CSS', 'Bootstrap', 'Angular', 'Vue.js', 'Svelte', 'Python', 'Django', 'Flask',
  'Java', 'Spring Boot', 'Hibernate', 'C', 'C++', 'C#', '.NET', 'PHP', 'Laravel', 'CodeIgniter',
  'Ruby on Rails', 'Go', 'Rust', 'Kotlin', 'Swift', 'Android', 'iOS', 'Flutter', 'Dart',
  'Data Structures', 'Algorithms', 'System Design', 'Git', 'Docker', 'Kubernetes', 'AWS',
  'Azure', 'GCP', 'CI/CD', 'Linux', 'Bash', 'Jenkins', 'Terraform', 'Microservices',
  'Machine Learning', 'Deep Learning', 'Data Science', 'Pandas', 'NumPy', 'TensorFlow',
  'PyTorch', 'NLP', 'Computer Vision', 'Power BI', 'Tableau', 'Excel', 'SQL', 'Data Analytics',
  'Data Engineering', 'Spark', 'Hadoop', 'ETL', 'Salesforce', 'SAP', 'ERP', 'QA', 'Selenium',
  'Cypress', 'Manual Testing', 'Automation Testing', 'JIRA', 'Agile', 'Scrum',

  // Sales / Marketing / Ops
  'Sales', 'B2B Sales', 'B2C Sales', 'Inside Sales', 'Field Sales', 'Business Development',
  'Lead Generation', 'CRM', 'Digital Marketing', 'SEO', 'SEM', 'Google Ads', 'Meta Ads',
  'Social Media Marketing', 'Content Writing', 'Copywriting', 'Email Marketing', 'Analytics',
  'Brand Management', 'Market Research', 'Telesales', 'Channel Sales', 'Account Management',

  // Finance / HR / Admin
  'Accounting', 'Tally', 'GST', 'Bookkeeping', 'Financial Modeling', 'Budgeting',
  'Taxation', 'Audit', 'MIS Reporting', 'Payroll', 'Recruitment', 'HR Operations',
  'Employee Engagement', 'HR Compliance', 'Labor Laws', 'Onboarding', 'HRMS',
  'Office Administration', 'Front Office', 'Data Entry', 'Documentation', 'Receptionist',

  // Non-IT / Industrial
  'Electrician', 'Wiring', 'PCB Assembly', 'Soldering', 'Quality Control', 'Quality Assurance',
  'Production Planning', 'Machine Operator', 'CNC', 'Lathe', 'Welding', 'Fitter', 'Turner',
  'Maintenance', 'Plumbing', 'Carpentry', 'Masonry', 'Surveying', 'AutoCAD', 'SolidWorks',
  'Site Supervision', 'Estimation', 'Safety Compliance', 'Mining Operations', 'Drilling',
  'Supply Chain', 'Warehouse', 'Inventory Management', 'Logistics', 'Dispatch', 'Forklift',
  'Driving', 'Cooking', 'Bakery', 'Housekeeping', 'Tailoring', 'Beautician', 'Counselling',
  'Teaching', 'Nursing', 'Pharmacy', 'Lab Technician', 'Radiology', 'Medical Billing'
];

export const CITIES = [
  'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner', 'Bhilwara', 'Alwar', 'Sikar',
  'New Delhi', 'Delhi', 'Noida', 'Gurugram', 'Ghaziabad', 'Faridabad', 'Greater Noida',
  'Mumbai', 'Navi Mumbai', 'Thane', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur',
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Indore', 'Bhopal', 'Jabalpur',
  'Gwalior', 'Bengaluru', 'Mysuru', 'Hubli', 'Chennai', 'Coimbatore', 'Madurai', 'Salem',
  'Hyderabad', 'Warangal', 'Vijayawada', 'Visakhapatnam', 'Kolkata', 'Howrah', 'Durgapur',
  'Chandigarh', 'Mohali', 'Panchkula', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patna',
  'Ranchi', 'Jamshedpur', 'Bhubaneswar', 'Cuttack', 'Raipur', 'Bilaspur', 'Lucknow',
  'Kanpur', 'Varanasi', 'Agra', 'Meerut', 'Prayagraj', 'Bareilly', 'Gorakhpur', 'Dehradun',
  'Roorkee', 'Haridwar', 'Guwahati', 'Shillong', 'Bhopal', 'Kochi', 'Thiruvananthapuram',
  'Kozhikode', 'Thrissur', 'Goa', 'Panaji', 'Shimla', 'Manali', 'Jammu', 'Srinagar'
];

export const STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
  'Puducherry', 'Chandigarh'
];

export const DESIGNATIONS = [
  'Fresher', 'Intern', 'Trainee', 'Junior Developer', 'Software Developer', 'Software Engineer',
  'Senior Software Engineer', 'Team Lead', 'Tech Lead', 'Project Manager', 'Product Manager',
  'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Mobile App Developer',
  'Data Analyst', 'Data Scientist', 'DevOps Engineer', 'QA Engineer', 'Test Engineer',
  'Business Analyst', 'System Administrator', 'Network Engineer', 'IT Support',
  'Sales Executive', 'Sales Manager', 'Business Development Executive', 'Account Manager',
  'Digital Marketing Executive', 'SEO Specialist', 'Content Writer', 'HR Executive',
  'HR Manager', 'Recruiter', 'Accountant', 'Junior Accountant', 'Finance Manager',
  'Operations Executive', 'Operations Manager', 'Office Administrator', 'Front Desk Executive',
  'Customer Support Executive', 'Field Executive', 'Supervisor', 'Site Engineer',
  'Quality Engineer', 'Production Manager', 'Store Manager', 'Teacher', 'Counsellor'
];

export const INDUSTRY_OPTIONS = [
  'IT', 'Electronics', 'Mining', 'FMCG', 'Wire Manufacturing', 'Infrastructure',
  'Education', 'Healthcare', 'Banking & Finance', 'Manufacturing', 'Retail',
  'Logistics', 'Hospitality', 'Real Estate', 'Media', 'Other'
];

export const QUALIFICATIONS = [
  '10th', '12th', 'ITI', 'Diploma', 'B.A', 'B.Com', 'B.Sc', 'BCA', 'BBA', 'B.Tech', 'B.E',
  'M.A', 'M.Com', 'M.Sc', 'MCA', 'MBA', 'M.Tech', 'LLB', 'MBBS', 'PhD'
];

export const PREFERENCES = {
  roles: [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'Software Engineer',
    'Data Analyst', 'Sales Executive', 'Accountant', 'HR Executive', 'Digital Marketing Executive',
    'Operations Executive', 'Customer Support Executive', 'Business Development Executive',
    'Site Engineer', 'Quality Engineer', 'Teacher', 'Counsellor'
  ]
};

// Simple fuzzy prefix/substring matcher, case-insensitive, accent-safe.
// Accepts a mixed list of plain strings and { label, count? } objects and
// ALWAYS returns { label, count? } items — callers pass both kinds (live
// search-meta results + static datasets), and Autocomplete renders label/count.
export function suggest(list, query, limit = 8) {
  const norm = (item) =>
    typeof item === 'string'
      ? { label: item }
      : { label: item && item.label != null ? String(item.label) : String(item), count: item && item.count };
  const q = String(query || '').trim().toLowerCase();
  if (!q) return list.slice(0, limit).map(norm);
  const starts = [];
  const contains = [];
  for (const item of list) {
    const { label } = norm(item);
    const l = label.toLowerCase();
    if (l.startsWith(q)) starts.push(norm(item));
    else if (l.includes(q)) contains.push(norm(item));
    if (starts.length >= limit) break;
  }
  return [...starts, ...contains].slice(0, limit);
}

// Merge live suggestions (with counts) into the static list, deduped.
export function mergeSuggestions(staticList, liveList, query, limit = 8) {
  const live = suggest(liveList, query, limit);
  const seen = new Set(live.map((s) => s.label.toLowerCase()));
  const extra = suggest(staticList, query, limit).filter((s) => !seen.has(s.label.toLowerCase()));
  return [...live, ...extra].slice(0, limit);
}
