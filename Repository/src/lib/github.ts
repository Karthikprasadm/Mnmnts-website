export type GitHubRepo = {
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  html_url: string;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  pushed_at?: string;
  fork: boolean;
  archived: boolean;
  owner?: { login?: string; avatar_url?: string };
};

export async function fetchGithubRepos(
  username: string,
  token?: string,
): Promise<GitHubRepo[]> {
  try {
    const githubResponse = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100&sort=updated`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    );

    if (!githubResponse.ok) {
      return [];
    }

    const repos = (await githubResponse.json()) as GitHubRepo[];
    // Show all repositories, including forks, but still hide archived ones
    return repos.filter((repo) => !repo.archived);
  } catch {
    return [];
  }
}

