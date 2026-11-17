import React from "react";
import { Box, Link, Typography } from "@mui/material";

/**
 * Fill these in before submitting to the App Store / Google Play
 * (see the Phase 0 checklist). Shown verbatim on the page.
 */
export const PRIVACY_OPERATOR = ""; // e.g. "Firstname Lastname" or company name
export const PRIVACY_CONTACT_EMAIL = ""; // an address you read
const LAST_UPDATED = "17 November 2026";

const missing = "[to be filled in]";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box component="section" sx={{ display: "grid", gap: 1 }}>
      <Typography variant="h6" component="h2">
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/** Public privacy policy (route /privacy), linked from Settings, login and the store listings. */
export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <Box sx={{ maxWidth: 720, mx: "auto", px: 2, py: 4, display: "grid", gap: 3, lineHeight: 1.6 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Privacy policy
          </Typography>
          <Typography color="text.secondary">Polar Chess · last updated {LAST_UPDATED}</Typography>
        </Box>

        <Typography>
          Polar Chess is a chess opening trainer at polarchess.com and in the Polar Chess apps. It is run by{" "}
          {PRIVACY_OPERATOR || missing}. This page explains what data the service stores, why, and how to delete it.
        </Typography>

        <Section title="What we store">
          <Typography component="ul" sx={{ m: 0, pl: 3 }}>
            <li>Your username and your password, stored only as a salted hash (bcrypt). We never see your password.</li>
            <li>The courses you add: built-in courses, PGN files you upload and Lichess studies you import.</li>
            <li>
              Your practice history: which positions you were shown, the move you played, whether it was correct, how
              long you took and when.
            </li>
            <li>Estimates of how well you know each position, calculated from your practice history.</li>
            <li>Your settings, such as rating range and allowed mistakes.</li>
          </Typography>
          <Typography>
            We do not collect your name, email address, location, contacts or device identifiers, and the app does not
            use advertising or third-party tracking.
          </Typography>
        </Section>

        <Section title="Why">
          <Typography>
            Only to run the trainer: to log you in, show your courses, choose which positions to practise next and
            measure your progress. We do not sell or share your data, and we do not use it for advertising.
          </Typography>
        </Section>

        <Section title="Services we use">
          <Typography component="ul" sx={{ m: 0, pl: 3 }}>
            <li>DigitalOcean hosts the server and database that store the data above.</li>
            <li>Vercel serves the website.</li>
            <li>
              Lichess: chess positions (not your account details) are sent to the Lichess opening explorer for move
              statistics, and studies you choose to import are fetched from Lichess.
            </li>
          </Typography>
        </Section>

        <Section title="How long we keep it">
          <Typography>
            Until you delete your account. Database backups are kept for 14 days, so deleted data disappears from
            backups within 14 days.
          </Typography>
        </Section>

        <Section title="Deleting your account">
          <Typography>
            In the app, open Settings and choose <b>Delete my account</b>. This permanently deletes your login,
            courses and practice history. You can also email us and we will delete it for you.
          </Typography>
        </Section>

        <Section title="Your rights">
          <Typography>
            You can ask for a copy of your data, ask us to correct or delete it, and complain to your data protection
            authority (in Norway: Datatilsynet). Contact:{" "}
            {PRIVACY_CONTACT_EMAIL ? (
              <Link href={`mailto:${PRIVACY_CONTACT_EMAIL}`}>{PRIVACY_CONTACT_EMAIL}</Link>
            ) : (
              missing
            )}
            .
          </Typography>
        </Section>

        <Typography variant="body2" color="text.secondary">
          <Link href="/">Back to Polar Chess</Link>
        </Typography>
      </Box>
    </Box>
  );
}
