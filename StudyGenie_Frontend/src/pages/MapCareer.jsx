import React, { useState, useEffect } from "react";
import "../style/Career.css";
import AOS from "aos";
import "aos/dist/aos.css";

// Questions and Career Paths Data
const questions = [
  {
    id: 1,
    question: "What type of technology problems excite you the most?",
    description:
      "Think about what aspects of technology truly engage your interest and make you lose track of time.",
    options: [
      {
        id: "solving_complex",
        title: "Solving Complex Problems",
        description:
          "Breaking down difficult challenges into manageable parts.",
      },
      {
        id: "building_products",
        title: "Building Products",
        description:
          "Creating useful applications that solve real-world problems.",
      },
      {
        id: "data_insights",
        title: "Extracting Data Insights",
        description: "Analyzing data to discover patterns and insights.",
      },
      {
        id: "system_design",
        title: "Designing Systems",
        description: "Architecting efficient, scalable systems.",
      },
      {
        id: "user_experience",
        title: "Improving User Experience",
        description: "Creating intuitive interfaces.",
      },
    ],
    multiSelect: true,
    required: true,
  },
  {
    id: 2,
    question: "How do you prefer to work with others?",
    description:
      "Your collaboration style can indicate which tech roles suit you best.",
    options: [
      {
        id: "independent",
        title: "Independent Worker",
        description: "I prefer working through problems on my own.",
      },
      {
        id: "team_player",
        title: "Collaborative Team Player",
        description: "I thrive in team environments.",
      },
      {
        id: "leader",
        title: "Team Leader",
        description: "I enjoy guiding projects and teams.",
      },
      {
        id: "communicator",
        title: "Technical Communicator",
        description: "I excel at translating concepts.",
      },
    ],
    multiSelect: false,
    required: true,
  },
  {
    id: 3,
    question: "Which technical activities do you find most engaging?",
    description: "Consider what technical tasks you enjoy or want to learn.",
    options: [
      {
        id: "coding",
        title: "Writing Code",
        description: "Building functionality through programming.",
      },
      {
        id: "data_analysis",
        title: "Analyzing Data",
        description: "Extracting meaningful information from datasets.",
      },
      {
        id: "designing",
        title: "Designing Interfaces",
        description: "Creating visual layouts and flows.",
      },
      {
        id: "infrastructure",
        title: "Building Infrastructure",
        description: "Setting up systems.",
      },
      {
        id: "testing",
        title: "Testing & Quality Assurance",
        description: "Ensuring systems work correctly.",
      },
    ],
    multiSelect: true,
    required: true,
  },
  {
    id: 4,
    question: "Which industry sectors interest you most?",
    description: "Your industry preferences can guide your specialization.",
    options: [
      {
        id: "health_tech",
        title: "Healthcare & Biotech",
        description: "Improving health outcomes.",
      },
      {
        id: "fin_tech",
        title: "Financial Technology",
        description: "Innovating in financial services.",
      },
      {
        id: "entertainment",
        title: "Entertainment & Gaming",
        description: "Creating interactive media.",
      },
      {
        id: "education",
        title: "Education Technology",
        description: "Transforming learning.",
      },
      {
        id: "ecommerce",
        title: "E-commerce & Retail",
        description: "Building shopping experiences.",
      },
      {
        id: "social_impact",
        title: "Social Impact & Sustainability",
        description: "Addressing societal challenges.",
      },
    ],
    multiSelect: true,
    required: false,
  },
  {
    id: 5,
    question: "How do you approach learning new technologies?",
    description: "Your learning style can indicate sustainable career paths.",
    options: [
      {
        id: "deep_specialist",
        title: "Deep Specialist",
        description: "Mastering one technology stack.",
      },
      {
        id: "versatile_generalist",
        title: "Versatile Generalist",
        description: "Learning across technologies.",
      },
      {
        id: "practical_builder",
        title: "Practical Builder",
        description: "Learning by building projects.",
      },
      {
        id: "conceptual_learner",
        title: "Conceptual Learner",
        description: "Understanding principles first.",
      },
      {
        id: "community_learner",
        title: "Community Learner",
        description: "Learning through collaboration.",
      },
    ],
    multiSelect: false,
    required: true,
  },
  {
    id: 6,
    question: "Which technological trends excite you most?",
    description: "Emerging technologies create new career opportunities.",
    options: [
      {
        id: "ai_ml",
        title: "Artificial Intelligence & Machine Learning",
        description: "Creating intelligent systems.",
      },
      {
        id: "blockchain",
        title: "Blockchain & Web3",
        description: "Building decentralized applications.",
      },
      {
        id: "ar_vr",
        title: "AR/VR & Immersive Tech",
        description: "Developing extended reality experiences.",
      },
      {
        id: "iot",
        title: "Internet of Things",
        description: "Connecting physical devices.",
      },
      {
        id: "cybersecurity",
        title: "Cybersecurity",
        description: "Protecting systems from threats.",
      },
      {
        id: "cloud_edge",
        title: "Cloud & Edge Computing",
        description: "Building scalable infrastructure.",
      },
    ],
    multiSelect: true,
    required: false,
  },
  {
    id: 7,
    question: "What kind of work environment do you prefer?",
    description: "Your preferences matter for long-term satisfaction.",
    options: [
      {
        id: "startup",
        title: "Fast-paced Startup",
        description: "Dynamic environments with broad responsibilities.",
      },
      {
        id: "enterprise",
        title: "Established Enterprise",
        description: "Structured environments.",
      },
      {
        id: "agency",
        title: "Creative Agency",
        description: "Project-based work with diverse clients.",
      },
      {
        id: "remote",
        title: "Remote-first Organization",
        description: "Flexible work arrangements.",
      },
      {
        id: "research",
        title: "Research-focused Environment",
        description: "Innovation-driven settings.",
      },
    ],
    multiSelect: true,
    required: true,
  },
  {
    id: 8,
    question: "What aspects of your work provide the most satisfaction?",
    description: "Your values guide fulfilling career choices.",
    options: [
      {
        id: "problem_solving",
        title: "Intellectual Challenge",
        description: "Tackling difficult problems.",
      },
      {
        id: "user_impact",
        title: "User Impact",
        description: "Improving people's lives.",
      },
      {
        id: "innovation",
        title: "Innovation & Pioneering",
        description: "Breaking new ground.",
      },
      {
        id: "stability",
        title: "Stability & Structure",
        description: "Clear expectations.",
      },
      {
        id: "growth",
        title: "Continuous Learning",
        description: "Skill development.",
      },
      {
        id: "autonomy",
        title: "Autonomy & Ownership",
        description: "Control over work.",
      },
    ],
    multiSelect: true,
    required: true,
  },
];

