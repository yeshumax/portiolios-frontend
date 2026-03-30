import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import { motion } from 'framer-motion';
import api from '../api/axios';
import aboutImage from '../assets/yeshumax.png';
import { SkillSkeleton, ProjectSkeleton } from '../components/Skeleton';

interface Project {
  _id: string;
  title: string;
  description: string;
  techStack: string[];
  image: string;
  type: string;
}

interface Skill {
  _id: string;
  name: string;
  level: number;
  category: string;
  years: number;
  color: string;
}

const Home: React.FC = () => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Get API base URL from environment or use default
  const API_BASE_URL = process.env.REACT_APP_API_URL ||  
                       (process.env.NODE_ENV === 'production' 
                         ? 'https://portifolio-backend-1-nmzl.onrender.com/' // Replace with your actual backend URL
                         : 'http://localhost:5000');

  useEffect(() => {
    const fetchData = async () => {
      console.log('Home component: Starting data fetch...');
      try {
        // Fetch projects
        console.log('Home component: Fetching projects...');
        const projectsResponse = await api.get('/projects');
        console.log('Home component: Projects received:', projectsResponse.data);
        setProjects(projectsResponse.data.slice(-2).reverse());

        // Fetch skills
        console.log('Home component: Fetching skills...');
        const skillsResponse = await api.get('/skills');
        console.log('Home component: Skills received:', skillsResponse.data);
        setSkills(skillsResponse.data.slice(0, 3)); // Show only first 3 skills
      } catch (error) {
        console.error('Home component: Failed to fetch data', error);
      } finally {
        console.log('Home component: Setting loading to false');
        setLoading(false);
        setSkillsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fixed getImageUrl function to use environment variable
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://via.placeholder.com/600x400';
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove leading slash if present to avoid double slashes
    const normalizedPath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath;
    
    // Use API_BASE_URL instead of hardcoded localhost
    return `${API_BASE_URL}/uploads/${normalizedPath}`;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <Hero />

      {/* About Section */}
      <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="rounded-2xl overflow-hidden shadow-xl">
              <img src={aboutImage} alt="About me" className="w-full h-[420px] object-cover object-top" />
            </div>
            <motion.div 
              initial={{ opacity: 0, x: 30 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">About Me</h2>
              <p className="text-sm uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold">
                I build modern, accessible apps with user-first design.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                With over 5 years of experience in web development, I specialize in creating responsive, 
                user-friendly applications using modern web technologies. I'm passionate about clean code, 
                scalable architecture, and user-centered design.
              </p>
              <Link 
                to="/about" 
                className="inline-block px-6 py-3 rounded-full text-blue-600 dark:text-blue-400 font-semibold border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors duration-300"
              >
                Learn More About Me
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Skills Preview */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">My Skills</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">A quick look at my technical expertise</p>
          </div>
          
          {/* Loading State */}
          {skillsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, index) => (
                <SkillSkeleton key={index} />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="text-center py-10 text-gray-500 dark:text-gray-400">
              No skills to display yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {skills.map((skill, index) => (
                <motion.div 
                  key={skill._id} 
                  initial={{ opacity: 0, y: 30 }} 
                  whileInView={{ opacity: 1, y: 0 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition duration-300">
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-gray-800 dark:text-gray-200">{skill.name}</span>
                      <span className="text-blue-600 dark:text-blue-400 font-medium">{skill.level}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div className={`${skill.color} h-2.5 rounded-full`} style={{ width: `${skill.level}%` }}></div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link 
              to="/skills" 
              className="inline-block px-8 py-3 rounded-full text-white bg-blue-600 hover:bg-blue-700 font-medium shadow-md transition-colors duration-300"
            >
              See All Skills
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section className="py-20 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Featured Projects</h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">Some of my recent work</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {loading ? (
              [...Array(2)].map((_, index) => (
                <ProjectSkeleton key={index} />
              ))
            ) : projects.length === 0 ? (
              <div className="col-span-2 text-center py-10 text-gray-500 dark:text-gray-400">
                No projects to display yet.
              </div>
            ) : (
              projects.map((item, index) => (
                <motion.div 
                  key={item._id} 
                  initial={{ opacity: 0, scale: 0.95 }} 
                  whileInView={{ opacity: 1, scale: 1 }} 
                  viewport={{ once: true }} 
                  transition={{ delay: index * 0.1 }} 
                  className="group"
                >
                  <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition duration-300 border border-gray-200 dark:border-gray-700">
                    <div className="relative h-64 overflow-hidden">
                      <img 
                        src={getImageUrl(item.image)} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                        <Link 
                          to="/projects" 
                          className="px-6 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-full font-bold transform -translate-y-4 group-hover:translate-y-0 transition duration-300"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                    <div className="p-8">
                      <span className="text-xs font-semibold tracking-wide uppercase text-blue-600 dark:text-blue-400 mb-2 block">
                        {item.type}
                      </span>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">{item.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/projects" 
              className="inline-block px-8 py-3 rounded-full text-blue-600 dark:text-blue-400 font-semibold border-2 border-blue-600 dark:border-blue-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-colors duration-300"
            >
              View All Projects
            </Link>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl font-extrabold text-white mb-6">Let's Work Together</h2>
          <p className="text-xl text-blue-100 mb-10">
            Have a project in mind? I'd love to hear about it. Let's create something amazing together!
          </p>
          <Link 
            to="/contact" 
            className="inline-block px-10 py-4 rounded-full text-blue-600 dark:text-white bg-white dark:bg-gray-800 font-bold hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-xl transition transform hover:-translate-y-1"
          >
            Get In Touch
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;