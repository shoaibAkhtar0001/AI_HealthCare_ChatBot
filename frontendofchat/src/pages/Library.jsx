import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Activity, Heart, Thermometer, Brain, Apple, Dumbbell, Moon, Shield, Stethoscope } from 'lucide-react';

const iconMap = {
  'Activity': Activity,
  'Heart': Heart,
  'Thermometer': Thermometer,
  'Brain': Brain,
  'Apple': Apple,
  'Dumbbell': Dumbbell,
  'Moon': Moon,
  'Shield': Shield,
  'Stethoscope': Stethoscope
};

const Library = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // We'll hydrate the library with predefined topics for a richer UI if the API is empty
    const defaultTopics = [
      {
        id: 1,
        title: "Managing Hypertension",
        description: "Learn effective strategies for maintaining healthy blood pressure through lifestyle changes and medication.",
        category: "Cardiovascular",
        icon_name: "Heart"
      },
      {
        id: 2,
        title: "Understanding Diabetes",
        description: "A comprehensive guide to recognizing symptoms, managing blood sugar levels, and living a full life with diabetes.",
        category: "Chronic",
        icon_name: "Activity"
      },
      {
        id: 3,
        title: "Mental Wellness & Stress",
        description: "Discover mindfulness techniques, therapeutic approaches, and daily habits to improve your cognitive health.",
        category: "Mental",
        icon_name: "Brain"
      },
      {
        id: 4,
        title: "Nutrition Essentials",
        description: "Explore the building blocks of a balanced diet, understanding macros, and heart-healthy eating habits.",
        category: "Nutrition",
        icon_name: "Apple"
      },
      {
        id: 5,
        title: "Fever & Common Colds",
        description: "When to rest, when to see a doctor, and how to effectively treat common viral symptoms at home.",
        category: "General",
        icon_name: "Thermometer"
      },
      {
        id: 6,
        title: "Fitness & Mobility",
        description: "Safe exercise routines for all ages, improving joint flexibility, and building cardiovascular endurance.",
        category: "Fitness",
        icon_name: "Dumbbell"
      },
      {
        id: 7,
        title: "Sleep Hygiene & Recovery",
        description: "Learn the importance of restorative sleep and habits to improve your sleep quality for better overall physical and mental health.",
        category: "Mental",
        icon_name: "Moon"
      },
      {
        id: 8,
        title: "Managing Allergies",
        description: "Identify common seasonal and food allergies, understand trigger symptoms, and discover effective medical and natural ways to find relief.",
        category: "Chronic",
        icon_name: "Thermometer"
      },
      {
        id: 9,
        title: "Preventive Health Care",
        description: "Stay ahead of major health issues with regular screenings, necessary vaccinations, and proactive lifestyle choices to protect your future.",
        category: "General",
        icon_name: "Shield"
      }
    ];

    const fetchLibrary = async () => {
      try {
        const response = await fetch('https://ai-healthcare-chatbot-0t17.onrender.com/api/library/');
        if (response.ok) {
          const data = await response.json();
          // Use API data if it has more than the 2 default DB records, otherwise use our rich defaults
          if (data.topics && data.topics.length > 2) {
             setTopics(data.topics);
          } else {
             setTopics(defaultTopics);
          }
        } else {
          setTopics(defaultTopics);
        }
      } catch (error) {
        console.error("Failed to fetch library topics:", error);
        setTopics(defaultTopics);
      } finally {
        setLoading(false);
      }
    };
    fetchLibrary();
  }, []);

  const getColorClass = (category) => {
    switch (category.toLowerCase()) {
      case 'chronic': return 'bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white';
      case 'cardiovascular': return 'bg-rose-100 text-rose-600 group-hover:bg-rose-600 group-hover:text-white';
      case 'general': return 'bg-amber-100 text-amber-600 group-hover:bg-amber-500 group-hover:text-white';
      case 'mental': return 'bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white';
      case 'nutrition': return 'bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white';
      case 'fitness': return 'bg-orange-100 text-orange-600 group-hover:bg-orange-600 group-hover:text-white';
      default: return 'bg-indigo-100 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white';
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 font-medium text-lg">Loading Library...</div>;
  }

  return (
    <div className="flex-grow flex flex-col items-center p-4 sm:p-8 bg-slate-50 relative overflow-hidden min-h-[calc(100vh-100px)]">
      {/* Background decorative blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[10%] w-96 h-96 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-[20%] left-[-10%] w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] right-[20%] w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div 
        className="bg-white p-6 sm:p-10 rounded-3xl shadow-2xl max-w-6xl w-full relative z-10 border border-slate-100 mt-8 mb-12 flex-grow flex flex-col"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <div className="mb-8">
          <Link to="/chat" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors mb-6">
            <ArrowLeft size={16} className="mr-1" /> Back to Chat
          </Link>
          <div className="border-b border-slate-100 pb-6 max-w-3xl">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3 tracking-tight">Health Library</h2>
            <p className="text-slate-500 text-lg">Explore our collection of educational medical knowledge and health resources.</p>
          </div>
        </div>

        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic, index) => {
            const IconComponent = iconMap[topic.icon_name] || Activity;
            const colorClass = getColorClass(topic.category);
            
            return (
              <motion.div 
                key={topic.id}
                onClick={() => navigate('/chat', { state: { initialQuery: `Could you explain ${topic.title} in detail?` } })}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-300 group flex flex-col h-full cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${colorClass}`}>
                  <IconComponent size={24} />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-3 group-hover:text-indigo-700 transition-colors">{topic.title}</h3>
                <p className="text-slate-500 text-[15px] mb-8 leading-relaxed flex-grow">
                  {topic.description}
                </p>

                <div className="mt-auto flex items-center text-indigo-600 font-semibold text-sm group-hover:text-indigo-700 transition-colors">
                  Learn More
                  <ArrowRight size={16} className="ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default Library;

