export interface FileItem {
  path: string;
  content: string;
  language: string;
}

export interface Analysis {
  features: string[];
  database: string[];
  apis: string[];
  security: string;
}

export interface Deployment {
  id: string;
  platform: string;
  liveUrl: string;
  status: string;
  deployedAt: string;
  logs: string[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  description: string;
  prompt: string;
  createdAt: string;
  deploymentsCount: number;
}

export interface ProjectDetails extends ProjectSummary {
  analysis: Analysis;
  files: FileItem[];
  previewHtml: string;
  deployments: Deployment[];
  autoDiagnosticReport?: any;
}
