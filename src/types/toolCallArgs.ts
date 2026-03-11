/**
 * TypeScript interfaces for orchestrator tool call arguments.
 *
 * These match the OpenAI function-calling schemas defined in the backend's
 * ORCHESTRATOR_TOOLS list and represent the payload the frontend receives
 * inside `tool_calls[].function.arguments`.
 */

// ---------------------------------------------------------------------------
// Rebuff
// ---------------------------------------------------------------------------
export interface RebuffArgs {
  user_request: string;
  reason: string;
}

// ---------------------------------------------------------------------------
// ClarifyVariable
// ---------------------------------------------------------------------------
export interface ClarifyCandidate {
  field_name: string;
  entity: string;
}

export interface AmbiguousVariable {
  query_term: string;
  candidates: ClarifyCandidate[];
}

export interface ClarifyVariableArgs {
  message: string;
  ambiguous_variables: AmbiguousVariable[];
}

// ---------------------------------------------------------------------------
// FreeTextExplain
// ---------------------------------------------------------------------------
export type FreeTextResponseType = 'capabilities' | 'data_summary' | 'general';

export interface FreeTextExplainArgs {
  user_request: string;
  response_type: FreeTextResponseType;
  /** Added by the backend after generation — not in the LLM tool schema. */
  text?: string;
  /** Pre-resolved fallback for structured text references. */
  resolved_text?: string;
}

// ---------------------------------------------------------------------------
// FilterData
// ---------------------------------------------------------------------------
export interface FilterDataArgs {
  entity: string;
  field: string;
  filterType: 'point' | 'interval';
  /** Present when filterType is 'interval'. */
  intervalRange?: {
    min: number;
    max: number;
  };
  /** Present when filterType is 'point'. */
  pointValues?: string[];
}

// ---------------------------------------------------------------------------
// CreateVisualization (sent by LLM → orchestrator transforms to
// RenderVisualization with a `spec` and `title` before reaching the frontend)
// ---------------------------------------------------------------------------
export interface CreateVisualizationArgs {
  description: string;
  title: string;
}
