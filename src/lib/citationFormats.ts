/**
 * Citation formatting utilities for academic articles
 * Supports: APA, MLA, Chicago, Harvard citation styles
 */

export interface ArticleData {
  manuscriptTitle?: string;
  authors?: Array<{
    fullName: string;
    affiliation: string;
  }>;
  publishedAt?: string;
  volume?: number;
  issue?: number;
  doiSlug?: string;
  abstract?: string;
}

/**
 * Format author names for citations
 * Input: ["John Smith", "Jane Doe"]
 * Output: "Smith, J., Doe, J."
 */
const formatAuthorsForCitation = (authors: any[], style: 'apa' | 'mla' | 'chicago' | 'harvard'): string => {
  if (!authors || authors.length === 0) return "Unknown Author";

  if (style === 'apa' || style === 'harvard') {
    return authors
      .map((author, index) => {
        const parts = author.fullName.split(" ");
        const lastName = parts[parts.length - 1];
        const initials = parts
          .slice(0, -1)
          .map((part: string) => part[0].toUpperCase() + ".")
          .join(" ");
        return `${lastName}, ${initials}`;
      })
      .join(", ");
  } else if (style === 'mla') {
    if (authors.length === 1) {
      return authors[0].fullName;
    }
    const first = authors[0].fullName;
    const others = authors.slice(1).length;
    return `${first}, et al.`;
  } else if (style === 'chicago') {
    return authors.map((author) => author.fullName).join(", and ");
  }

  return authors.map((a) => a.fullName).join(", ");
};

/**
 * Format publication year
 */
const getPublicationYear = (publishedAt?: string): string => {
  if (!publishedAt) return new Date().getFullYear().toString();
  return new Date(publishedAt).getFullYear().toString();
};

/**
 * APA Citation Format
 * Example: Smith, J., & Doe, J. (2023). Article title. Journal Name, 1(2), 45-60. https://doi.org/10.xxxx
 */
export const generateAPACitation = (article: ArticleData): string => {
  const authors = formatAuthorsForCitation(article.authors || [], 'apa');
  const year = getPublicationYear(article.publishedAt);
  const title = article.manuscriptTitle || "Untitled Article";
  const volume = article.volume || "1";
  const issue = article.issue || "1";
  const doi = article.doiSlug || "";
  const journalName = "African Journal of Applied Economics and Development";

  let citation = `${authors} (${year}). ${title}. ${journalName}, ${volume}(${issue}).`;

  if (doi) {
    citation += ` https://doi.org/${doi}`;
  }

  return citation;
};

/**
 * MLA Citation Format
 * Example: Smith, John, and Jane Doe. "Article Title." Journal Name, vol. 1, no. 2, 2023, pp. 45-60. doi: 10.xxxx
 */
export const generateMLACitation = (article: ArticleData): string => {
  const authors = formatAuthorsForCitation(article.authors || [], 'mla');
  const year = getPublicationYear(article.publishedAt);
  const title = article.manuscriptTitle || "Untitled Article";
  const volume = article.volume || "1";
  const issue = article.issue || "1";
  const doi = article.doiSlug || "";
  const journalName = "African Journal of Applied Economics and Development";

  let citation = `${authors}. "${title}." ${journalName}, vol. ${volume}, no. ${issue}, ${year}.`;

  if (doi) {
    citation += ` doi: ${doi}`;
  }

  return citation;
};

/**
 * Chicago Citation Format (Notes and Bibliography)
 * Example: Smith, John, and Jane Doe. "Article Title." African Journal of Applied Economics and Development 1, no. 2 (2023): 45-60. https://doi.org/10.xxxx
 */
