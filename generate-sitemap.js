import fs from "fs";
import path from "path";

// Your domain
const DOMAIN = "https://www.jaedp.org";

// List all public routes from your App.jsx
const routes = [
  "/", 
  "/about",
  "/journal",
  "/editorial-board",
  "/author-page",
  "/archive",
  "/submission",
  "/contact",
  "/login",
];

// Get current date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];

// Start XML
let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
xml += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">\n';

// Add routes
routes.forEach((route) => {
  xml += "  <url>\n";
  xml += `    <loc>${DOMAIN}${route}</loc>\n`;
  xml += `    <lastmod>${today}</lastmod>\n`;
  xml += "    <changefreq>weekly</changefreq>\n";
  xml += `    <priority>${route === "/" ? 1.0 : 0.8}</priority>\n`;
  xml += "  </url>\n";
});

// Close XML
xml += "</urlset>\n";

// Write sitemap to public folder
const outputPath = path.resolve("./public/sitemap.xml");
fs.writeFileSync(outputPath, xml, { encoding: "utf8" });

console.log("✅ sitemap.xml generated successfully at ./public/sitemap.xml");
