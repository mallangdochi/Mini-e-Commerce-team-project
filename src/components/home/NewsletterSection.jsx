import { useState } from 'react';

import '@/styles/newsletter.css';

function NewsletterSection({ data, isLoading = false, error = null }) {
  const [email, setEmail] = useState('');

  const backgroundImageUrl = data?.backgroundImageUrl ?? '';

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    setEmail('');
  };

  return (
    <section
      className={`newsletter-section ${isLoading ? 'newsletter-section--loading' : ''}`}
      style={
        !isLoading && !error && backgroundImageUrl
          ? {
              backgroundImage: `url("${backgroundImageUrl}")`,
            }
          : undefined
      }
    >
      {isLoading && <div className="newsletter-section__skeleton" />}

      {!isLoading && error && (
        <div className="newsletter-section__state">
          <p>뉴스레터 이미지를 불러오지 못했습니다.</p>
          <span>잠시 후 다시 시도해주세요.</span>
        </div>
      )}

      {!isLoading && !error && (
        <div className="newsletter-section__overlay">
          <div className="newsletter-section__panel">
            <div className="newsletter-section__content">
              <h2 className="newsletter-section__title">STAY IN THE LOOP</h2>

              <p className="newsletter-section__description">
                Sign up for the ARC newsletter and receive updates on new collections,
                collaborations, events, and exclusive benefits.
              </p>

              <form className="newsletter-section__form" onSubmit={handleSubmit}>
                <label htmlFor="newsletter-email">Email address</label>

                <input
                  id="newsletter-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />

                <button type="submit">SUBSCRIBE</button>
              </form>
            </div>

            <p className="newsletter-section__privacy">
              We will never share your email with anyone else.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

export default NewsletterSection;
