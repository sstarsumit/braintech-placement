import User from './models/User.js';
import Candidate from './models/Candidate.js';
import Company from './models/Company.js';
import Job from './models/Job.js';
import Application from './models/Application.js';
import ContactRequest from './models/ContactRequest.js';
import PlacementStory from './models/PlacementStory.js';

export async function seedAll() {
  await Promise.all([
    User.deleteMany({}),
    Candidate.deleteMany({}),
    Company.deleteMany({}),
    Job.deleteMany({}),
    Application.deleteMany({}),
    ContactRequest.deleteMany({}),
    PlacementStory.deleteMany({})
  ]);

  await User.create({
    name: 'Braintech Admin', email: 'admin@braintech.com', password: 'admin123',
    role: 'admin', phone: '9876500000', isVerified: true
  });

  const candidateUsers = await User.create([
    { name: 'Sumit Sharma', email: 'sumit@example.com', password: 'candidate123', role: 'candidate', phone: '9876511111', isVerified: true },
    { name: 'Priya Verma', email: 'priya@example.com', password: 'candidate123', role: 'candidate', phone: '9876522222', isVerified: true },
    { name: 'Amit Kumar', email: 'amit@example.com', password: 'candidate123', role: 'candidate', phone: '9876533333', isVerified: false }
  ]);

  const recruiterUsers = await User.create([
    { name: 'HR ABC Technologies', email: 'hr@abctech.com', password: 'recruiter123', role: 'recruiter', phone: '9876544444', isVerified: true },
    { name: 'HR XYZ Solutions', email: 'hr@xyzsolutions.com', password: 'recruiter123', role: 'recruiter', phone: '9876555555', isVerified: true },
    { name: 'HR InfraWorks', email: 'hr@infraworks.com', password: 'recruiter123', role: 'recruiter', phone: '9876566666', isVerified: true }
  ]);

  const companies = await Company.create([
    {
      owner: recruiterUsers[0]._id, companyName: 'ABC Technologies', industry: 'IT',
      website: 'https://abctech.example.com', size: '50-200', foundedYear: '2012',
      about: 'Product engineering company building web and mobile platforms for global clients.',
      hrName: 'Rakesh Nair', hrPhone: '9876544444', state: 'Rajasthan', city: 'Jaipur',
      address: 'Malviya Nagar Industrial Area, Jaipur', verificationStatus: 'approved'
    },
    {
      owner: recruiterUsers[1]._id, companyName: 'XYZ Solutions', industry: 'IT',
      website: 'https://xyz.example.com', size: '200-500', foundedYear: '2009',
      about: 'Digital transformation and staffing solutions provider.',
      hrName: 'Neha Kapoor', hrPhone: '9876555555', state: 'Maharashtra', city: 'Pune',
      address: 'Hinjewadi Phase 2, Pune', verificationStatus: 'approved'
    },
    {
      owner: recruiterUsers[2]._id, companyName: 'InfraWorks India', industry: 'Infrastructure',
      website: 'https://infraworks.example.com', size: '500+', foundedYear: '2005',
      about: 'Infrastructure and construction major executing projects across India.',
      hrName: 'Suresh Yadav', hrPhone: '9876566666', state: 'Delhi', city: 'New Delhi',
      address: 'Connaught Place, New Delhi', verificationStatus: 'pending'
    }
  ]);

  const candidates = await Candidate.create([
    {
      user: candidateUsers[0]._id, dob: '1999-04-12', gender: 'male',
      headline: 'MERN stack developer who loves clean UI',
      highestQualification: 'B.Tech CSE', experienceYears: 1, currentDesignation: 'Junior Developer',
      currentCompany: 'TechNest', skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript'],
      industry: 'IT', expectedSalary: 5, noticePeriod: '30 days', workingStatus: 'working',
      country: 'India', state: 'Rajasthan', city: 'Jaipur', address: 'Vaishali Nagar, Jaipur',
      preferredRoles: ['Frontend Developer', 'MERN Developer'], preferredLocations: ['Jaipur', 'Remote'],
      preferredJobTypes: ['Full Time'], workModePreference: 'hybrid', isVerified: true
    },
    {
      user: candidateUsers[1]._id, dob: '1998-11-02', gender: 'female',
      headline: 'Full stack engineer, 3 years experience',
      highestQualification: 'MCA', experienceYears: 3, currentDesignation: 'Software Engineer',
      currentCompany: 'BitsAndBytes', skills: ['Node.js', 'Express', 'MongoDB', 'AWS', 'REST APIs'],
      industry: 'IT', expectedSalary: 9, noticePeriod: '15 days', workingStatus: 'working',
      country: 'India', state: 'Maharashtra', city: 'Pune', address: 'Kothrud, Pune',
      preferredRoles: ['Backend Developer', 'Node Developer'], preferredLocations: ['Pune', 'Mumbai'],
      preferredJobTypes: ['Full Time'], workModePreference: 'onsite', isVerified: true
    },
    {
      user: candidateUsers[2]._id, dob: '2001-06-25', gender: 'male',
      headline: '2024 graduate looking for first opportunity',
      highestQualification: 'BCA', experienceYears: 0, currentDesignation: 'Fresher',
      skills: ['HTML', 'CSS', 'JavaScript', 'React'],
      industry: 'IT', expectedSalary: 3, noticePeriod: 'Immediate', workingStatus: 'fresher',
      country: 'India', state: 'Rajasthan', city: 'Jaipur',
      preferredRoles: ['Frontend Developer'], preferredLocations: ['Jaipur'],
      preferredJobTypes: ['Full Time', 'Internship'], workModePreference: 'onsite'
    }
  ]);

  const jobs = await Job.create([
    {
      company: companies[0]._id, postedBy: recruiterUsers[0]._id,
      title: 'Frontend Developer', department: 'Engineering', industry: 'IT',
      description: 'Build modern, responsive web interfaces for our product using React. You will work closely with designers and backend engineers to ship features used by thousands of users.',
      responsibilities: ['Develop new user-facing features', 'Build reusable React components', 'Optimize applications for speed and scalability'],
      requirements: ['1+ year of hands-on React experience', 'Strong grip on JavaScript fundamentals', 'Familiarity with REST APIs'],
      skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      benefits: ['Health insurance', 'Flexible hours', 'Learning budget'],
      location: 'Jaipur, Rajasthan', employmentType: 'Full Time', workMode: 'Hybrid',
      salaryMin: 3.5, salaryMax: 5, experienceMin: 0, experienceMax: 2,
      education: 'B.Tech / BCA / MCA', openings: 5, deadline: new Date('2026-10-30'), status: 'active'
    },
    {
      company: companies[1]._id, postedBy: recruiterUsers[1]._id,
      title: 'MERN Developer', department: 'Engineering', industry: 'IT',
      description: 'Join our platform team to build and scale MERN stack applications. You will own features end to end, from database schema to polished UI.',
      responsibilities: ['Design MongoDB schemas', 'Build Express APIs', 'Create React dashboards'],
      requirements: ['2+ years with MERN stack', 'Understanding of JWT auth', 'Git workflow knowledge'],
      skills: ['MongoDB', 'Express', 'React', 'Node.js'],
      benefits: ['Remote friendly', 'Annual offsite', 'Performance bonus'],
      location: 'Remote', employmentType: 'Full Time', workMode: 'Remote',
      salaryMin: 6, salaryMax: 10, experienceMin: 2, experienceMax: 5,
      education: 'B.Tech / MCA', openings: 3, deadline: new Date('2026-11-15'), status: 'active'
    },
    {
      company: companies[1]._id, postedBy: recruiterUsers[1]._id,
      title: 'Node.js Backend Developer', department: 'Engineering', industry: 'IT',
      description: 'Design and build high-throughput REST APIs powering our recruitment platform.',
      responsibilities: ['Build and maintain Express services', 'Write tests and reviews', 'Monitor production APIs'],
      requirements: ['3+ years Node.js', 'Experience with MongoDB at scale'],
      skills: ['Node.js', 'Express', 'MongoDB', 'AWS'],
      benefits: ['Health cover', 'Stock options'],
      location: 'Pune, Maharashtra', employmentType: 'Full Time', workMode: 'On-site',
      salaryMin: 8, salaryMax: 14, experienceMin: 3, experienceMax: 6,
      education: 'B.Tech / MCA', openings: 2, deadline: new Date('2026-11-30'), status: 'active'
    },
    {
      company: companies[0]._id, postedBy: recruiterUsers[0]._id,
      title: 'React Intern', department: 'Engineering', industry: 'IT',
      description: 'Six-month internship for freshers who want to learn professional React development with mentors.',
      responsibilities: ['Assist senior developers', 'Fix UI bugs', 'Write component tests'],
      requirements: ['Final year student or graduate', 'Basic JavaScript knowledge'],
      skills: ['React', 'JavaScript'],
      benefits: ['Stipend ₹15k/month', 'Pre-placement offer potential'],
      location: 'Jaipur, Rajasthan', employmentType: 'Internship', workMode: 'On-site',
      salaryMin: 1.8, salaryMax: 2.4, experienceMin: 0, experienceMax: 0,
      education: 'Any graduate', openings: 4, deadline: new Date('2026-10-20'), status: 'active'
    },
    {
      company: companies[2]._id, postedBy: recruiterUsers[2]._id,
      title: 'Site Engineer', department: 'Operations', industry: 'Infrastructure',
      description: 'Supervise on-site execution of infrastructure projects, ensure safety compliance and coordinate with contractors.',
      responsibilities: ['Daily site supervision', 'Safety compliance checks', 'Contractor coordination'],
      requirements: ['Diploma / B.Tech Civil', 'Willing to relocate'],
      skills: ['Civil Engineering', 'Site Management'],
      benefits: ['Site allowance', 'PF & ESIC'],
      location: 'New Delhi, Delhi', employmentType: 'Full Time', workMode: 'On-site',
      salaryMin: 3, salaryMax: 4.5, experienceMin: 0, experienceMax: 3,
      education: 'Diploma / B.Tech Civil', openings: 6, deadline: new Date('2026-10-25'), status: 'pending'
    },
    {
      company: companies[0]._id, postedBy: recruiterUsers[0]._id,
      title: 'QA Engineer', department: 'Quality', industry: 'IT',
      description: 'Own quality for our web product: write test plans, automate regression suites and hunt bugs before users do.',
      responsibilities: ['Write test plans', 'Automate regression', 'Report and track bugs'],
      requirements: ['1-3 years QA experience', 'Selenium or Playwright basics'],
      skills: ['Testing', 'Selenium', 'JavaScript'],
      benefits: ['Health insurance'],
      location: 'Jaipur, Rajasthan', employmentType: 'Full Time', workMode: 'Hybrid',
      salaryMin: 3, salaryMax: 6, experienceMin: 1, experienceMax: 3,
      education: 'Any graduate', openings: 2, deadline: new Date('2026-12-01'), status: 'active'
    }
  ]);

  await Application.create([
    {
      job: jobs[0]._id, candidate: candidates[0]._id, user: candidateUsers[0]._id,
      coverLetter: 'I have built 3 production React apps and would love to contribute.',
      status: 'interview', interviewDate: new Date('2026-10-05T10:30:00'), interviewMode: 'Video'
    },
    { job: jobs[1]._id, candidate: candidates[0]._id, user: candidateUsers[0]._id, status: 'shortlisted' },
    { job: jobs[2]._id, candidate: candidates[1]._id, user: candidateUsers[1]._id, coverLetter: 'Node.js is my daily driver.', status: 'selected', placedAt: new Date() },
    { job: jobs[0]._id, candidate: candidates[1]._id, user: candidateUsers[1]._id, status: 'reviewing' },
    { job: jobs[3]._id, candidate: candidates[2]._id, user: candidateUsers[2]._id, coverLetter: 'Eager to start my career with your team.', status: 'applied' }
  ]);

  await PlacementStory.create([
    {
      name: 'Amit Kumar', designation: 'Architect', company: 'Larry Davan',
      story: 'I got wonderful job opportunity through Braintech education and placement services. I am very thankful to the Braintech placement to make my carrier better, they landed up my interview in many good and prestige company and I am able to crack interviews in one of them.'
    },
    {
      name: 'Shashi Kumar', designation: 'Architect',
      story: 'The team will have profound benefits and sensitivity to the needs of candidates. There could not have been any more professional process. Truly grateful to Braintech.'
    },
    {
      name: 'Larry Davan', designation: 'Engineer',
      story: 'From profile building to final offer, Braintech guided me at every step. Their follow-ups and interview preparation made all the difference.'
    }
  ]);

  await ContactRequest.create([
    {
      name: 'Deepak Mehta', email: 'deepak@example.com', phone: '9812345678',
      company: 'Mehta Wires', subject: 'Bulk hiring requirement',
      message: 'We need to hire 10 wire machine operators in Jaipur next month. Please contact us.'
    },
    {
      name: 'Sneha Raj', email: 'sneha@example.com', phone: '9898989898',
      subject: 'Resume review',
      message: 'I submitted my resume last week and wanted to check the status of my profile.'
    }
  ]);
}
