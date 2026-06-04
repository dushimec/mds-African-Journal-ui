
export const validateIssuesPerVolume = (issuesData: any[]): any[] => {
  const validated: any[] = [];
  const volumeIssueCount: { [key: number]: number } = {};

  issuesData.forEach((issue) => {
    const volume = issue.volume;
    
    // Initialize volume counter if not exists
    if (!volumeIssueCount[volume]) {
      volumeIssueCount[volume] = 0;
    }

    // Only add if volume has less than 2 issues
    if (volumeIssueCount[volume] < 2) {
      validated.push(issue);
      volumeIssueCount[volume]++;
    }
  });

  return validated;
};


export const countValidIssues = (issuesData: any[]): number => {
  return validateIssuesPerVolume(issuesData).length;
};

export const groupValidIssuesByVolume = (issuesData: any[]): { [key: number]: any[] } => {
  const validated = validateIssuesPerVolume(issuesData);
  const grouped: { [key: number]: any[] } = {};

  validated.forEach((issue) => {
    if (!grouped[issue.volume]) {
      grouped[issue.volume] = [];
    }
    grouped[issue.volume].push(issue);
  });

  return grouped;
};