const conditionalQuestions = {
  solving_complex: {
    id: "complex_problems",
    question: "What type of complex problems interest you most?",
    description:
      "Your preference for specific challenges can point toward specialized career paths.",
    options: [
      {
        id: "algorithmic",
        title: "Algorithmic Challenges",
        description: "Optimizing code performance.",
      },
      {
        id: "system_scale",
        title: "System Scaling Challenges",
        description: "Reliability at massive scale.",
      },
      {
        id: "security_issues",
        title: "Security & Privacy",
        description: "Protecting systems and data.",
      },
      {
        id: "integration",
        title: "Integration Challenges",
        description: "Seamless system interoperability.",
      },
    ],
    multiSelect: true,
    required: false,
    dependsOn: ["solving_complex"],
  },
  coding: {
    id: "coding_interests",
    question: "Which aspects of coding interest you most?",
    description: "Different development specialties require different skills.",
    options: [
      {
        id: "frontend",
        title: "Frontend Development",
        description: "Creating visual interfaces.",
      },
      {
        id: "backend",
        title: "Backend Development",
        description: "Building server-side logic.",
      },
      {
        id: "mobile",
        title: "Mobile Development",
        description: "Building apps for smartphones.",
      },
      {
        id: "game",
        title: "Game Development",
        description: "Creating interactive experiences.",
      },
      {
        id: "embedded",
        title: "Embedded Systems",
        description: "Programming for hardware.",
      },
    ],
    multiSelect: true,
    required: false,
    dependsOn: ["coding"],
  },
  ai_ml: {
    id: "ai_interests",
    question: "Which areas of AI/ML interest you most?",
    description: "AI and machine learning encompass many specialized domains.",
    options: [
      {
        id: "computer_vision",
        title: "Computer Vision",
        description: "Interpreting visual information.",
      },
      {
        id: "nlp",
        title: "Natural Language Processing",
        description: "Understanding human language.",
      },
      {
        id: "reinforcement",
        title: "Reinforcement Learning",
        description: "Learning through feedback.",
      },
      {
        id: "generative_ai",
        title: "Generative AI",
        description: "Producing new content.",
      },
      {
        id: "ai_ethics",
        title: "AI Ethics & Responsible AI",
        description: "Ensuring fair AI systems.",
      },
    ],
    multiSelect: true,
    required: false,
    dependsOn: ["ai_ml"],
  },
  user_experience: {
    id: "ux_interests",
    question: "Which aspects of user experience design interest you most?",
    description:
      "Different UX roles focus on various aspects of user interaction.",
    options: [
      {
        id: "user_research",
        title: "User Research",
        description: "Understanding user needs and behaviors.",
      },
      {
        id: "ui_design",
        title: "UI Design",
        description: "Creating visually appealing interfaces.",
      },
      {
        id: "interaction_design",
        title: "Interaction Design",
        description: "Designing user flows and interactions.",
      },
      {
        id: "accessibility",
        title: "Accessibility",
        description: "Ensuring inclusive design.",
      },
    ],
    multiSelect: true,
    required: false,
    dependsOn: ["user_experience"],
  },
  data_insights: {
    id: "data_interests",
    question: "Which data-related tasks interest you most?",
    description: "Data roles vary in their focus and technical requirements.",
    options: [
      {
        id: "data_viz",
        title: "Data Visualization",
        description: "Creating compelling visual representations.",
      },
      {
        id: "predictive",
        title: "Predictive Modeling",
        description: "Forecasting trends and outcomes.",
      },
      {
        id: "data_pipeline",
        title: "Data Pipeline Development",
        description: "Building data infrastructure.",
      },
      {
        id: "business_intel",
        title: "Business Intelligence",
        description: "Providing actionable insights.",
      },
    ],
    multiSelect: true,
    required: false,
    dependsOn: ["data_insights"],
  },
};

