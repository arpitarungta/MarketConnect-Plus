import React from "react";

export default function StarRating({ rating, setRating }) {
  return (
    <div>
      {[1,2,3,4,5].map(star => (
        <span
          key={star}
          style={{
            fontSize: 22,
            cursor: "pointer",
            color: star <= rating ? "#FFD700" : "#ccc"
          }}
          onClick={() => setRating(star)}
        >
          ★
        </span>
      ))}
    </div>
  );
}