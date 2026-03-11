import type { useDataPackageStore } from '../stores/dataPackageStore';

type DataPackageStore = ReturnType<typeof useDataPackageStore>;

const FUNC_PATTERN = /\{(\w+)\((.*?)\)\}/g;

function parseArgs(rawArgs: string): string[] {
  if (!rawArgs.trim()) return [];
  return rawArgs.split(',').map((arg) => {
    const trimmed = arg.trim();
    // Strip surrounding quotes
    if (
      (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))
    ) {
      return trimmed.slice(1, -1);
    }
    return trimmed;
  });
}

// eslint-disable-next-line no-unused-vars
type FuncHandler = (store: DataPackageStore, args: string[]) => string;

const functionRegistry: Record<string, FuncHandler> = {
  entity_count(store) {
    return String(store.entityNames.length);
  },

  entity_names(store) {
    return store.entityNames.join(', ');
  },

  field_count(store, args) {
    const entity = args[0];
    if (!entity || !store.sourceFields) return '?';
    const fields = store.sourceFields[entity];
    return fields ? String(fields.length) : '?';
  },

  field_names(store, args) {
    const entity = args[0];
    if (!entity || !store.sourceFields) return '?';
    const fields = store.sourceFields[entity];
    return fields ? fields.join(', ') : '?';
  },

  field_type(store, args) {
    const [entity, field] = args;
    if (!entity || !field) return '?';
    const domain = store.getDomainForField(entity, field);
    return domain ? domain.type : '?';
  },

  row_count(store, args) {
    const entity = args[0];
    if (!entity || !store.dataPackage?.resources) return '?';
    const resource = store.dataPackage.resources.find((r: any) => r.name === entity);
    return resource?.['udi:row_count'] != null ? String(resource['udi:row_count']) : '?';
  },

  sample_values(store, args) {
    const [entity, field] = args;
    if (!entity || !field) return '?';
    const domain = store.getDomainForField(entity, field);
    if (!domain) return '?';
    if (domain.type === 'interval') {
      const d = domain.domain as { min: number; max: number };
      return `${d.min} – ${d.max}`;
    }
    const d = domain.domain as { values: string[] };
    return d.values.slice(0, 5).join(', ');
  },
};

export interface StructuredTextSegment {
  type: 'text' | 'value';
  content: string;
}

export function evaluateStructuredText(
  text: string,
  store: DataPackageStore,
): StructuredTextSegment[] {
  const segments: StructuredTextSegment[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(FUNC_PATTERN)) {
    const [fullMatch, funcName, rawArgs] = match;
    const matchIndex = match.index!;

    // Add preceding text
    if (matchIndex > lastIndex) {
      segments.push({ type: 'text', content: text.slice(lastIndex, matchIndex) });
    }

    const handler = functionRegistry[funcName];
    if (handler) {
      try {
        const args = parseArgs(rawArgs);
        const result = handler(store, args);
        segments.push({ type: 'value', content: result });
      } catch {
        // Evaluation failed — output the raw reference
        segments.push({ type: 'text', content: fullMatch });
      }
    } else {
      // Unknown function — output raw
      segments.push({ type: 'text', content: fullMatch });
    }

    lastIndex = matchIndex + fullMatch.length;
  }

  // Add trailing text
  if (lastIndex < text.length) {
    segments.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return segments;
}

export function hasStructuredReferences(text: string): boolean {
  return FUNC_PATTERN.test(text);
}
