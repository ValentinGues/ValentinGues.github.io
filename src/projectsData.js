import projectsText from './projects.txt?raw';

// Couleurs par défaut pour les projets
const defaultColors = [
  "#87ceeb", "#b026ff", "#ff8c00", "#00ff00", 
  "#00ffcc", "#ffcc00", "#ff00ff", "#0000ff"
];

// Numéros de chambre arbitraires pour les portes
const roomNumbers = ["10", "808", "112", "8", "404", "237", "42", "777"];

function parseProjectsData(text) {
  const projects = [];
  
  // Séparer le texte par blocs vides
  const blocks = text.trim().split(/\n\s*\n/);
  
  blocks.forEach((block, index) => {
    const lines = block.split('\n');
    let title = "Projet " + (index + 1);
    let description = "";
    let demoUrl = "/placeholder.jpg";
    
    lines.forEach(line => {
      const cleanLine = line.trim();
      if (cleanLine.startsWith('NOM:')) {
        title = cleanLine.substring(4).trim();
      } else if (cleanLine.startsWith('DESCRIPTION:')) {
        description = cleanLine.substring(12).trim();
      } else if (cleanLine.startsWith('IMAGE:')) {
        demoUrl = cleanLine.substring(6).trim();
      }
    });

    projects.push({
      id: index + 1,
      roomNumber: roomNumbers[index % roomNumbers.length],
      date: "2026", // Date par défaut
      title: title,
      description: description,
      tech: [], // On peut laisser vide ou ajouter si besoin dans le futur
      demoUrl: demoUrl,
      color: defaultColors[index % defaultColors.length]
    });
  });

  return projects;
}

// Générer les projets normaux à partir du fichier texte
const parsedProjects = parseProjectsData(projectsText);

// Ajouter la porte de contact obligatoire à la fin
export const projectsData = [
  ...parsedProjects,
  {
    id: 999,
    roomNumber: "CV",
    date: "Contact",
    title: "Mon Parcours & Contact",
    description: "Retrouvez mon CV détaillé et n'hésitez pas à me contacter pour échanger sur de futures opportunités.",
    tech: ["LinkedIn", "GitHub", "Email"],
    demoUrl: "/contact_demo.jpg",
    color: "#aa0000",
    isContact: true
  }
];
