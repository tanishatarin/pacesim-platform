import { Heart, Code, Users, Stethoscope, Zap, Award } from "lucide-react";

const AboutPage = () => {
  const features = [
    {
      icon: <Stethoscope className="w-6 h-6" />,
      title: "Real-time ECG Simulation",
      description:
        "Interactive ECG visualization that responds live to pacemaker adjustments, enabling real-time feedback.",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Hardware + Web Integration",
      description:
        "Physical pacemaker device connects via WebSocket to the PaceSim site for hands-on training.",
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Scenario-Based Quiz & Feedback",
      description:
        "Each module features a quiz and interactive feedback loop based on clinical scenarios.",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Scoring & Progress Tracking",
      description:
        "Users receive scores and performance summaries for skill improvement and evaluation.",
    },
  ];

  const teamMembers = [
    {
      name: "Tanisha Tarin",
      role: "Software Lead",
      description:
        "Led frontend/backend development of training simulator and hardware/software integration. Built both versions of the website and maintained long-term development beyond initial timeline.",
      image: "/tanisha_tarin_headshot.jpeg"
    },
    {
      name: "Kevin Toralez",
      role: "Hardware & Electrical Lead",
      description:
        "Designed, wired, and debugged the full external pacemaker hardware system including circuit design, testing, and communication.",
      image: "/kevin_toralez_headshot.jpeg"
    },
    {
      name: "Katie Liang",
      role: "UX Research & Team Liaison",
      description:
        "Led user research sessions with nurses, synthesized feedback for design updates, and coordinated clinical testing logistics.",
      image: "/katie_liang_headshot.jpeg"
    },
    {
      name: "Claire Cui",
      role: "Software Engineer",
      description:
        "Created the first version of the simulator training modules and contributed to system architecture design.",
      image: "/claire_cui_headshot.jpeg"
    },
    {
      name: "Ryan Alezz",
      role: "CAD Designer",
      description:
        "Created CAD prototypes for hardware housing including screen/buttons, contributed to physical iterations.",
      image: "/ryan_alezz_headshot.jpeg"
    },
    {
      name: "Nusaybah Abu-Mulaweh",
      role: "Faculty Advisor",
      description:
        "Provided guidance throughout the full development cycle—from requirements gathering to deployment.",
      image: "/nusaybah_headshot.jpeg"
    },
    {
      name: "Alissa Burkholder Murphy",
      role: "Faculty Advisor",
      description:
        "Advised on participatory design, user testing, and iterative feedback across the Spring 2025 semester.",
      image: "Alisa_B_Murphy_headshot.jpeg"
    },
    {
      name: "Dauryne Shaffer",
      role: "Clinical Partner (JHH)",
      description:
        "Brought forward the clinical need for this tool, guided design priorities, and provided access to nurse testers and materials.",
      image: "/Dauryne_headshot.jpeg" 
    },
    {
      name: "Pamela Moss",
      role: "Clinical Partner (JHH)",
      description:
        "Brought forward the clinical need for this tool, guided design priorities, and provided access to nurse testers and materials.",
      image: "/pamela_moss_headshot.png"
    },
    {
      name: "Greg Wulffen",
      role: "Teaching Assistant",
      description:
        "Supported technical development and prototyping with recurring feedback during implementation.",
      image: "/greg_headshot.jpeg"
    }
  ];

  const techStack = [
    { name: "React", description: "Frontend Framework" },
    { name: "TypeScript", description: "Type Safety" },
    { name: "Tailwind CSS", description: "Styling" },
    { name: "WebSocket", description: "Real-time Communication" },
    { name: "Arduino", description: "Hardware Control" },
    { name: "Node.js", description: "Backend Server" }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="w-full px-8 py-6 bg-white shadow-lg rounded-3xl mb-6">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 mr-3 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">About PaceSim</h1>
          </div>
          <p className="text-gray-700 leading-relaxed max-w-4xl mx-auto">
            PaceSim is an innovative training platform that combines physical
            hardware simulation with interactive web-based learning. Designed for
            healthcare professionals, our system provides hands-on experience with
            external pacemaker operation in a safe, controlled environment. We
            bridge the gap between theoretical instruction and clinical readiness.
          </p>
        </div>
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
                  <h4 className="font-bold text-gray-900 mb-1">
                    {feature.title}
                  </h4>
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
          <h3 className="text-lg font-bold text-gray-900 mb-3">
            Special Thanks
          </h3>
          <p className="text-gray-700 leading-relaxed">
            Our deepest thanks to the ICU, CVPCU, and CBIC nursing staff at
            Johns Hopkins Hospital. Their insights, feedback, and commitment to
            excellence in patient care made this project possible.
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
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900">{member.name}</h4>
                  <p className="text-sm text-blue-600 font-medium">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {member.description}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0">
                  <img 
                    src={member.image} 
                    alt={`${member.name} headshot`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
                    onError={(e) => {
                      // Fallback to gray circle if image fails to load
                      e.currentTarget.style.display = 'none';
                      // e.currentTarget.nextElementSibling.style.display = 'flex';
                    }}
                  />
                  <div 
                    className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-medium text-lg hidden"
                    style={{display: 'none'}}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
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
            <div
              key={index}
              className="bg-[#F0F6FE] rounded-xl p-4 text-center"
            >
              <p className="font-bold text-gray-900 text-sm">{tech.name}</p>
              <p className="text-xs text-gray-600 mt-1">{tech.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Design Resources */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          View full{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Design Report
          </a>{" "}
          and{" "}
          <a href="#" className="text-blue-600 hover:underline">
            Project Poster
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default AboutPage;