const careerPaths = [
  {
    title: "Software Developer",
    category: "Software Engineering",
    description: "Design and build applications to solve real-world problems.",
    matches: [
      "solving_complex",
      "building_products",
      "coding",
      "frontend",
      "backend",
      "mobile",
      "game",
      "embedded",
      "algorithmic",
    ],
    skills: [
      "Programming",
      "Problem-solving",
      "Version control",
      "Testing",
      "Debugging",
    ],
    tools: ["JavaScript/TypeScript", "Python", "Java", "Git", "Docker"],
    learningResource: {
      name: "Learn Python",
      url: "https://www.learnpython.org",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Software+Developer",
    detailsPage: "/career-details?career=Software+Developer",
    outlook: "High demand with diverse opportunities across industries.",
    traits: ["Analytical thinking", "Creativity", "Attention to detail"],
  },
  {
    title: "Data Scientist",
    category: "Data Science",
    description: "Analyze data to uncover insights and drive decisions.",
    matches: [
      "solving_complex",
      "data_insights",
      "data_analysis",
      "ai_ml",
      "predictive",
      "data_viz",
    ],
    skills: ["Statistical analysis", "Machine learning", "Data visualization"],
    tools: ["Python", "R", "SQL", "TensorFlow", "Tableau"],
    learningResource: {
      name: "Coursera Data Science",
      url: "https://www.coursera.org/specializations/data-science",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Data+Scientist",
    detailsPage: "/career-details?career=Data+Scientist",
    outlook: "Growing demand for data-driven decision-making.",
    traits: ["Statistical thinking", "Curiosity", "Communication"],
  },
  {
    title: "Machine Learning Engineer",
    category: "Artificial Intelligence",
    description: "Develop AI systems that learn and adapt from data.",
    matches: [
      "solving_complex",
      "ai_ml",
      "data_analysis",
      "computer_vision",
      "nlp",
      "reinforcement",
      "generative_ai",
    ],
    skills: ["Deep learning", "Feature engineering", "Model optimization"],
    tools: ["Python", "TensorFlow/PyTorch", "Kubernetes"],
    learningResource: {
      name: "Google's ML Crash Course",
      url: "https://developers.google.com/machine-learning/crash-course",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Machine+Learning+Engineer",
    detailsPage: "/career-details?career=Machine+Learning+Engineer",
    outlook: "Rapid growth in AI-driven industries.",
    traits: ["Mathematical thinking", "Experimental mindset"],
  },
  {
    title: "DevOps Engineer",
    category: "Infrastructure & Operations",
    description: "Automate and manage infrastructure for software deployment.",
    matches: [
      "system_design",
      "infrastructure",
      "coding",
      "system_scale",
      "integration",
    ],
    skills: ["CI/CD", "Infrastructure as Code", "Cloud architecture"],
    tools: ["Docker", "Kubernetes", "Terraform", "AWS"],
    learningResource: {
      name: "AWS Training",
      url: "https://aws.amazon.com/training/",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=DevOps+Engineer",
    detailsPage: "/career-details?career=DevOps+Engineer",
    outlook: "Strong demand for cloud and automation expertise.",
    traits: ["Systems thinking", "Process orientation"],
  },
  {
    title: "UX/UI Designer",
    category: "Design & User Experience",
    description: "Create intuitive and engaging user interfaces.",
    matches: [
      "user_experience",
      "designing",
      "user_impact",
      "user_research",
      "ui_design",
      "interaction_design",
    ],
    skills: ["User research", "Wireframing", "Visual design"],
    tools: ["Figma", "Adobe XD", "Sketch"],
    learningResource: {
      name: "Skillshare UX Design",
      url: "https://www.skillshare.com/classes/UX-Design",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=UX+Designer",
    detailsPage: "/career-details?career=UX/UI+Designer",
    outlook: "Increasing importance of user-centric design.",
    traits: ["Empathy", "Creative thinking"],
  },
  {
    title: "Cybersecurity Specialist",
    category: "Security",
    description: "Protect systems and data from cyber threats.",
    matches: ["solving_complex", "security_issues", "cybersecurity"],
    skills: ["Threat detection", "Security protocols", "Risk assessment"],
    tools: ["SIEM tools", "Penetration testing tools"],
    learningResource: {
      name: "Cybrary Cybersecurity",
      url: "https://www.cybrary.it",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Cybersecurity+Specialist",
    detailsPage: "/career-details?career=Cybersecurity+Specialist",
    outlook: "Critical demand due to rising cyber threats.",
    traits: ["Analytical thinking", "Ethical mindset"],
  },
  {
    title: "Data Engineer",
    category: "Data Infrastructure",
    description: "Build and maintain data pipelines and infrastructure.",
    matches: [
      "data_analysis",
      "infrastructure",
      "system_design",
      "data_pipeline",
    ],
    skills: ["Data modeling", "ETL processes", "Database design"],
    tools: ["SQL", "Spark", "Airflow", "Snowflake"],
    learningResource: {
      name: "DataCamp Data Engineering",
      url: "https://www.datacamp.com/tracks/data-engineer",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Data+Engineer",
    detailsPage: "/career-details?career=Data+Engineer",
    outlook: "High demand for scalable data systems.",
    traits: ["Systems thinking", "Reliability focus"],
  },
  {
    title: "Product Manager",
    category: "Product Development",
    description: "Lead product development from ideation to launch.",
    matches: ["building_products", "user_impact", "communicator", "leader"],
    skills: [
      "Market research",
      "Roadmap planning",
      "Cross-functional leadership",
    ],
    tools: ["Jira", "Product analytics"],
    learningResource: {
      name: "LinkedIn Learning Product Management",
      url: "https://www.linkedin.com/learning/topics/product-management",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Product+Manager",
    detailsPage: "/career-details?career=Product+Manager",
    outlook: "Key role with strong career advancement.",
    traits: ["Strategic thinking", "Decision-making"],
  },
  {
    title: "Cloud Architect",
    category: "Cloud Computing",
    description: "Design and manage cloud infrastructure for scalability.",
    matches: ["system_design", "infrastructure", "cloud_edge", "integration"],
    skills: ["Cloud architecture", "Cost optimization", "Security design"],
    tools: ["AWS", "Azure", "Google Cloud", "Terraform"],
    learningResource: {
      name: "Microsoft Azure Training",
      url: "https://learn.microsoft.com/en-us/training/azure/",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Cloud+Architect",
    detailsPage: "/career-details?career=Cloud+Architect",
    outlook: "Rapid growth in cloud adoption.",
    traits: ["Strategic planning", "Technical expertise"],
  },
  {
    title: "Blockchain Developer",
    category: "Web3 & Blockchain",
    description: "Build decentralized applications and smart contracts.",
    matches: ["coding", "blockchain", "solving_complex", "integration"],
    skills: [
      "Smart contract development",
      "Cryptography",
      "Distributed systems",
    ],
    tools: ["Solidity", "Ethereum", "Truffle", "Hardhat"],
    learningResource: {
      name: "Alchemy University",
      url: "https://university.alchemy.com",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Blockchain+Developer",
    detailsPage: "/career-details?career=Blockchain+Developer",
    outlook: "Emerging field with high potential.",
    traits: ["Innovative thinking", "Security focus"],
  },
  {
    title: "AR/VR Developer",
    category: "Immersive Technologies",
    description:
      "Create immersive experiences for augmented and virtual reality.",
    matches: ["coding", "ar_vr", "user_experience", "game"],
    skills: ["3D modeling", "Real-time rendering", "Spatial computing"],
    tools: ["Unity", "Unreal Engine", "Blender"],
    learningResource: { name: "Unity Learn", url: "https://learn.unity.com" },
    jobSearchLink: "https://www.indeed.com/jobs?q=AR+VR+Developer",
    detailsPage: "/career-details?career=AR/VR+Developer",
    outlook: "Growing demand in gaming and enterprise.",
    traits: ["Creative thinking", "Technical precision"],
  },
  {
    title: "Technical Writer",
    category: "Technical Communication",
    description: "Create clear documentation for technical products.",
    matches: ["communicator", "user_impact", "conceptual_learner"],
    skills: ["Technical writing", "Documentation", "User guides"],
    tools: ["Markdown", "Confluence", "Sphinx"],
    learningResource: {
      name: "Write the Docs",
      url: "https://www.writethedocs.org",
    },
    jobSearchLink: "https://www.indeed.com/jobs?q=Technical+Writer",
    detailsPage: "/career-details?career=Technical+Writer",
    outlook: "Steady demand for clear documentation.",
    traits: ["Clarity in communication", "Attention to detail"],
  },
];

// Components
const Navbar = () => (
  <nav className="nav-bar">
    <a href="/landing" className="nav-logo">
      <i className="fas fa-brain"></i>Career AI
    </a>
    <div className="nav-links">
      <a href="/landing">Home</a>
      <a href="/assessment">Assessment</a>
      <a href="/career-details">Careers</a>
      <a href="/auth">Logout</a>
    </div>
  </nav>
);

const OptionCard = ({ option, isSelected, onSelect, multiSelect }) => (
  <div
    className={`option-card ${isSelected ? "selected" : ""}`}
    onClick={() => onSelect(option.id)}
    data-id={option.id}
  >
    <div className="option-title">{option.title}</div>
    <div className="option-description">{option.description}</div>
  </div>
);

const QuestionContainer = ({
  question,
  selectedOptions,
  setSelectedOptions,
  currentIndex,
  totalQuestions,
}) => {
  const handleOptionClick = (optionId) => {
    if (question.multiSelect) {
      setSelectedOptions((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(optionId)) {
          newSet.delete(optionId);
        } else {
          newSet.add(optionId);
        }
        return newSet;
      });
    } else {
      setSelectedOptions(new Set([optionId]));
    }
  };

  return (
    <div className="question-container question-slide-in">
      <div className="question-header">
        <div className="question-number">Question {currentIndex + 1}</div>
        {question.required && <div className="question-required">Required</div>}
      </div>
      <h3>{question.question}</h3>
      <p className="question-description">{question.description}</p>
      <div className="options-container">
        {question.options.map((option) => (
          <OptionCard
            key={option.id}
            option={option}
            isSelected={selectedOptions.has(option.id)}
            onSelect={handleOptionClick}
            multiSelect={question.multiSelect}
          />
        ))}
      </div>
    </div>
  );
};

const CareerCard = ({ career }) => (
  <div className="career-card">
    <div className="career-header">
      <div className="career-title-area">
        <h3>{career.title}</h3>
        <div className="career-category">{career.category}</div>
      </div>
      <div className="match-percentage">
        <div className="percentage-value">{career.matchPercentage || 80}%</div>
        <div className="percentage-label">Match</div>
      </div>
    </div>
    <p>{career.description}</p>
    <div className="career-sections">
      <div className="career-section">
        <div className="section-title">Key Skills</div>
        <div className="career-details">
          {career.skills.map((skill) => (
            <span key={skill} className="detail-item">
              {skill}
            </span>
          ))}
        </div>
      </div>
      <div className="career-section">
        <div className="section-title">Common Tools</div>
        <div className="career-details">
          {career.tools.map((tool) => (
            <span key={tool} className="detail-item">
              {tool}
            </span>
          ))}
        </div>
        <a
          href={career.learningResource.url}
          className="resource-link"
          target="_blank"
        >
          Learn at {career.learningResource.name}
        </a>
      </div>
      <div className="career-section">
        <div className="section-title">Career Outlook</div>
        <p>{career.outlook}</p>
      </div>
    </div>
    <div className="career-actions">
      <button
        className="btn-learn-more"
        onClick={() => (window.location.href = career.detailsPage)}
      >
        Learn More
      </button>
      <button
        className="btn-apply"
        onClick={() =>
          (window.location.href = `/career-dashboard?career=${encodeURIComponent(
            career.title
          )}`)
        }
      >
        Explore Opportunities
      </button>
    </div>
  </div>
);

const ProfileSummary = ({ insights }) => (
  <div className="profile-summary">
    <h2>Your Profile Summary</h2>
    {insights.map((insight, index) => (
      <div key={index} className="summary-item">
        <h4>{insight.area}</h4>
        <p>{insight.insight}</p>
      </div>
    ))}
  </div>
);

// Main App Component
const MapCareer = () => {
  const [userName, setUserName] = useState("Tech Explorer");
  const [assessmentStarted, setAssessmentStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userResponses, setUserResponses] = useState([]);
  const [questionSequence, setQuestionSequence] = useState([...questions]);
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [skippedQuestions, setSkippedQuestions] = useState(new Set());
  const [conditionalQuestionQueue, setConditionalQuestionQueue] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    AOS.init({ duration: 800, once: true });
    const token = localStorage.getItem("token");
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/auth";
      return;
    }

    fetch("http://localhost:5001/api/ver1/user/profile", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Failed to fetch profile");
        }
        return res.json();
      })
      .then((data) => {
        setUserName(data.data.name || "Tech Explorer");
        console.log(
          `Profile fetched: name=${data.data.name}, userId=${data.data._id}`
        );
      })
      .catch((err) => {
        console.error("Profile fetch error:", err.message);
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/auth";
      });
  }, []);

  const startAssessment = () => {
    setAssessmentStarted(true);
    setQuestionSequence([...questions]);
    setCurrentQuestionIndex(0);
    setUserResponses([]);
    setSelectedOptions(new Set());
    setSkippedQuestions(new Set());
    setConditionalQuestionQueue([]);
    setResults(null);
    setError(null);
  };

  const saveCurrentResponses = () => {
    const currentQuestion = questionSequence[currentQuestionIndex];
    const newResponses = [...userResponses];
    newResponses[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedIds: Array.from(selectedOptions),
      skipped: false,
    };
    setUserResponses(newResponses);

    const selectedIds = Array.from(selectedOptions);
    const newQueue = conditionalQuestionQueue.filter((q) =>
      selectedIds.some((id) => q.dependsOn.includes(id))
    );
    selectedIds.forEach((id) => {
      if (
        conditionalQuestions[id] &&
        !questionSequence.some((q) => q.id === conditionalQuestions[id].id) &&
        !newQueue.some((q) => q.id === conditionalQuestions[id].id) &&
        !skippedQuestions.has(conditionalQuestions[id].id)
      ) {
        newQueue.push(conditionalQuestions[id]);
      }
    });
    setConditionalQuestionQueue(newQueue);
  };

  const handleNext = () => {
    const currentQuestion = questionSequence[currentQuestionIndex];
    if (currentQuestion.required && selectedOptions.size === 0) {
      setError("Please select at least one option to continue.");
      return;
    }
    setError(null);
    saveCurrentResponses();
    if (currentQuestionIndex === questionSequence.length - 1) {
      if (conditionalQuestionQueue.length > 0) {
        const nextConditional = conditionalQuestionQueue[0];
        setQuestionSequence([...questionSequence, nextConditional]);
        setUserResponses([...userResponses, null]);
        setConditionalQuestionQueue(conditionalQuestionQueue.slice(1));
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOptions(new Set());
      } else {
        submitAssessment();
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptions(
        new Set(userResponses[currentQuestionIndex + 1]?.selectedIds || [])
      );
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      saveCurrentResponses();
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOptions(
        new Set(userResponses[currentQuestionIndex - 1]?.selectedIds || [])
      );
      setError(null);
    }
  };

  const handleSkip = () => {
    const currentQuestion = questionSequence[currentQuestionIndex];
    if (currentQuestion.required) {
      setError("This question is required and cannot be skipped.");
      return;
    }
    setError(null);
    const newResponses = [...userResponses];
    newResponses[currentQuestionIndex] = {
      questionId: currentQuestion.id,
      selectedIds: [],
      skipped: true,
    };
    setUserResponses(newResponses);
    setSkippedQuestions(new Set([...skippedQuestions, currentQuestion.id]));
    if (currentQuestionIndex === questionSequence.length - 1) {
      if (conditionalQuestionQueue.length > 0) {
        const nextConditional = conditionalQuestionQueue[0];
        setQuestionSequence([...questionSequence, nextConditional]);
        setUserResponses([...userResponses, null]);
        setConditionalQuestionQueue(conditionalQuestionQueue.slice(1));
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOptions(new Set());
      } else {
        submitAssessment();
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOptions(
        new Set(userResponses[currentQuestionIndex + 1]?.selectedIds || [])
      );
    }
  };

  const submitAssessment = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      window.location.href = "/auth";
      return;
    }
    try {
      const response = await fetch(
        "http://localhost:5001/api/ver1/user/submit-assessment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ responses: userResponses }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to submit assessment");
      }
      localStorage.setItem("assessmentTaken", "true");
      setResults(data.data.recommendations);
      setAssessmentStarted(false);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
      if (
        error.message.includes("No token provided") ||
        error.message.includes("Invalid token")
      ) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        window.location.href = "/auth";
      }
    }
  };

  const generateProfileSummary = (responses) => {
    const allSelectedIds = responses
      .filter((r) => r && !r.skipped)
      .flatMap((r) => r.selectedIds);
    const idCounts = {};
    allSelectedIds.forEach((id) => (idCounts[id] = (idCounts[id] || 0) + 1));
    const sortedIds = Object.keys(idCounts).sort(
      (a, b) => idCounts[b] - idCounts[a]
    );
    const insightMap = {
      solving_complex: {
        area: "Problem-Solving",
        insight: "You thrive on tackling complex technical challenges.",
      },
      building_products: {
        area: "Career Focus",
        insight: "You're driven to create impactful products.",
      },
      data_insights: {
        area: "Analytical Strengths",
        insight: "You excel at uncovering data-driven insights.",
      },
      user_experience: {
        area: "Design Orientation",
        insight: "You prioritize intuitive user experiences.",
      },
      coding: {
        area: "Technical Skills",
        insight: "You enjoy programming and building solutions.",
      },
      data_analysis: {
        area: "Data Orientation",
        insight: "You're skilled at analyzing datasets.",
      },
      infrastructure: {
        area: "System Orientation",
        insight: "You focus on building robust systems.",
      },
      independent: {
        area: "Work Style",
        insight: "You prefer independent problem-solving.",
      },
      team_player: {
        area: "Collaboration Style",
        insight: "You thrive in collaborative teams.",
      },
      leader: {
        area: "Leadership",
        insight: "You enjoy leading projects and teams.",
      },
      deep_specialist: {
        area: "Learning Approach",
        insight: "You aim to master specific technologies.",
      },
      versatile_generalist: {
        area: "Learning Approach",
        insight: "You value broad technical knowledge.",
      },
      practical_builder: {
        area: "Learning Style",
        insight: "You learn best through hands-on projects.",
      },
      ai_ml: {
        area: "Technology Interests",
        insight: "You're passionate about AI and machine learning.",
      },
      cloud_edge: {
        area: "Infrastructure Interest",
        insight: "You're drawn to cloud technologies.",
      },
      cybersecurity: {
        area: "Security Focus",
        insight: "You prioritize system security.",
      },
    };
    const insights = [];
    const environments = [
      "startup",
      "enterprise",
      "agency",
      "remote",
      "research",
    ];
    const selectedEnvironments = environments.filter((env) =>
      allSelectedIds.includes(env)
    );
    if (selectedEnvironments.length > 0) {
      const envMap = {
        startup: "fast-paced startups",
        enterprise: "established enterprises",
        agency: "creative agencies",
        remote: "remote-first organizations",
        research: "research-focused environments",
      };
      insights.push({
        area: "Work Environment",
        insight: `You prefer ${selectedEnvironments
          .map((env) => envMap[env])
          .join(" and ")}.`,
      });
    }
    for (const id of sortedIds.slice(0, 5)) {
      if (
        insightMap[id] &&
        !insights.some((i) => i.area === insightMap[id].area)
      ) {
        insights.push(insightMap[id]);
      }
    }
    const satisfactionValues = [
      "problem_solving",
      "user_impact",
      "innovation",
      "stability",
      "growth",
      "autonomy",
    ];
    const selectedValues = satisfactionValues.filter((val) =>
      allSelectedIds.includes(val)
    );
    if (selectedValues.length > 0) {
      const valueMap = {
        problem_solving: "intellectual challenge",
        user_impact: "user impact",
        innovation: "innovation",
        stability: "stability",
        growth: "continuous learning",
        autonomy: "autonomy",
      };
      insights.push({
        area: "Motivation",
        insight: `You're motivated by ${selectedValues
          .map((val) => valueMap[val])
          .join(" and ")}.`,
      });
    }
    return insights;
  };

  const totalQuestions =
    questionSequence.length + conditionalQuestionQueue.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

  return (
    <div>
      <Navbar />
      <div className="container">
        {loading && (
          <div className="loader show">
            <div className="spinner"></div>
          </div>
        )}
        <header data-aos="fade-down">
          <h1>Discover Your Tech Career Path</h1>
          <p className="user-greeting">
            Hello, {userName}! Let's find your perfect career path.
          </p>
        </header>
        {!assessmentStarted && !results && (
          <button
            className="start-button"
            onClick={startAssessment}
            data-aos="zoom-in"
          >
            Start Assessment
          </button>
        )}
        {assessmentStarted && (
          <div className="assessment-box" data-aos="fade-up">
            <div className="progress-container">
              <div className="progress-text">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </div>
              <div className="progress-bar">
                <div
                  className="progress"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="progress-percentage">{Math.round(progress)}%</div>
            </div>
            <QuestionContainer
              question={questionSequence[currentQuestionIndex]}
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              currentIndex={currentQuestionIndex}
              totalQuestions={totalQuestions}
            />
            {error && <div className="error-message">{error}</div>}
            <div className="action-buttons">
              <button
                className="btn btn-back"
                style={{ display: currentQuestionIndex > 0 ? "block" : "none" }}
                onClick={handleBack}
              >
                Back
              </button>
              <button className="btn btn-skip" onClick={handleSkip}>
                Skip
              </button>
              <button
                className={`btn ${
                  currentQuestionIndex === questionSequence.length - 1 &&
                  conditionalQuestionQueue.length === 0
                    ? "btn-submit"
                    : "btn-next"
                }`}
                onClick={handleNext}
              >
                {currentQuestionIndex === questionSequence.length - 1 &&
                conditionalQuestionQueue.length === 0
                  ? "Submit"
                  : "Continue"}
              </button>
            </div>
          </div>
        )}
        {results && (
          <div className="results-container" data-aos="fade-up">
            <div className="results-header">
              <h2>Your Career Recommendations</h2>
            </div>
            {results.map((career) => (
              <CareerCard key={career.title} career={career} />
            ))}
            <ProfileSummary insights={generateProfileSummary(userResponses)} />
            <div className="results-actions">
              <button className="btn-retake" onClick={startAssessment}>
                Retake Assessment
              </button>
              <button
                className="btn-schedule"
                onClick={() => (window.location.href = "/landing")}
              >
                Schedule a Consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapCareer;
