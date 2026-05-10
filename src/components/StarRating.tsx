import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  onRatingChange?: (rating: number) => void;
  interactive?: boolean;
  size?: number;
}

export default function StarRating({ 
  rating, 
  maxRating = 5, 
  onRatingChange, 
  interactive = false,
  size = 20 
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, i) => {
        const starValue = i + 1;
        const isActive = starValue <= (hoverRating || rating);
        
        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onRatingChange?.(starValue)}
            className={`transition-all transform ${interactive ? 'hover:scale-125 active:scale-95' : 'cursor-default'}`}
          >
            <Star
              size={size}
              className={`${
                isActive 
                  ? 'fill-yellow-500 text-yellow-500 scale-100' 
                  : 'text-gray-600 scale-90'
              } transition-all duration-200`}
            />
          </button>
        );
      })}
    </div>
  );
}
