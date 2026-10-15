import { reviews, type Review } from '../reviews.js';

export function Reviews({ entries = reviews }: { entries?: readonly Review[] }) {
  return <>
    <h1>Customer reviews</h1>
    <p>Fictional sample reviews from our imaginary agent patients, shared for this demo.</p>
    <div class="cards">
      {entries.map((review) => <article>
        <h2>{review.name}</h2>
        <p>{review.text}</p>
      </article>)}
    </div>
  </>;
}
