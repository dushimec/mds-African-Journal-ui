import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie } from "lucide-react";

const COOKIE_PREFERENCE_KEY = "majaed-cookie-preference";

type CookiePreference = "accepted" | "declined";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const preference = window.localStorage.getItem(COOKIE_PREFERENCE_KEY) as CookiePreference | null;
    setIsVisible(!preference);
  }, []);

  const savePreference = (preference: CookiePreference) => {
    window.localStorage.setItem(COOKIE_PREFERENCE_KEY, preference);
    setIsVisible(false);
  };

  if (!isVisible) {
    return null;
  }

  return (
    <aside
      className="cookie-consent"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-consent-description"
    >
      <div className="cookie-consent-content">
        <Cookie className="cookie-consent-icon" aria-hidden="true" />
        <p id="cookie-consent-description" className="cookie-consent-message">
          We use cookies to keep the journal website working and improve your experience. Read our{" "}
          <Link to="/privacy-policy" className="cookie-consent-link">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="cookie-consent-actions">
          <button type="button" className="cookie-consent-decline" onClick={() => savePreference("declined")}>
            Decline
          </button>
          <button type="button" className="cookie-consent-accept" onClick={() => savePreference("accepted")}>
            Accept cookies
          </button>
        </div>
      </div>
    </aside>
  );
};

export default CookieConsent;
