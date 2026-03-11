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
  message: string;
  suggestions: string[];
}

// ---------------------------------------------------------------------------
// ClarifyVariable
// ---------------------------------------------------------------------------
export interface ClarifyCandidate {
  field_name: string;
  entity: string;
  description?: string;
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

/**
 * A structured text element resolved server-side from a `{function(args)}`
 * reference. Plain text portions are bare strings in the segments array.
 */
export interface StructuredTextElement {
  value: string;
  [key: string]: unknown;
}

/** An individual segment is either a plain string or a resolved structured element. */
export type TextSegment = string | StructuredTextElement;

export interface FreeTextExplainArgs {
  response_type: FreeTextResponseType;
  /** Mixed array of plain strings and structured element objects, resolved server-side. */
  text: TextSegment[];
  has_structured_elements: boolean;
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
