export const DEFAULTS = {
  count: 2,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2000,
};

export const RANGES = {
  temperature: { min: 0, max: 2, step: 0.1 },
  topP: { min: 0, max: 1, step: 0.05 },
  topK: { min: 1, max: 100, step: 1 },
  maxOutputTokens: { min: 100, max: 2000, step: 50 },
  count: { min: 2, max: 4 },
};
