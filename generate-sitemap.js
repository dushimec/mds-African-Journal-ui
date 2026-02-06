import fs from "fs";
import path from "path";
import axios from "axios";

// Your domain
const DOMAIN = "https://www.jaedp.org";
const API_URL = process.env.API_URL || "https://api.jaedp.org";

// Static routes
const staticRoutes = [
  { path: "/", priority: 1.0, changefreq: "daily" },
  { path: "/journal", priority: 0.9, changefreq: "daily" },
  { path: "/about", priority: 0.7, changefreq: "monthly" },
  { path: "/editorial-board", priority: 0.6, changefreq: "monthly" },
  { path: "/archive", priority: 0.8, changefreq: "weekly" },
  { path: "/submission", priority: 0.5, changefreq: "yearly" },
  { path: "/contact", priority: 0.5, changefreq: "yearly" },
];

async function generateSitemap() {
  try {
    console.log("Fetching published articles...");

    // Fetch all published articles from API
    let articles = [];
    try {
      const response = await axios.get(`${API_URL}/submission?status=PUBLISHED`, {
        timeout: 30000
      });
      articles = response.data.data || [];
      console.log(`Found ${articles.length} published articles`);
    } catch (error) {
      console.warn("Failed to fetch articles from API:", error.message);
      console.log("Continuing with static routes only...");
    }

    const today = new Date().toISOString().split("T")[0];

    // Article routes with SEO URLs
    const articleRoutes = articles
      .filter(article => article.volume && article.issue && article.seoPdfName)
      .map(article => ({
        path: `/vol${article.volume}/issue${article.issue}/${article.seoPdfName}`,
        lastmod: article.publishedAt ? article.publishedAt.split("T")[0] : today,
        priority: 0.85,
        changefreq: "yearly",
      }));

    // Combine routes
    const allRoutes = [...staticRoutes, ...articleRoutes];

    console.log(`Generating sitemap with ${allRoutes.length} URLs (${articleRoutes.length} articles)...`);

    // Generate XML
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:xhtml="http://www.w3.org/1999/xhtml"\n';
    xml += '        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"\n';
    xml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n';
    xml += '        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">\n';

    allRoutes.forEach(route => {
      xml += '  <url>\n';
      xml += `    <loc>${DOMAIN}${route.path}</loc>\n`;
      xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
      xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
      xml += `    <priority>${route.priority}</priority>\n`;
      xml += '  </url>\n';
    });

    xml += '</urlset>\n';

    // Write sitemap to public folder
    const outputPath = path.resolve("./public/sitemap.xml");
    fs.writeFileSync(outputPath, xml, { encoding: "utf8" });

    console.log("sitemap.xml generated successfully at ./public/sitemap.xml");
    console.log(`   - Total URLs: ${allRoutes.length}`);
    console.log(`   - Article URLs: ${articleRoutes.length}`);

    // Also generate news sitemap for Google News
    generateNewsSitemap(articles, today);

  } catch (error) {
    console.error("Failed to generate sitemap:", error);
    process.exit(1);
  }
}

async function generateNewsSitemap(articles, today) {
  try {
    // Filter articles from last 2 days for Google News
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const newsArticles = articles.filter(article => {
      if (!article.publishedAt) return false;
      const pubDate = new Date(article.publishedAt);
      return pubDate >= twoDaysAgo;
    });

    if (newsArticles.length === 0) {
      console.log("No recent articles for news sitemap");
      return;
    }

    let newsXml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    newsXml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    newsXml += '        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">\n';

    newsArticles.forEach(article => {
      newsXml += '  <url>\n';
      newsXml += `    <loc>${DOMAIN}/vol${article.volume}/issue${article.issue}/${article.seoPdfName}</loc>\n`;
      newsXml += '    <news:news>\n';
      newsXml += '      <news:publication>\n';
      newsXml += '        <news:name>JAEDP</news:name>\n';
      newsXml += '        <news:language>en</news:language>\n';
      newsXml += '      </news:publication>\n';
      newsXml += `      <news:publication_date>${article.publishedAt?.split("T")[0]}</news:publication_date>\n`;
      newsXml += `      <news:title>${article.manuscriptTitle}</news:title>\n`;
      newsXml += '    </news:news>\n';
      newsXml += '  </url>\n';
    });

    newsXml += '</urlset>\n';

    const newsOutputPath = path.resolve("./public/sitemap-news.xml");
    fs.writeFileSync(newsOutputPath, newsXml, { encoding: "utf8" });
    console.log("sitemap-news.xml generated successfully");

  } catch (error) {
    console.error("Failed to generate news sitemap:", error);
  }
}

generateSitemap();
