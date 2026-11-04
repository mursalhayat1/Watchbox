// ── Legal documents ───────────────────────────────────────────────────────────
// Privacy Policy content was crawled verbatim from the previous WatchBox
// deployment (watchboxapp.vercel.app/privacy). Terms of Service and the
// User Agreement did not exist on that deployment (all three footer links
// rendered the same privacy doc), so they are authored here to match the
// facts established in the Privacy Policy (Supabase auth, TMDb metadata,
// OAuth providers, MCP/AI connectors). Edit freely — content lives here,
// styling lives in components/legal/LegalShell.tsx.

export type LegalBlock =
  | { type: 'p'; text: string }
  | { type: 'sub'; text: string }
  | { type: 'bullets'; items: string[] };

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  title: string;
  /** ISO date shown in the "Last updated" chip */
  updatedAt: string;
  sections: LegalSection[];
}

const LAST_UPDATED = 'November 3, 2026';

// ── Privacy Policy (crawled) ─────────────────────────────────────────────────
export const PRIVACY_POLICY: LegalDoc = {
  title: 'Privacy Policy',
  updatedAt: LAST_UPDATED,
  sections: [
    {
      id: 'overview',
      heading: 'Overview',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox ("we," "us," or "our") operates a personal media tracking platform that allows you to track movies, TV shows, and related content. This Privacy Policy describes how we collect, use, store, and share information about you when you use our services accessible at watchbox.app ("Service").',
        },
        {
          type: 'p',
          text: 'By using WatchBox, you agree to the collection and use of information as described in this policy. If you do not agree, please discontinue use of the Service.',
        },
      ],
    },
    {
      id: 'information-we-collect',
      heading: 'Information We Collect',
      blocks: [
        { type: 'p', text: 'We collect the following categories of information:' },
        {
          type: 'sub',
          text: 'Account Information',
        },
        {
          type: 'bullets',
          items: [
            'Email address (used for authentication and communications)',
            'Display name and optional profile picture',
            'Account creation date and last login timestamp',
            'OAuth provider identifiers (Google, Discord, Facebook) if you use social login',
          ],
        },
        {
          type: 'sub',
          text: 'Device & Technical Information',
        },
        {
          type: 'bullets',
          items: [
            'IP address (collected for security and fraud prevention)',
            'Browser type and version',
            'Operating system and device type',
            'Referring URLs and exit pages',
            'Time zone and language preferences',
          ],
        },
        {
          type: 'sub',
          text: 'Usage Data',
        },
        {
          type: 'bullets',
          items: [
            'Pages viewed and features used within the Service',
            'Search queries and browse history within WatchBox',
            'Watch history, favorites, lists, and ratings you create',
            'Settings and preferences you configure',
            'Session duration and interaction patterns',
          ],
        },
      ],
    },
    {
      id: 'how-we-use-your-data',
      heading: 'How We Use Your Data',
      blocks: [
        { type: 'p', text: 'We use the information we collect to:' },
        {
          type: 'bullets',
          items: [
            'Create and manage your WatchBox account',
            'Provide, maintain, and improve the Service',
            'Personalize your experience and surface relevant content',
            'Send transactional emails (e.g., account confirmation, password reset)',
            'Monitor and analyze usage patterns to improve features',
            'Detect and prevent fraudulent or unauthorized activity',
            'Comply with legal obligations and enforce our Terms of Service',
            'Respond to your support requests and communications',
          ],
        },
        {
          type: 'p',
          text: 'We do not sell, rent, or trade your personal information to third parties for their marketing purposes.',
        },
      ],
    },
    {
      id: 'cookies-tracking',
      heading: 'Cookies & Tracking Technologies',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox uses cookies and similar tracking technologies to enhance your experience and understand how our Service is used.',
        },
        { type: 'p', text: 'Types of cookies we use:' },
        {
          type: 'bullets',
          items: [
            'Essential Cookies — Required for authentication sessions and core functionality. Cannot be disabled.',
            'Analytics Cookies — Help us understand page views, user flows, and feature engagement (e.g., Supabase telemetry).',
            'Preference Cookies — Store your settings such as region, display preferences, and API keys.',
            'Security Cookies — Used to detect and prevent malicious activity.',
          ],
        },
        {
          type: 'p',
          text: 'You can control non-essential cookies through your browser settings. Disabling essential cookies will prevent you from logging in or using authenticated features.',
        },
      ],
    },
    {
      id: 'login-providers-oauth',
      heading: 'Login Providers & OAuth',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox offers authentication through third-party OAuth providers. When you sign in with a provider, that provider shares certain information with us:',
        },
        {
          type: 'sub',
          text: 'Google Sign-In',
        },
        {
          type: 'bullets',
          items: [
            'Your Google account email address',
            'Your public profile name and avatar',
            'A unique Google user identifier',
          ],
        },
        {
          type: 'sub',
          text: 'Discord OAuth',
        },
        {
          type: 'bullets',
          items: [
            'Your Discord username and discriminator',
            'Your Discord account email address (if permission granted)',
            'Your Discord avatar URL',
          ],
        },
        {
          type: 'sub',
          text: 'Facebook Login',
        },
        {
          type: 'bullets',
          items: [
            'Your Facebook name and email address',
            'Your public Facebook profile picture',
          ],
        },
        {
          type: 'p',
          text: "We do not receive or store your passwords from these providers. Authentication tokens are managed securely by Supabase Auth. Each provider's own privacy policy also applies to data they collect.",
        },
      ],
    },
    {
      id: 'watch-history-activity',
      heading: 'Watch History & User Activity',
      blocks: [
        { type: 'p', text: 'WatchBox stores the media tracking data you explicitly create, including:' },
        {
          type: 'bullets',
          items: [
            'Media items added to your library with status (watching, completed, want to watch, on hold, dropped)',
            'Star ratings and personal notes you add to entries',
            'Custom lists and list descriptions you create',
            'Favorite actors and people you follow',
            'Watch progress and episode tracking',
          ],
        },
        {
          type: 'p',
          text: 'This data is stored in our Supabase PostgreSQL database, linked to your account, and is only accessible by you (unless you explicitly share it). It is used solely to power your personal WatchBox experience.',
        },
        {
          type: 'p',
          text: 'You may request deletion of all your library data at any time from the Settings page or by contacting us.',
        },
      ],
    },
    {
      id: 'third-party-services',
      heading: 'Third-Party Services',
      blocks: [
        { type: 'p', text: 'We use the following third-party services to operate WatchBox:' },
        {
          type: 'bullets',
          items: [
            'Supabase — Database hosting, authentication, and file storage (supabase.com)',
            "The Movie Database (TMDb) — Media metadata, images, and ratings. Your search queries may be sent to TMDb's API.",
            "Google Fonts — Typography. Fonts are loaded from Google's CDN.",
            'Sentry — Error monitoring (anonymized crash reports)',
            'Vercel / Hosting Provider — Static asset delivery and CDN',
          ],
        },
        {
          type: 'p',
          text: 'Each of these services has its own privacy policy and data practices. We encourage you to review them. We only share the minimum data necessary for each service to function.',
        },
        {
          type: 'p',
          text: 'We may disclose your information if required by law, legal process, or to protect the rights and safety of WatchBox, its users, or the public.',
        },
      ],
    },
    {
      id: 'data-retention',
      heading: 'Data Retention',
      blocks: [
        {
          type: 'p',
          text: 'We retain your personal data for as long as your account is active or as needed to provide you the Service. Specifically:',
        },
        {
          type: 'bullets',
          items: [
            'Active account data: Retained for the lifetime of your account',
            'Library, ratings, and lists: Retained until you delete them or close your account',
            'Authentication logs: Retained for up to 90 days for security purposes',
            'Deleted account data: Purged within 30 days of account deletion request',
            'Anonymized analytics: May be retained indefinitely in aggregate form',
          ],
        },
        {
          type: 'p',
          text: 'To permanently delete your account and all associated data, use the account deletion option in Settings or contact us at support@watchbox.app. Upon deletion, we will remove your identifiable data within 30 days, subject to any legal hold obligations.',
        },
      ],
    },
    {
      id: 'your-rights',
      heading: 'Your Rights',
      blocks: [
        {
          type: 'p',
          text: 'Depending on your jurisdiction, you may have the following rights regarding your personal data:',
        },
        {
          type: 'bullets',
          items: [
            'Access — Request a copy of the personal data we hold about you',
            'Correction — Request correction of inaccurate or incomplete data',
            'Deletion — Request deletion of your personal data ("right to be forgotten")',
            'Portability — Request your data in a structured, machine-readable format',
            'Objection — Object to processing of your data for certain purposes',
            'Restriction — Request restriction of processing in certain circumstances',
            'Withdraw consent — Withdraw consent at any time where processing is based on consent',
          ],
        },
        {
          type: 'p',
          text: 'To exercise any of these rights, contact us at support@watchbox.app. We will respond within 30 days. Note that some rights may be limited by applicable law.',
        },
      ],
    },
    {
      id: 'security',
      heading: 'Security',
      blocks: [
        { type: 'p', text: 'We implement industry-standard security measures to protect your personal information:' },
        {
          type: 'bullets',
          items: [
            'TLS/HTTPS encryption for all data in transit',
            'Passwords are never stored — authentication is handled via Supabase Auth with bcrypt hashing',
            'Database access is restricted via Row Level Security (RLS) policies',
            'Regular security audits and dependency updates',
            'OAuth tokens are short-lived and never stored in plaintext',
          ],
        },
        {
          type: 'p',
          text: 'Despite these measures, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security of your data. In the event of a breach that affects your rights, we will notify you as required by applicable law.',
        },
      ],
    },
    {
      id: 'childrens-privacy',
      heading: "Children's Privacy",
      blocks: [
        {
          type: 'p',
          text: 'WatchBox is not directed to children under the age of 13 (or 16 in the EU under GDPR). We do not knowingly collect personal information from children under these ages. If you are a parent or guardian and believe your child has provided us with personal data, please contact us immediately at support@watchbox.app. We will promptly delete such information.',
        },
      ],
    },
    {
      id: 'policy-changes',
      heading: 'Policy Changes',
      blocks: [
        {
          type: 'p',
          text: 'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make material changes, we will:',
        },
        {
          type: 'bullets',
          items: [
            'Update the "Last Updated" date at the top of this policy',
            'Notify you via email (if we have your email address)',
            'Display a notice within the WatchBox application',
          ],
        },
        {
          type: 'p',
          text: 'Your continued use of WatchBox after any changes constitutes your acceptance of the updated policy. We encourage you to review this page periodically.',
        },
      ],
    },
    {
      id: 'contact-us',
      heading: 'Contact Us',
      blocks: [
        {
          type: 'p',
          text: 'If you have questions, concerns, or requests related to this Privacy Policy or your personal data, please contact us:',
        },
        {
          type: 'bullets',
          items: [
            'Email: support@watchbox.app',
            'Privacy Requests: privacy@watchbox.app',
            'Response Time: Within 30 business days',
          ],
        },
        {
          type: 'p',
          text: 'For EU residents, if you are unsatisfied with our response, you have the right to lodge a complaint with your local data protection authority.',
        },
      ],
    },
  ],
};

