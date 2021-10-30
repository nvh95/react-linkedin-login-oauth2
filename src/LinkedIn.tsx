import { LinkedInType } from './types';
import { useLinkedIn } from './useLinkedIn';

export function LinkedIn({
  children,
  redirectUri,
  clientId,
  onSuccess,
  onError,
  state,
  scope,
  closePopupMessage,
}: LinkedInType) {
  const { linkedInLogin } = useLinkedIn({
    redirectUri,
    clientId,
    onSuccess,
    onError,
    state,
    scope,
    closePopupMessage,
  });
  return children({ linkedInLogin });
}
