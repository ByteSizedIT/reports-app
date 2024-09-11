export const logo = (
  schoolName: string
) => `<svg style="width: 100px; height: auto;" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg">

  <!-- Gradients -->
  <defs>
    <linearGradient id="buildingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#4a5d81;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#2c3e50;stop-opacity:1" />
    </linearGradient>
    <linearGradient id="roofGradient" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#6c8bbf;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#3a4a69;stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- School Building -->
  <rect x="50" y="120" width="200" height="120" fill="url(#buildingGradient)" stroke="#000000" stroke-width="2"/>
  
  <!-- Roof -->
  <polygon points="50,120 250,120 150,60" fill="url(#roofGradient)" stroke="#000000" stroke-width="2"/>
  
  <!-- Windows -->
  <rect x="80" y="140" width="40" height="40" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  <rect x="180" y="140" width="40" height="40" fill="#ffffff" stroke="#000000" stroke-width="2"/>
  
  <!-- Door -->
  <rect x="130" y="180" width="40" height="60" fill="#d1a14d" stroke="#000000" stroke-width="2"/>
  
  <!-- Columns -->
  <rect x="60" y="120" width="10" height="60" fill="#d0d0d0" stroke="#000000" stroke-width="2"/>
  <rect x="230" y="120" width="10" height="60" fill="#d0d0d0" stroke="#000000" stroke-width="2"/>
  
  <!-- School Name -->
  <text x="150" y="270" font-family="Montserrat, sans-serif" font-size="24" text-anchor="middle" fill="#2c3e50" font-weight="bold">${schoolName}</text>
</svg>"`;