// ── Terms of Service (authored — see file header note) ───────────────────────
export const TERMS_OF_SERVICE: LegalDoc = {
  title: 'Terms of Service',
  updatedAt: LAST_UPDATED,
  sections: [
    {
      id: 'acceptance',
      heading: 'Acceptance of Terms',
      blocks: [
        {
          type: 'p',
          text: 'These Terms of Service ("Terms") govern your access to and use of WatchBox, a personal media tracking platform accessible at watchbox.app (the "Service"). By creating an account, signing in through a third-party provider, or otherwise using WatchBox, you agree to be bound by these Terms.',
        },
        {
          type: 'p',
          text: 'If you do not agree with these Terms, please do not use the Service.',
        },
      ],
    },
    {
      id: 'the-service',
      heading: 'The Service',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox lets you discover, track, and organize movies and TV shows — build your personal library, rate what you watch, keep personal notes, create custom lists, follow your favorite actors, and view statistics about your watch activity.',
        },
        {
          type: 'p',
          text: 'Media metadata, images, and ratings displayed in WatchBox are provided by The Movie Database (TMDb). WatchBox is not endorsed by or affiliated with TMDb.',
        },
      ],
    },
    {
      id: 'eligibility-accounts',
      heading: 'Eligibility & Accounts',
      blocks: [
        {
          type: 'p',
          text: 'You must be at least 13 years old (or 16 in the European Union, where the GDPR applies) to use WatchBox.',
        },
        {
          type: 'p',
          text: 'WatchBox uses OAuth sign-in through third-party providers (Google, Discord, Facebook) managed by Supabase Auth. You are responsible for keeping access to the underlying provider account secure, for the activity that happens through your WatchBox account, and for notifying us promptly at support@watchbox.app if you suspect unauthorized use.',
        },
      ],
    },
    {
      id: 'acceptable-use',
      heading: 'Acceptable Use',
      blocks: [
        { type: 'p', text: 'You agree not to:' },
        {
          type: 'bullets',
          items: [
            'Use the Service for any unlawful purpose or in violation of any applicable law or regulation',
            'Attempt to gain unauthorized access to the Service, other accounts, or our systems, or circumvent any security measures',
            'Scrape, harvest, or extract data from the Service at scale, or use automated tools that place unreasonable load on the Service',
            'Resell, sublicense, or commercially redistribute WatchBox or the TMDb-provided data and images it displays',
            'Infringe the rights of others, impersonate any person or entity, or misrepresent your affiliation',
          ],
        },
        {
          type: 'p',
          text: 'Reports of abuse or violations can be sent to support@watchbox.app and will be reviewed promptly.',
        },
      ],
    },
    {
      id: 'your-content-data',
      heading: 'Your Content & Data',
      blocks: [
        {
          type: 'p',
          text: 'The tracking content you create — library entries, statuses, ratings, personal notes, lists, and favorite actors ("User Content") — remains yours.',
        },
        {
          type: 'p',
          text: 'You grant WatchBox a limited license to store, back up, and display your User Content within the Service for the sole purpose of operating your account. User Content is accessible only by you unless you explicitly choose to share it.',
        },
        {
          type: 'p',
          text: 'You can delete your library data at any time from the Settings page or by contacting us, as described in our Privacy Policy.',
        },
      ],
    },
    {
      id: 'ai-connectors',
      heading: 'AI Assistants & MCP Connectors',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox optionally exposes a Model Context Protocol (MCP) server that lets you connect AI assistants such as ChatGPT or Claude to your library, favorites, and watch statistics.',
        },
        {
          type: 'p',
          text: 'Connecting an assistant is strictly opt-in and requires completing our OAuth consent flow. You can revoke access at any time from the assistant\'s connector settings. Your use of any third-party assistant is additionally governed by that provider\'s own terms and privacy policy.',
        },
      ],
    },
    {
      id: 'third-party-services',
      heading: 'Third-Party Services',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox relies on third-party services — including Supabase, TMDb, Vercel, Sentry, and Google Fonts — to operate. Those services are governed by their own terms and policies, which are summarized in our Privacy Policy.',
        },
        {
          type: 'p',
          text: 'WatchBox is not affiliated with, sponsored by, or acting as an agent of these providers.',
        },
      ],
    },
    {
      id: 'availability-changes',
      heading: 'Availability & Changes',
      blocks: [
        {
          type: 'p',
          text: 'The Service is provided on a best-effort basis. We may add, modify, suspend, or discontinue features at any time, and will use reasonable efforts to communicate significant changes.',
        },
        {
          type: 'p',
          text: 'Because WatchBox depends on external data providers, metadata and availability may occasionally be incomplete or delayed.',
        },
      ],
    },
    {
      id: 'intellectual-property',
      heading: 'Intellectual Property',
      blocks: [
        {
          type: 'p',
          text: 'The WatchBox name, interface design, code, and branding are the property of WatchBox. Movie, TV show, and person data and artwork displayed in the Service are owned by their respective rights holders and delivered via TMDb, and may not be reused outside personal, non-commercial use of WatchBox.',
        },
      ],
    },
    {
      id: 'disclaimers',
      heading: 'Disclaimers',
      blocks: [
        {
          type: 'p',
          text: 'THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. We do not warrant that the Service will be uninterrupted, error-free, or that metadata and ratings supplied by third parties will be accurate or complete.',
        },
      ],
    },
    {
      id: 'limitation-of-liability',
      heading: 'Limitation of Liability',
      blocks: [
        {
          type: 'p',
          text: 'To the maximum extent permitted by law, WatchBox will not be liable for any indirect, incidental, special, consequential, or punitive damages, including lost data, lost profits, or loss of enjoyment, arising from your use of the Service. Our total aggregate liability relating to the Service is limited to the amounts you actually paid to WatchBox in the twelve months preceding the claim (which is typically zero, because the Service is free).',
        },
      ],
    },
    {
      id: 'termination',
      heading: 'Termination & Suspension',
      blocks: [
        {
          type: 'p',
          text: 'You may stop using WatchBox at any time and delete your account and data as described in the Privacy Policy.',
        },
        {
          type: 'p',
          text: 'We may suspend or terminate access if you materially breach these Terms, use the Service unlawfully, or create a security risk for us or others. Where practicable, we will notify you of the reason and any available remedy.',
        },
      ],
    },
    {
      id: 'governing-law',
      heading: 'Governing Law & Disputes',
      blocks: [
        {
          type: 'p',
          text: 'These Terms are governed by the laws applicable at WatchBox\'s principal place of operation, without regard to conflict-of-law rules. Before filing a claim, contact us at support@watchbox.app — we ask for the chance to resolve any dispute informally and in good faith.',
        },
      ],
    },
    {
      id: 'changes-to-terms',
      heading: 'Changes to These Terms',
      blocks: [
        {
          type: 'p',
          text: 'We may update these Terms from time to time. Material changes will be reflected by the "Last updated" date at the top of this page and, where appropriate, a notice within the application. Continued use after changes take effect constitutes acceptance of the updated Terms.',
        },
      ],
    },
    {
      id: 'contact-us',
      heading: 'Contact Us',
      blocks: [
        {
          type: 'p',
          text: 'Questions about these Terms can be sent to:',
        },
        {
          type: 'bullets',
          items: [
            'Email: support@watchbox.app',
            'Response Time: Within 30 business days',
          ],
        },
      ],
    },
  ],
};

