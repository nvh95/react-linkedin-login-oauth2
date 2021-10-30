export interface useLinkedInType {
  redirectUri: string;
  clientId: string;
  onSuccess: (code: string) => void;
  onError?: ({
    error,
    errorMessage,
  }: {
    error: string;
    errorMessage: string;
  }) => void;
  state?: string;
  scope?: string;
  closePopupMessage?: string;
}

export interface LinkedInType extends useLinkedInType {
  children: ({ linkedInLogin }) => JSX.Element;
}
