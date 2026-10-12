export interface ValidatorInput {
  format: 'xml' | 'json' | 'xml and json';
  accepts: '.xml'| '.json' | 'text/*,.xml,.json';
}