// ── User Agreement (authored — see file header note) ─────────────────────────
export const USER_AGREEMENT: LegalDoc = {
  title: 'User Agreement',
  updatedAt: LAST_UPDATED,
  sections: [
    {
      id: 'scope',
      heading: 'Scope of This Agreement',
      blocks: [
        {
          type: 'p',
          text: 'This User Agreement ("Agreement") is the usage agreement between you and WatchBox covering how you create, maintain, and use your WatchBox account. It supplements our Terms of Service; our Privacy Policy explains how we handle your data.',
        },
        {
          type: 'p',
          text: 'By creating an account or using WatchBox, you accept this Agreement together with our Terms of Service and Privacy Policy.',
        },
      ],
    },
    {
      id: 'your-account',
      heading: 'Your WatchBox Account',
      blocks: [
        {
          type: 'p',
          text: 'Your WatchBox account is personal to you. You sign in through a third-party identity provider (Google, Discord, or Facebook) that you trust and control, and you agree to keep access to that provider account secure.',
        },
        {
          type: 'p',
          text: 'WatchBox never sees or stores your provider passwords. If you believe someone else is using your account, change your provider credentials immediately and contact support@watchbox.app as soon as possible.',
        },
      ],
    },
    {
      id: 'your-watch-data',
      heading: 'What You Store with WatchBox',
      blocks: [
        {
          type: 'p',
          text: 'When you track media, you can set a status — Currently Watching, Completed, Plan to Watch, On Hold, or Dropped — plus star ratings (0–10), personal notes on titles, custom lists, and favorite actors.',
        },
        {
          type: 'p',
          text: 'These records belong to you and are stored in a private database secured by row-level access rules, accessible only to you unless you explicitly share them. You are responsible for the personal notes and ratings you choose to write.',
        },
      ],
    },
    {
      id: 'ai-connectors',
      heading: 'AI & MCP Features',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox can connect to AI assistants (ChatGPT or Claude) through a Model Context Protocol (MCP) connector so they can answer questions using your library, favorites, and watch statistics.',
        },
        {
          type: 'p',
          text: 'This is strictly opt-in: it requires completing the WatchBox OAuth consent screen, and you choose the scope of what the assistant can see. You can revoke access at any time from the assistant\'s connector settings. Third-party assistants operate under their own terms and privacy policies.',
        },
      ],
    },
    {
      id: 'community-conduct',
      heading: 'Conduct',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox is built for personal enjoyment of film and TV. You agree not to use it to harass, impersonate, or deceive others, to publish unlawful material, or to interfere with other users\' enjoyment of the Service.',
        },
        {
          type: 'p',
          text: 'You can report abuse or policy violations to support@watchbox.app. We review every report.',
        },
      ],
    },
    {
      id: 'fair-use',
      heading: 'Fair Use of the Platform',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox is designed for personal, non-commercial media tracking. You agree not to resell or redistribute the platform, extract its data at scale, or load it in ways that degrade service for others.',
        },
        {
          type: 'p',
          text: 'We may throttle, restrict, or suspend accounts where these limits are exceeded, with notice wherever practical.',
        },
      ],
    },
    {
      id: 'fees-availability',
      heading: 'Fees & Availability',
      blocks: [
        {
          type: 'p',
          text: 'WatchBox is currently offered free of charge. If paid features are ever introduced, they will be optional and clearly presented before you commit to anything.',
        },
        {
          type: 'p',
          text: 'Availability is best-effort. Downtime, delayed metadata, or missing artwork may occur because the Service depends on external providers such as TMDb and Supabase.',
        },
      ],
    },
    {
      id: 'your-controls',
      heading: 'Your Data Controls',
      blocks: [
        {
          type: 'p',
          text: 'You can delete library data at any time from the Settings page. Deleting your account removes your data permanently — identifiables are purged within 30 days, as described in our Privacy Policy.',
        },
        {
          type: 'p',
          text: 'For data requests that are not covered in Settings (access, portability, correction), contact privacy@watchbox.app.',
        },
      ],
    },
    {
      id: 'updates',
      heading: 'Updates to This Agreement',
      blocks: [
        {
          type: 'p',
          text: 'We may update this Agreement as WatchBox evolves. Material changes are reflected in the "Last updated" date at the top of this page and, where appropriate, a notice in the application. Continued use after an update means you accept the current version.',
        },
      ],
    },
    {
      id: 'contact-us',
      heading: 'Contact',
      blocks: [
        {
          type: 'p',
          text: 'For anything related to this Agreement, reach us at support@watchbox.app. We respond within 30 business days.',
        },
      ],
    },
  ],
};
