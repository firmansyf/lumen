interface NpmRegistryResponse {
  name: string;
  "dist-tags"?: {
    latest?: string;
  };
}

export async function getLatestVersion(
  packageName: string
): Promise<string | null> {
  try {
    const response = await fetch(
      `https://registry.npmjs.org/${encodeURIComponent(packageName)}`
    );

    if (!response.ok) {
      return null;
    }

    const data =
      (await response.json()) as NpmRegistryResponse;

    return data["dist-tags"]?.latest ?? null;
  } catch {
    return null;
  }
}