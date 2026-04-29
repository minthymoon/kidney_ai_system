export interface DelegatedUIErrorI {
  title: string;
  description: string;
  error: {
    frontFacingMessages?: string[];
    frontFacingMessage: string;
    errors: string[];
    message: string | string[];
  };
}
