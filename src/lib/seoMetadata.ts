/**
 * SEO Metadata utility for generating structured data and meta tags
 * Specifically designed for academic publications with DOI support
 */

interface ArticleMetadata {
  manuscriptTitle?: string;
  abstract?: string;
  authors?: Array<{
    fullName: string;
    affiliation?: string;
  }>;
  publishedAt?: string;
  createdAt?: string;
  doiSlug?: string;
  keywords?: string;
  volume?: number;
  issue?: number;
  topic?: {
    name: string;
  };
  views?: number;
  downloads?: number;
  seoPdfName?: string;
}

/**
 * Generate JSON-LD structured data for ScholarArticle
 * This helps Google understand and index the article properly with DOI information
 */
export function generateScholarArticleJsonLd(article: ArticleMetadata, baseUrl: string): string {
  const publishDate = article.publishedAt || article.createdAt;
  const doiUrl = article.doiSlug ? `https://doi.org/${article.doiSlug}` : null;
  
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ScholarlyArticle",
    headline: article.manuscriptTitle || "Untitled Article",
    description: article.abstract?.substring(0, 160) || "Academic article",
    ...(article.authors && article.authors.length > 0 && {
      author: article.authors.map((author) => ({
        "@type": "Person",
        name: author.fullName,
        ...(author.affiliation && { affiliation: author.affiliation }),
      })),
    }),
    ...(publishDate && { datePublished: new Date(publishDate).toISOString() }),
    ...(article.topic && { keywords: article.topic.name }),
    ...(article.abstract && { abstract: article.abstract }),
    ...(doiUrl && { 
      identifier: doiUrl,
      sameAs: doiUrl,
      url: doiUrl,
    }),
    ...(article.volume && {
      isPartOf: {
        "@type": "PublicationVolume",
        volumeNumber: article.volume,
        ...(article.issue && { issueNumber: article.issue }),
      },
    }),
    inLanguage: "en",
  };

  return JSON.stringify(jsonLd);
}

/**
 * Generate citation meta tags for search engines
 * These are commonly used by citation aggregators and search engines
 */
export function generateCitationMetaTags(article: ArticleMetadata): MetaTag[] {
  const metaTags: MetaTag[] = [];
  const publishDate = article.publishedAt || article.createdAt;

  // Citation title
  if (article.manuscriptTitle) {
    metaTags.push({
      name: "citation_title",
      content: article.manuscriptTitle,
    });
  }

  // Citation authors
  if (article.authors && article.authors.length > 0) {
    article.authors.forEach((author) => {
      metaTags.push({
        name: "citation_author",
        content: author.fullName,
      });
    });
  }

  // Citation publication date
  if (publishDate) {
    const date = new Date(publishDate);
    metaTags.push({
      name: "citation_publication_date",
      content: date.toISOString().split("T")[0], // YYYY-MM-DD format
    });
  }

  // Citation DOI
  if (article.doiSlug) {
    metaTags.push({
      name: "citation_doi",
      content: article.doiSlug,
    });
  }

  // Citation keywords
  if (article.keywords) {
    metaTags.push({
      name: "citation_keywords",
      content: article.keywords,
    });
  }

  // Citation volume and issue
  if (article.volume) {
    metaTags.push({
      name: "citation_volume",
      content: article.volume.toString(),
    });
  }

  if (article.issue) {
    metaTags.push({
      name: "citation_issue",
      content: article.issue.toString(),
    });
  }

  // Citation abstract
  if (article.abstract) {
    metaTags.push({
      name: "citation_abstract",
      content: article.abstract,
    });
  }

  return metaTags;
}

interface MetaTag {
  name: string;
  content: string;
}

/**
 * Inject structured data (JSON-LD) into the document head
 */
export function injectJsonLd(jsonLdString: string): void {
  // Remove existing JSON-LD script if present
  const existingScript = document.querySelector('script[type="application/ld+json"]');
  if (existingScript) {
    existingScript.remove();
  }

  // Create and inject new script
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = jsonLdString;
  document.head.appendChild(script);
}

