import LegalShell from '@/components/legal/LegalShell';
import { TERMS_OF_SERVICE } from '@/data/legalDocs';

export default function TermsPage() {
  return (
    <LegalShell
      doc={TERMS_OF_SERVICE}
      path="/terms"
      meta={{
        title: 'Terms of Service',
        description:
          'The terms that govern your use of WatchBox — accounts, acceptable use, your content, third-party services, and disclaimers.',
      }}
    />
  );
}
