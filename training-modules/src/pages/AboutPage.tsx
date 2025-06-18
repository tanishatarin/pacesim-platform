import { 
  Heart, 
  Code, 
  Users, 
  Stethoscope, 
  Zap, 
  Award,
} from 'lucide-react';

const AboutPage = () => {
  const features = [
    {
      icon: <Stethoscope className="w-6 h-6" />, title: "Real-time ECG Simulation",
      description: "Interactive ECG visualization that responds live to pacemaker adjustments, enabling real-time feedback."
    },
    {
      icon: <Zap className="w-6 h-6" />, title: "Hardware + Web Integration",
      description: "Physical pacemaker device connects via WebSocket to the PaceSim site for hands-on training."
    },
    {
      icon: <Award className="w-6 h-6" />, title: "Scenario-Based Quiz & Feedback",
      description: "Each module features a quiz and interactive feedback loop based on clinical scenarios."
    },
    {
      icon: <Users className="w-6 h-6" />, title: "Scoring & Progress Tracking",
      description: "Users receive scores and performance summaries for skill improvement and evaluation."
    }
  ];

  const teamMembers = [
    { name: "Tanisha Tarin", role: "Software Lead", description: "Led frontend/backend development of training simulator and hardware/software integration. Built both versions of the website and maintained long-term development beyond initial timeline." },
    { name: "Kevin Toralez", role: "Hardware & Electrical Lead", description: "Designed, wired, and debugged the full external pacemaker hardware system including circuit design, testing, and communication." },
    { name: "Katie Liang", role: "UX Research & Team Liaison", description: "Led user research sessions with nurses, synthesized feedback for design updates, and coordinated clinical testing logistics." },
    { name: "Claire Cui", role: "Software Engineer", description: "Created the first version of the simulator training modules and contributed to system architecture design." },
    { name: "Ryan Alezz", role: "CAD Designer", description: "Created CAD prototypes for hardware housing including screen/buttons, contributed to physical iterations." },
    { name: "Dauryne Shaffer & Pamela Moss", role: "Clinical Partners (JHH)", description: "Brought forward the clinical need for this tool, guided design priorities, and provided access to nurse testers and materials." },
    { name: "Dr. Nusaybah Abu-Mulaweh", role: "Faculty Advisor", description: "Provided guidance throughout the full development cycle—from requirements gathering to deployment." },
    { name: "Alissa Burkholder Murphy", role: "Faculty Advisor", description: "Advised on participatory design, user testing, and iterative feedback across the Spring 2025 semester." },
    { name: "Greg Wulffen", role: "Teaching Assistant", description: "Supported technical development and prototyping with recurring feedback during implementation." }
  ];

  const techStack = [
    { name: "React 18", description: "Modern UI framework" },
    { name: "TypeScript", description: "Type-safe development" },
    { name: "Tailwind CSS", description: "Utility-first responsive styling" },
    { name: "WebSocket", description: "Real-time communication with pacemaker" },
    { name: "SQLite", description: "Local data storage & offline support" },
    { name: "Raspberry Pi + Arduino", description: "Hardware prototyping & integration" }
  ];

  return (
    <div className="pb-16">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-black">About PaceSim</h1>
        <p className="text-xl text-gray-900">External Pacemaker Simulation Platform</p>
        <p className="text-sm text-gray-600 mt-1">This project was created as part of the Multidisciplinary Engineering Design course at Johns Hopkins University during the 2024–2025 academic year in partnership with Johns Hopkins Hospital.</p>
      </div>

      {/* Mission */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <div className="flex items-center mb-4">
          <Heart className="w-6 h-6 mr-3 text-red-500" />
          <h3 className="text-lg font-bold text-gray-900">Our Mission</h3>
        </div>
        <p className="text-gray-700 leading-relaxed">
          PaceSim empowers nursing professionals to develop real-world proficiency in external pacemaker usage
          through scenario-based simulation, interactive feedback, and hands-on device integration. We bridge the
          gap between theoretical instruction and clinical readiness.
        </p>
      </div>

      {/* Features */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <div className="flex items-center mb-6">
          <Zap className="w-6 h-6 mr-3 text-blue-600" />
          <h3 className="text-lg font-bold text-gray-900">Key Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="bg-[#F0F6FE] rounded-xl p-4">
              <div className="flex items-start space-x-3">
                <div className="text-blue-600 mt-1">{feature.icon}</div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acknowledgments */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Special Thanks</h3>
          <p className="text-gray-700 leading-relaxed">
            Our deepest thanks to the ICU, CVPCU, and CBIC nursing staff at Johns Hopkins Hospital. Their
            insights, feedback, and commitment to excellence in patient care made this project possible.
          </p>
        </div>
      </div>

      {/* Team & Credits */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <div className="flex items-center mb-6">
          <Users className="w-6 h-6 mr-3 text-purple-600" />
          <h3 className="text-lg font-bold text-gray-900">Team & Credits</h3>
        </div>
        <div className="space-y-4">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-[#F0F6FE] rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-blue-600 font-medium">{member.role}</p>
                  <p className="text-sm text-gray-600 mt-1">{member.description}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-gray-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <div className="flex items-center mb-6">
          <Code className="w-6 h-6 mr-3 text-green-600" />
          <h3 className="text-lg font-bold text-gray-900">Technology Stack</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {techStack.map((tech, index) => (
            <div key={index} className="bg-[#F0F6FE] rounded-xl p-4 text-center">
              <p className="font-bold text-gray-900 text-sm">{tech.name}</p>
              <p className="text-xs text-gray-600 mt-1">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Design Resources */}
      <div className="text-center">
        <p className="text-sm text-gray-600">View full <a href="#" className="text-blue-600 hover:underline">Design Report</a> and <a href="#" className="text-blue-600 hover:underline">Project Poster</a>.</p>
      </div>
    </div>
  );
};

export default AboutPage;