/**
 * Inject meta tags into the document head
 */
export function injectMetaTags(metaTags: MetaTag[]): void {
  metaTags.forEach((tag) => {
    // Remove existing meta tag with same name if present
    const existingTag = document.querySelector(`meta[name="${tag.name}"]`);
    if (existingTag) {
      existingTag.remove();
    }

    // Create and inject new meta tag
    const metaTag = document.createElement("meta");
    metaTag.name = tag.name;
    metaTag.content = tag.content;
    document.head.appendChild(metaTag);
  });
}

/**
 * Set Open Graph meta tags for social sharing with DOI reference
 */
export function injectOpenGraphTags(
  article: ArticleMetadata,
  pageUrl: string
): void {
  const ogTags = [
    { property: "og:title", content: article.manuscriptTitle || "Article" },
    {
      property: "og:description",
      content: article.abstract?.substring(0, 160) || "Academic article",
    },
    { property: "og:type", content: "article" },
    { property: "og:url", content: pageUrl },
    {
      property: "article:published_time",
      content: article.publishedAt
        ? new Date(article.publishedAt).toISOString()
        : "",
    },
  ];

  // Add DOI as identifier if available
  if (article.doiSlug) {
    ogTags.push({
      property: "article:identifier",
      content: `https://doi.org/${article.doiSlug}`,
    });
  }

  ogTags.forEach((tag) => {
    if (tag.content) {
      const existingTag = document.querySelector(
        `meta[property="${tag.property}"]`
      );
      if (existingTag) {
        existingTag.remove();
      }

      const metaTag = document.createElement("meta");
      metaTag.setAttribute("property", tag.property);
      metaTag.content = tag.content;
      document.head.appendChild(metaTag);
    }
  });
}

/**
 * Set Twitter Card meta tags for social sharing with DOI reference
 */
export function injectTwitterCardTags(article: ArticleMetadata): void {
  const twitterTags = [
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: article.manuscriptTitle || "Article" },
    {
      name: "twitter:description",
      content: article.abstract?.substring(0, 160) || "Academic article",
    },
  ];

  twitterTags.forEach((tag) => {
    const existingTag = document.querySelector(`meta[name="${tag.name}"]`);
    if (existingTag) {
      existingTag.remove();
    }

    const metaTag = document.createElement("meta");
    metaTag.name = tag.name;
    metaTag.content = tag.content;
    document.head.appendChild(metaTag);
  });
}

/**
 * Comprehensive SEO setup for article pages
 * Includes JSON-LD, citation meta tags, OG tags, and Twitter cards
 */
export function setupArticlePageSEO(
  article: ArticleMetadata,
  pageUrl: string
): void {
  // Generate and inject JSON-LD
  const jsonLd = generateScholarArticleJsonLd(article, pageUrl);
  injectJsonLd(jsonLd);

  // Generate and inject citation meta tags
  const citationMetaTags = generateCitationMetaTags(article);
  injectMetaTags(citationMetaTags);

  // Inject Open Graph tags
  injectOpenGraphTags(article, pageUrl);

  // Inject Twitter Card tags
  injectTwitterCardTags(article);

  // Set canonical URL
  setCanonicalUrl(pageUrl);
}

/**
 * Set canonical URL to prevent duplicate content issues
 */
export function setCanonicalUrl(url: string): void {
  let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement("link") as HTMLLinkElement;
    link.rel = "canonical";
    document.head.appendChild(link);
  }
  link.href = url;
}

/**
 * Generate DOI-based meta description for better indexing
 */
export function generateSEODescription(article: ArticleMetadata): string {
  let description = article.abstract?.substring(0, 155) || "Academic article";
  
  if (article.doiSlug) {
    // Append DOI if there's space
    const doiText = ` DOI: ${article.doiSlug}`;
    if ((description + doiText).length <= 160) {
      description += doiText;
    }
  }
  
  return description;
}
