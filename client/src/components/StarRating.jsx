import { Star } from "lucide-react";

export default function StarRating({ rating, size = 14, showValue = false }) {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <Star
          key={i}
          size={size}
          fill="#f59e0b"
          stroke="#f59e0b"
          className="star-filled"
        />
      );
    } else if (i === fullStars && hasHalf) {
      stars.push(
        <Star
          key={i}
          size={size}
          fill="#f59e0b"
          stroke="#f59e0b"
          className="star-half"
          style={{ clipPath: "inset(0 50% 0 0)" }}
        />
      );
    } else {
      stars.push(
        <Star
          key={i}
          size={size}
          fill="none"
          stroke="#4b5563"
          className="star-empty"
        />
      );
    }
  }

  return (
    <span className="star-rating">
      {stars}
      {showValue && <span className="star-value">{rating}</span>}
    </span>
  );
}
