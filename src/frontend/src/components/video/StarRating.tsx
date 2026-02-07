import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const handleMouseEnter = (rating: number) => {
    if (!readonly) {
      setHoverValue(rating);
    }
  };

  const handleMouseLeave = () => {
    setHoverValue(null);
  };

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-0.5">
      {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((rating) => {
        const starIndex = Math.ceil(rating);
        const isHalf = rating % 1 !== 0;
        const isFilled = displayValue >= rating;
        const isPartiallyFilled = !isHalf && displayValue >= rating - 0.5 && displayValue < rating;

        return (
          <button
            key={rating}
            type="button"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => handleMouseEnter(rating)}
            onMouseLeave={handleMouseLeave}
            disabled={readonly}
            className={`relative ${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110'} transition-transform`}
            style={{ width: isHalf ? '0.5em' : '1em', overflow: 'hidden' }}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled || isPartiallyFilled
                  ? 'fill-accent-orange text-accent-orange'
                  : 'fill-none text-muted-foreground'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