export const generateChicagoCitation = (article: ArticleData): string => {
  const authors = formatAuthorsForCitation(article.authors || [], 'chicago');
  const year = getPublicationYear(article.publishedAt);
  const title = article.manuscriptTitle || "Untitled Article";
  const volume = article.volume || "1";
  const issue = article.issue || "1";
  const doi = article.doiSlug || "";
  const journalName = "African Journal of Applied Economics and Development";

  let citation = `${authors}. "${title}." ${journalName} ${volume}, no. ${issue} (${year}).`;

  if (doi) {
    citation += ` https://doi.org/${doi}`;
  }

  return citation;
};

/**
 * Harvard Citation Format
 * Example: Smith, J., Doe, J. (2023). Article title. African Journal of Applied Economics and Development, 1(2), pp. 45-60. doi: 10.xxxx
 */
export const generateHarvardCitation = (article: ArticleData): string => {
  const authors = formatAuthorsForCitation(article.authors || [], 'harvard');
  const year = getPublicationYear(article.publishedAt);
  const title = article.manuscriptTitle || "Untitled Article";
  const volume = article.volume || "1";
  const issue = article.issue || "1";
  const doi = article.doiSlug || "";
  const journalName = "African Journal of Applied Economics and Development";

  let citation = `${authors} (${year}). ${title}. ${journalName}, ${volume}(${issue}).`;

  if (doi) {
    citation += ` doi: ${doi}`;
  }

  return citation;
};

/**
 * BibTeX Citation Format
 * Useful for LaTeX documents
 */
export const generateBibTeXCitation = (article: ArticleData): string => {
  const year = getPublicationYear(article.publishedAt);
  const title = article.manuscriptTitle || "Untitled Article";
  const volume = article.volume || "1";
  const issue = article.issue || "1";
  const doi = article.doiSlug || "";
  const journalName = "African Journal of Applied Economics and Development";

  // Create a key from title
  const titleWords = title.split(" ").slice(0, 3).join("");
  const key = `${titleWords.toLowerCase()}${year}`;

  let authors = "";
  if (article.authors && article.authors.length > 0) {
    authors = article.authors.map((a) => a.fullName).join(" and ");
  }

  let bibtex = `@article{${key},\n`;
  if (authors) {
    bibtex += `  author = {${authors}},\n`;
  }
  bibtex += `  title = {${title}},\n`;
  bibtex += `  journal = {${journalName}},\n`;
  bibtex += `  volume = {${volume}},\n`;
  bibtex += `  number = {${issue}},\n`;
  bibtex += `  year = {${year}},\n`;
  if (doi) {
    bibtex += `  doi = {${doi}},\n`;
  }
  bibtex += `}`;

  return bibtex;
};

/**
 * RIS Citation Format
 * Useful for reference management software like Zotero, Mendeley
 */
export const generateRISCitation = (article: ArticleData): string => {
  const title = article.manuscriptTitle || "Untitled Article";
  const year = getPublicationYear(article.publishedAt);
  const volume = article.volume || "1";
  const issue = article.issue || "1";
  const doi = article.doiSlug || "";
  const journalName = "African Journal of Applied Economics and Development";

  let ris = "TY  - JOUR\n";
  ris += `TI  - ${title}\n`;
  ris += `JO  - ${journalName}\n`;
  ris += `VL  - ${volume}\n`;
  ris += `IS  - ${issue}\n`;
  ris += `PY  - ${year}\n`;

  if (article.authors && article.authors.length > 0) {
    article.authors.forEach((author) => {
      ris += `AU  - ${author.fullName}\n`;
    });
  }

  if (doi) {
    ris += `DO  - ${doi}\n`;
  }

  ris += "ER  - \n";

  return ris;
};

/**
 * Get all citation formats for an article
 */
export const getAllCitations = (article: ArticleData) => {
  return {
    apa: generateAPACitation(article),
    mla: generateMLACitation(article),
    chicago: generateChicagoCitation(article),
    harvard: generateHarvardCitation(article),
    bibtex: generateBibTeXCitation(article),
    ris: generateRISCitation(article),
  };
};

/**
 * Copy text to clipboard
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};
