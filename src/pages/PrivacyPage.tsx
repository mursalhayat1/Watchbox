import LegalShell from '@/components/legal/LegalShell';
import { PRIVACY_POLICY } from '@/data/legalDocs';

export default function PrivacyPage() {
  return (
    <LegalShell
      doc={PRIVACY_POLICY}
      path="/privacy"
      meta={{
        title: 'Privacy Policy',
        description:
          'How WatchBox collects, uses, stores, and protects your data — cookies, OAuth providers, watch history, retention, and your rights.',
      }}
    />
  );
}
