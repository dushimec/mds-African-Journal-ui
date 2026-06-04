import { useEffect } from "react";
import { setupArticlePageSEO } from "@/lib/seoMetadata";

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
 * Hook to setup SEO metadata for article pages with DOI support
 * Usage: useArticleSEO(article, articleId);
 */
export function useArticleSEO(article: ArticleMetadata | null, articleId?: string): void {
  useEffect(() => {
    if (!article) return;

    const pageUrl =
      `${window.location.origin}/article/${articleId}` ||
      window.location.href;

    setupArticlePageSEO(article, pageUrl);

    // Cleanup: Remove injected meta tags on unmount
    return () => {
      // Optional: Remove meta tags when component unmounts if needed
      // This is generally not necessary since page navigation will replace them
    };
  }, [article, articleId]);
}
