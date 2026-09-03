import { useState } from 'react';

import '@/styles/newsletter.css';

function NewsletterSection({ backgroundImageUrl = '' }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setEmail('');
  };

  return (
    <section
      className="newsletter-section"
      style={
        backgroundImageUrl
          ? {
              backgroundImage: `url("${backgroundImageUrl}")`,
            }
          : undefined
      }
    >
      <div className="newsletter-section__overlay">
        <div className="newsletter-section__panel">
          <div className="newsletter-section__content">
            <h2 className="newsletter-section__title">STAY IN THE LOOP</h2>

            <p className="newsletter-section__description">
              Sign up for the ARC newsletter and receive updates on new collections, collaborations,
              events, and exclusive benefits.
            </p>

            <form className="newsletter-section__form" onSubmit={handleSubmit}>
              <label htmlFor="newsletter-email">Email address</label>

              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder=""
              />

              <button type="submit">SUBSCRIBE</button>
            </form>
          </div>

          <p className="newsletter-section__privacy">
            We will never share your email with anyone else.
          </p>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
