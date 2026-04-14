export interface IlnskConfig {
  apiUrl: string;
  apiKey: string;
  model: string;
  prompt?: string;
  gitmoji?: boolean;
}

export const DEFAULT_ILNSK_CONFIG: IlnskConfig = {
  apiUrl: '',
  apiKey: '',
  model: ''
};