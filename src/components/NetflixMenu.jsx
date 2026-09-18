import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, ArrowLeft, Bell, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './NetflixMenu.css';

const NetflixMenu = ({ projects, onProjectClick }) => {
  const [featured, setFeatured] = useState(projects[0]);
  const navigate = useNavigate();

  const heroStyle = {
    backgroundColor: featured?.color || '#333',
    backgroundImage: featured?.demoUrl && featured.demoUrl !== '#' 
      ? `linear-gradient(to top, #141414, transparent), linear-gradient(to right, rgba(0,0,0,0.8), transparent), url(${featured.demoUrl})`
      : `linear-gradient(to top, #141414, transparent), linear-gradient(to right, rgba(0,0,0,0.8), transparent)`
  };

  return (
    <div className="netflix-container">
      {/* Navbar */}
      <header className="netflix-header">
        <div className="netflix-logo">PORTFOLIO</div>
        <nav className="netflix-nav">
          <ul>
            <li className="active">Accueil</li>
            <li>Séries</li>
            <li>Films</li>
            <li>Nouveautés</li>
            <li>Ma liste</li>
          </ul>
        </nav>
        <div className="netflix-actions">
          <Search size={20} />
          <Bell size={20} />
          <div className="netflix-profile"></div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="netflix-hero" style={heroStyle}>
        <div className="netflix-hero-vignette"></div>
        <div className="netflix-hero-content">
          <h1 className="netflix-hero-title">{featured?.title}</h1>
          <p className="netflix-hero-desc">{featured?.description}</p>
          <div className="netflix-hero-buttons">
            <button className="netflix-btn netflix-btn-play" onClick={() => onProjectClick(featured.id)}>
              <Play fill="currentColor" size={24} />
              Lecture
            </button>
            <button className="netflix-btn netflix-btn-info" onClick={() => onProjectClick(featured.id)}>
              <Info size={24} />
              Plus d'infos
            </button>
          </div>
        </div>
      </div>

      {/* Row Section */}
      <div className="netflix-row-container">
        <h2 className="netflix-row-title">Projets Récents</h2>
        <div className="netflix-row">
          {projects.map((project) => (
            <motion.div 
              key={project.id} 
              className={`netflix-card ${featured?.id === project.id ? 'active' : ''}`}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              onClick={() => setFeatured(project)}
            >
              <div 
                className="netflix-card-bg"
                style={{ 
                  backgroundColor: project.color || '#333',
                  backgroundImage: project.demoUrl && project.demoUrl !== '#' ? `url(${project.demoUrl})` : 'none'
                }}
              >
                {!(project.demoUrl && project.demoUrl !== '#') && (
                   <span className="netflix-card-number">{project.roomNumber}</span>
                )}
              </div>
              <div className="netflix-card-info">
                <h3>{project.title}</h3>
                <p>{project.date}</p>
              </div>
            </motion.div>
          ))}
          
          {/* Back to Overlook Card */}
          <motion.div 
            className="netflix-card netflix-card-back"
            whileHover={{ scale: 1.05, zIndex: 10 }}
            onClick={() => navigate('/')}
          >
            <div className="netflix-card-bg">
              <ArrowLeft size={48} />
            </div>
            <div className="netflix-card-info">
              <h3>Retourner à l'Overlook</h3>
              <p>Quitter le mode rapide</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default NetflixMenu;
