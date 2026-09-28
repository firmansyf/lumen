interface OsvPackage {
  ecosystem: string;
  name: string;
}

interface OsvQuery {
  package: OsvPackage;
  version: string;
}

export interface OsvVulnerability {
  id: string;
  aliases?: string[];
  summary?: string;
  details?: string;
  database_specific?: {
    severity?: string;
  };
  severity?: Array<{
    type?: string;
    score?: string;
  }>;

  affected?: Array<{
    package?: OsvPackage;

    ranges?: Array<{
      events?: Array<{
        introduced?: string;
        fixed?: string;
      }>;
    }>;
  }>;

  references?: Array<{
    type?: string;
    url?: string;
  }>;
}

interface OsvResponse {
  vulns?: OsvVulnerability[];
}

export async function queryOsv(
  packageName: string,
  version: string
): Promise<OsvVulnerability[]> {
  const query: OsvQuery = {
    package: {
      ecosystem: "npm",
      name: packageName
    },
    version
  };

  try {
    const response = await fetch(
      "https://api.osv.dev/v1/query",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(query)
      }
    );

    if (!response.ok) {
      return [];
    }

    const data =
      (await response.json()) as OsvResponse;

    return data.vulns ?? [];
  } catch {
    return [];
  }
}