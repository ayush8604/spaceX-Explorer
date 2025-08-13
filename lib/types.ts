export type Launch = {
  id: string;
  name: string;                  // Mission name
  date_utc: string;
  links: {
    patch?: { small?: string | null; large?: string | null };
    flickr?: { original?: string[] };
  };
  success?: boolean | null;
  upcoming?: boolean;
  launchpad: string;             // v4 launchpad id
};

export type Launchpad = {
  id: string;
  name: string;
  locality: string;
  region: string;
  latitude: number;
  longitude: number;
};

export type LaunchResponse = {
  docs: Launch[];
  hasNextPage: boolean;
  page: number;
  totalDocs: number;
  totalPages: number;
};

export type LaunchpadResponse = Launchpad; 