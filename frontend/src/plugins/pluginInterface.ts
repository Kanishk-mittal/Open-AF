import React from 'react';

export interface PluginComponentProps {
  projectId: string;
}

export interface IFrontendPlugin {
  /** Unique plugin identifier matching backend plugin ID */
  id: string;
  /** Display title in the left sidebar */
  name: string;
  /** Short description of the plugin capability */
  description?: string;
  /** Lucide icon component or icon name */
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
  /** Order badge or category */
  category?: 'System' | 'Artifacts' | 'Extraction' | 'Analysis';
  /** The full React component rendered on the right side */
  component: React.ComponentType<PluginComponentProps>;
}
