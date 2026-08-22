import type { ReactElement } from 'react';

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
  popupWidth?: number;
  popupHeight?: number;
}

export interface LinkedInType extends useLinkedInType {
  children: (props: { linkedInLogin: () => void }) => ReactElement;
}
