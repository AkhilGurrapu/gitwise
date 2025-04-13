// src/lib/types/index.ts
// Import actual types from reactflow
import type { Node, Edge } from 'reactflow'; 

// Remove placeholder types
// type ReactFlowNode = { id: string; type?: string; position: { x: number; y: number }; data?: any; };
// type ReactFlowEdge = { id: string; source: string; target: string; type?: string; };

export type Module = {
    id: string; // uuid is fundamentally a string
    title: string;
    description: string | null;
    slug: string;
    // Add order later if needed for sorting explicitly in frontend
    // order?: number | null; 
  };
  
export type Lesson = {
    id: string;
    module_id: string;
    title: string;
    description: string | null;
    slug: string;
    order: number | null;
}

export type Step = {
    id: string;
    lesson_id: string;
    order: number;
    content: string | null;
    git_command: string | null;
    // Use actual reactflow types
    visualization_data: { nodes: Node[]; edges: Edge[] } | null; 
    expected_output: string | null;
};

  // Add other types like Profile etc. here later 