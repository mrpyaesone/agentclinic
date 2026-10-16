import type { FeedbackValues, FeedbackErrors, PublicFeedback } from '../feedback.js';

export function FeedbackForm({ values = { name: '', email: '', message: '', rating: '' }, errors = {}, feedback = [] }: {
  values?: FeedbackValues; errors?: FeedbackErrors; feedback?: PublicFeedback[];
}) {
  const fieldProps = (key: keyof FeedbackValues) => ({
    id: key, name: key, required: true,
    'aria-invalid': errors[key] ? 'true' as const : undefined,
    'aria-describedby': errors[key] ? `${key}-error` : undefined,
  });
  const error = (key: keyof FeedbackValues) => errors[key]
    ? <p class="field-error" id={`${key}-error`}>{errors[key]}</p> : null;
  return <>
    <h1>Leave a little feedback</h1>
    <p>Help our fictional clinic care for its next hardworking agent.</p>
    <p>This is demo feedback stored locally. Please use sample contact details. Your name, message, rating, and submission date will be public below. Your email stays private; no email is sent.</p>
    {Object.keys(errors).length > 0 && <section class="error-summary" role="alert" aria-labelledby="feedback-errors">
      <h2 id="feedback-errors">Please check your feedback</h2>
      {errors.form && <p>{errors.form}</p>}
      <ul>{(['name', 'email', 'message', 'rating'] as const).filter(key => errors[key]).map(key =>
        <li><a href={`#${key}`}>{errors[key]}</a></li>)}</ul>
    </section>}
    <form method="post" action="/feedback">
      <p>All fields are required.</p>
      <label for="name">Name (required)</label>
      <input {...fieldProps('name')} type="text" maxlength={100} value={values.name} />{error('name')}
      <label for="email">Email (required)</label>
      <input {...fieldProps('email')} type="text" inputmode="email" maxlength={254} value={values.email} />{error('email')}
      <label for="message">Message (required, up to 2,000 characters)</label>
      <textarea {...fieldProps('message')} maxlength={2000} rows={6}>{values.message}</textarea>{error('message')}
      <label for="rating">Rating (required)</label>
      <select {...fieldProps('rating')}>
        <option value="" selected={values.rating === ''}>Choose a rating</option>
        {['1', '2', '3', '4', '5'].map(rating => <option value={rating} selected={values.rating === rating}>{rating}</option>)}
      </select>{error('rating')}
      <button type="submit">Send feedback</button>
    </form>
    <section aria-labelledby="public-feedback-heading">
      <h2 id="public-feedback-heading">Visitor feedback</h2>
      {feedback.length === 0 ? <p>No feedback yet. Be the first to leave a little care.</p>
        : <div class="record-list">{feedback.map(entry => <article>
          <h3>{entry.name}</h3>
          <p>Rating: {entry.rating} / 5</p>
          <p><time datetime={new Date(entry.created_at).toISOString()}>{new Date(entry.created_at).toISOString().slice(0, 10)} (UTC)</time></p>
          <p class="feedback-message">{entry.message}</p>
        </article>)}</div>}
    </section>
  </>;
}
