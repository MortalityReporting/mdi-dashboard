export interface ValidationResults {
  // Fields that characterize the validator API response
  isValid?: boolean | null, // TODO this is a bit ambiguous, since the validator may produce Warning and Notes only, but not produce Errors.
  hasBasicErrors?: boolean,
  infoCount?: number,
  notesCount?: number,
  warningsCount?: number,
  errorsCount?: number,
  resource?: string | null
}
