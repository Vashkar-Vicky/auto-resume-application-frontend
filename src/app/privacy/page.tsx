export const metadata = {
  title: "Privacy Policy — AutoApply",
  description:
    "How AutoApply and the AutoApply LinkedIn Connector Chrome extension handle your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-2xl prose prose-invert">
        <h1>Privacy Policy</h1>
        <p>
          <em>Last updated: May 16, 2026</em>
        </p>

        <p>
          This page describes how the AutoApply web application
          (auto-resume-application-frontend.vercel.app) and the AutoApply
          LinkedIn Connector Chrome extension handle personal data. We are
          committed to collecting the minimum necessary, storing it securely,
          and giving you full control to disconnect or delete at any time.
        </p>

        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>Account information.</strong> Your name, email address,
            and a hashed password used to sign in to AutoApply.
          </li>
          <li>
            <strong>LinkedIn session cookie (<code>li_at</code>).</strong>
            When you connect your LinkedIn account, we receive your existing{" "}
            <code>li_at</code> session token from your browser. This token
            authenticates the automation worker to apply for jobs on your
            behalf. We never request your LinkedIn email or password.
          </li>
          <li>
            <strong>Application activity.</strong> Records of jobs your
            account has applied to via AutoApply (company, role, status,
            timestamp) so you can review and audit activity.
          </li>
          <li>
            <strong>Resume / profile data.</strong> Files and information you
            upload for use during applications.
          </li>
        </ul>

        <h2>What the Chrome extension does</h2>
        <p>
          The AutoApply LinkedIn Connector extension has exactly one job: when
          you click <strong>Connect with extension</strong> on the AutoApply
          web app, the extension reads your existing LinkedIn{" "}
          <code>li_at</code> cookie from your browser and passes it to the
          AutoApply web page so it can be sent to our server over HTTPS.
        </p>
        <ul>
          <li>
            The extension <strong>only</strong> requests the{" "}
            <code>cookies</code> permission, and only for{" "}
            <code>linkedin.com</code>.
          </li>
          <li>
            The extension <strong>only</strong> communicates with the
            AutoApply frontend (the domain listed in its manifest). It cannot
            be triggered by any other page.
          </li>
          <li>
            The extension does <strong>not</strong> read tabs, browsing
            history, page content, form data, or any other cookies.
          </li>
          <li>
            The extension does <strong>not</strong> contact any server
            directly — the cookie value passes only through the AutoApply web
            page in the user's own browser session, which forwards it to the
            AutoApply server.
          </li>
        </ul>

        <h2>How data is stored</h2>
        <ul>
          <li>
            Passwords are hashed with Argon2id.
          </li>
          <li>
            The LinkedIn session cookie is encrypted at rest with AES-256-GCM
            using a server-side master key. Plaintext cookies are never
            written to disk or logs.
          </li>
          <li>
            All traffic to and from AutoApply is served over HTTPS / WSS.
          </li>
          <li>
            Data is hosted on Aiven (MySQL) and Cloudflare R2 (object
            storage) in the regions of those providers.
          </li>
        </ul>

        <h2>How data is used</h2>
        <ul>
          <li>
            To sign you in to AutoApply.
          </li>
          <li>
            To authenticate the automation worker as you on LinkedIn so it
            can submit applications.
          </li>
          <li>
            To show you which jobs you have applied to and surface errors.
          </li>
        </ul>
        <p>
          We <strong>do not</strong> sell or share your data with third
          parties for marketing, analytics aggregation, or any non-essential
          purpose.
        </p>

        <h2>How data is shared</h2>
        <p>The only third party that ever sees your LinkedIn cookie is LinkedIn itself —
        as a normal LinkedIn API call from the automation worker. We do not transmit your
        cookie to any other service.</p>

        <h2>Your controls</h2>
        <ul>
          <li>
            <strong>Disconnect LinkedIn at any time</strong> from the
            AutoApply settings page. We immediately overwrite the encrypted
            cookie record.
          </li>
          <li>
            <strong>Delete your account</strong> by emailing{" "}
            <a href="mailto:vashkar@hypernorm.ai">vashkar@hypernorm.ai</a>.
            All account, cookie, and application records are permanently
            removed within 7 days.
          </li>
          <li>
            <strong>Uninstall the extension</strong> from{" "}
            <code>chrome://extensions</code> at any time. Uninstalling
            immediately revokes the extension's access; existing automation
            runs continue using the cookie already on file until you
            disconnect.
          </li>
        </ul>

        <h2>Retention</h2>
        <p>
          We keep account and application data for as long as your account
          is active. We delete it within 7 days of an account deletion
          request. Server access logs are retained for up to 30 days for
          security and abuse investigation.
        </p>

        <h2>Children</h2>
        <p>
          AutoApply is not directed to anyone under 18. We do not knowingly
          collect data from minors.
        </p>

        <h2>Changes to this policy</h2>
        <p>
          If we materially change how we handle data, we will update this
          page and notify users by email at least 14 days before the change
          takes effect.
        </p>

        <h2>Contact</h2>
        <p>
          Questions or concerns?{" "}
          <a href="mailto:vashkar@hypernorm.ai">vashkar@hypernorm.ai</a>
        </p>
      </div>
    </main>
  );
}
