import LegalShell from '@/components/legal/LegalShell';
import { USER_AGREEMENT } from '@/data/legalDocs';

export default function UserAgreementPage() {
  return (
    <LegalShell
      doc={USER_AGREEMENT}
      path="/user-agreement"
      meta={{
        title: 'User Agreement',
        description:
          'Your agreement with WatchBox covering account responsibilities, your watch data, conduct, and AI/MCP connector features.',
      }}
    />
  );
}
