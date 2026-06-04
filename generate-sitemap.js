import fs from "fs";
import path from "path";

// Your domain
const DOMAIN = "https://www.jaedp.org";
const BACKEND_URL = process.env.VITE_API_URL || "http://localhost:3000/api";

// List all public routes from your App.jsx
const staticRoutes = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/about", priority: 0.9, changefreq: "monthly" },
  { path: "/journal", priority: 0.9, changefreq: "weekly" },
  { path: "/editorial-board", priority: 0.8, changefreq: "monthly" },
  { path: "/author-page", priority: 0.7, changefreq: "weekly" },
  { path: "/archive", priority: 0.8, changefreq: "weekly" },
  { path: "/submission", priority: 0.8, changefreq: "monthly" },
  { path: "/contact", priority: 0.7, changefreq: "monthly" },
];

// Get current date in YYYY-MM-DD format
const today = new Date().toISOString().split("T")[0];

/**
 * Fetch published articles from backend API
 * Includes article ID and DOI information for Google Scholar indexing
 */
async function fetchPublishedArticles() {
  try {
    const response = await fetch(`${BACKEND_URL}/submission?status=published&limit=10000`);
    if (!response.ok) {
      console.warn("⚠️  Could not fetch articles from API. Using static routes only.");
      return [];
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.warn(
      `⚠️  Backend not available (${error.message}). Articles will not be included in sitemap.`
    );
    console.warn("💡 Run the backend server to include dynamic article URLs.");
    return [];
  }
}

/**
 * Generate sitemap XML
 */
function generateSitemapXml(staticUrls, articleUrls) {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9"\n';
  xml += '         xmlns:news="https://www.google.com/schemas/sitemap-news/0.9">\n';

  // Add static routes
  staticUrls.forEach((route) => {
    xml += "  <url>\n";
    xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += "  </url>\n";
  });

  // Add article URLs with DOI information
  articleUrls.forEach((article) => {
    xml += "  <url>\n";
    xml += `    <loc>${DOMAIN}/article/${article.id}</loc>\n`;
    xml += `    <lastmod>${article.publishedAt || article.createdAt}</lastmod>\n`;
    xml += "    <changefreq>never</changefreq>\n";
    xml += "    <priority>0.9</priority>\n";
    // Add news sitemap extensions for recently published articles
    if (isRecentlyPublished(article.publishedAt)) {
      xml += "    <news:news>\n";
      xml += "      <news:publication>\n";
      xml += '        <news:name>Journal of African Education and Development Policy</news:name>\n';
      xml += "        <news:language>en</news:language>\n";
      xml += "      </news:publication>\n";
      xml += `      <news:publication_date>${new Date(article.publishedAt || article.createdAt).toISOString()}</news:publication_date>\n`;
      xml += `      <news:title>${escapXml(article.manuscriptTitle)}</news:title>\n`;
      if (article.doiSlug) {
        xml += `      <news:keywords>DOI: ${article.doiSlug}</news:keywords>\n`;
      }
      xml += "    </news:news>\n";
    }
    xml += "  </url>\n";
  });

  // Add volume and issue pages
  const volumes = getUniqueVolumes(articleUrls);
  volumes.forEach((volume) => {
    xml += "  <url>\n";
    xml += `    <loc>${DOMAIN}/volume/${volume}</loc>\n`;
    xml += `    <lastmod>${today}</lastmod>\n`;
    xml += "    <changefreq>yearly</changefreq>\n";
    xml += "    <priority>0.7</priority>\n";
    xml += "  </url>\n";
  });

  // Close XML
  xml += "</urlset>\n";
  return xml;
}

/**
 * Check if article was published in the last 2 days
 */
function isRecentlyPublished(publishDate) {
  if (!publishDate) return false;
  const published = new Date(publishDate);
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  return published > twoDaysAgo;
}

/**
 * Extract unique volume numbers from articles
 */
function getUniqueVolumes(articles) {
  const volumes = new Set();
  articles.forEach((article) => {
    if (article.volume) {
      volumes.add(article.volume);
    }
  });
  return Array.from(volumes).sort((a, b) => b - a); // Sort descending
}

/**
 * Escape XML special characters
 */
function escapXml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Generate and write sitemap
 */
async function generateSitemap() {
  console.log("📝 Generating sitemap...");

  // Fetch articles
  const articles = await fetchPublishedArticles();
  if (articles.length > 0) {
    console.log(`✅ Found ${articles.length} published articles`);
  }

  // Generate XML
  const xml = generateSitemapXml(staticRoutes, articles);

  // Write sitemap to public folder
  const outputPath = path.resolve("./public/sitemap.xml");
  fs.writeFileSync(outputPath, xml, { encoding: "utf8" });

  console.log(
    `✅ sitemap.xml generated successfully at ./public/sitemap.xml`
  );
  console.log(
    `   - Static pages: ${staticRoutes.length}`
  );
  console.log(
    `   - Articles: ${articles.length}`
  );
  if (articles.length > 0) {
    const volumes = getUniqueVolumes(articles);
    console.log(
      `   - Volumes: ${volumes.length}`
    );
  }
  console.log(
    "💡 Sitemap includes DOI information for Google Scholar indexing"
  );
}

// Generate sitemap
generateSitemap();
