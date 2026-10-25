import React, { useState } from 'react';

interface FoodVisualProps {
  imageKey: string;
  alt: string;
  className?: string;
}

export const FoodVisual: React.FC<FoodVisualProps> = ({
  imageKey,
  alt,
  className = 'w-full h-full',
}) => {
  const [imgError, setImgError] = useState(false);

  // Support direct custom URLs if a merchant enters an external or local asset path
  if (
    !imgError &&
    (imageKey.startsWith('http://') ||
      imageKey.startsWith('https://') ||
      imageKey.startsWith('/'))
  ) {
    return (
      <img
        src={imageKey}
        alt={alt}
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
        className={`object-cover ${className}`}
      />
    );
  }

  // Render high-craft culinary illustration tailored to the product type
  const renderArtwork = () => {
    switch (imageKey) {
      case 'hero-feast':
      case 'burger-double':
      case 'burger-truffle':
      case 'burger-classic': {
        const isTruffle = imageKey === 'burger-truffle';
        const isClassic = imageKey === 'burger-classic';
        return (
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            role="img"
            aria-label={alt}
          >
            <defs>
              <radialGradient id={`bg-${imageKey}`} cx="50%" cy="45%" r="65%">
                <stop
                  offset="0%"
                  stopColor={isTruffle ? '#3B2F2F' : '#3E2418'}
                />
                <stop offset="100%" stopColor="#1A1D22" />
              </radialGradient>
              <linearGradient id="bunTop" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" />
                <stop offset="65%" stopColor="#D97706" />
                <stop offset="100%" stopColor="#92400E" />
              </linearGradient>
              <linearGradient id="cheeseGrad" x1="0" y1="0" x2="1" y2="1">
                <stop
                  offset="0%"
                  stopColor={isTruffle ? '#FDE68A' : '#FBBF24'}
                />
                <stop
                  offset="100%"
                  stopColor={isTruffle ? '#D6D3D1' : '#F59E0B'}
                />
              </linearGradient>
            </defs>
            <rect width="400" height="300" fill={`url(#bg-${imageKey})`} />
            {/* Studio rim glow */}
            <circle cx="200" cy="155" r="115" fill="#FF6B35" opacity="0.14" />
            {/* Wooden / Slate serving board */}
            <ellipse cx="200" cy="242" rx="145" ry="24" fill="#111317" />
            <ellipse cx="200" cy="238" rx="135" ry="20" fill="#272B33" />
            {/* Bottom Brioche Bun */}
            <path
              d="M110 212 Q200 228 290 212 L282 232 Q200 245 118 232 Z"
              fill="url(#bunTop)"
            />
            {/* Lower Smash Patty with crispy lace edges */}
            <rect
              x="98"
              y="188"
              width="204"
              height="26"
              rx="13"
              fill="#3E1F14"
            />
            <path
              d="M102 196 Q140 190 180 198 T260 194 T296 198"
              stroke="#241009"
              strokeWidth="4"
              fill="none"
            />
            {/* Melted Cheese Slice */}
            <path
              d="M105 186 L295 186 L275 204 L245 190 L205 212 L165 190 L130 206 Z"
              fill="url(#cheeseGrad)"
            />
            {/* Second Smash Patty (for Double / Truffle) */}
            {!isClassic && (
              <>
                <rect
                  x="102"
                  y="160"
                  width="196"
                  height="26"
                  rx="13"
                  fill="#4A2518"
                />
                <path
                  d="M112 160 L288 160 L265 178 L220 164 L185 182 L145 164 Z"
                  fill="url(#cheeseGrad)"
                />
              </>
            )}
            {/* Fresh Lettuce / Truffle Mushrooms / Pickles */}
            <path
              d="M104 154 Q130 142 155 154 T205 154 T255 154 T296 154"
              stroke={isTruffle ? '#A8A29E' : '#22C55E'}
              strokeWidth="10"
              strokeLinecap="round"
              fill="none"
            />
            {/* Signature Sauce Drizzle */}
            <path
              d="M120 146 Q160 138 200 148 T280 144"
              stroke="#FF6B35"
              strokeWidth="6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Glossy Brioche Crown Bun */}
            <path
              d="M106 144 C106 78, 294 78, 294 144 Z"
              fill="url(#bunTop)"
            />
            {/* Brioche Shine & Sesame Seeds */}
            <ellipse
              cx="175"
              cy="102"
              rx="45"
              ry="14"
              fill="#FEF3C7"
              opacity="0.25"
            />
            <ellipse cx="160" cy="108" rx="5" ry="2.5" fill="#FDE68A" />
            <ellipse cx="185" cy="98" rx="5" ry="2.5" fill="#FDE68A" />
            <ellipse cx="212" cy="106" rx="5" ry="2.5" fill="#FDE68A" />
            <ellipse cx="238" cy="114" rx="5" ry="2.5" fill="#FDE68A" />
            <ellipse cx="142" cy="120" rx="5" ry="2.5" fill="#FDE68A" />
          </svg>
        );
      }

      case 'chicken-spicy':
      case 'chicken-strips': {
        const isStrips = imageKey === 'chicken-strips';
        return (
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            role="img"
            aria-label={alt}
          >
            <defs>
              <radialGradient id="chickenBg" cx="50%" cy="50%" r="65%">
                <stop offset="0%" stopColor="#451A03" />
                <stop offset="100%" stopColor="#1C1917" />
              </radialGradient>
            </defs>
            <rect width="400" height="300" fill="url(#chickenBg)" />
            <circle cx="200" cy="155" r="110" fill="#F97316" opacity="0.16" />
            <ellipse cx="200" cy="235" rx="140" ry="24" fill="#292524" />
            {isStrips ? (
              <>
                {/* Golden Crispy Tenders Basket */}
                <path
                  d="M110 185 Q145 120 185 165 L165 225 L110 215 Z"
                  fill="#F59E0B"
                  stroke="#B45309"
                  strokeWidth="3"
                />
                <path
                  d="M160 175 Q205 105 245 160 L225 228 L160 220 Z"
                  fill="#FBBF24"
                  stroke="#D97706"
                  strokeWidth="3"
                />
                <path
                  d="M215 180 Q260 120 295 170 L275 225 L215 220 Z"
                  fill="#D97706"
                  stroke="#92400E"
                  strokeWidth="3"
                />
                {/* Garlic Toum Dip Ramekin */}
                <ellipse cx="125" cy="222" rx="34" ry="14" fill="#F5F5F4" />
                <ellipse cx="125" cy="219" rx="28" ry="10" fill="#FEFCE8" />
              </>
            ) : (
              <>
                {/* Nashville Hot Chicken Burger */}
                <path
                  d="M112 212 Q200 226 288 212 L280 230 Q200 242 120 230 Z"
                  fill="#D97706"
                />
                {/* Creamy Slaw */}
                <path
                  d="M108 198 Q150 186 200 198 T292 196"
                  stroke="#FDE68A"
                  strokeWidth="10"
                  strokeLinecap="round"
                  fill="none"
                />
                {/* Crunchy Fried Chicken Fillet */}
                <path
                  d="M92 172 Q125 148 165 165 T235 158 T308 172 L292 202 Q200 212 106 202 Z"
                  fill="#EA580C"
                  stroke="#9A3412"
                  strokeWidth="3"
                />
                {/* Pickles & Brioche Crown */}
                <ellipse cx="165" cy="154" rx="22" ry="6" fill="#16A34A" />
                <ellipse cx="235" cy="154" rx="22" ry="6" fill="#16A34A" />
                <path
                  d="M108 148 C108 82, 292 82, 292 148 Z"
                  fill="#F59E0B"
                />
              </>
            )}
          </svg>
        );
      }

      case 'meal-family':
      case 'meal-box':
      case 'sides-fries':
      case 'sides-bites': {
        return (
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            role="img"
            aria-label={alt}
          >
            <rect width="400" height="300" fill="#20252B" />
            <circle cx="200" cy="150" r="120" fill="#FF6B35" opacity="0.15" />
            {/* Signature FOODOO Orange Tray */}
            <rect
              x="75"
              y="185"
              width="250"
              height="60"
              rx="14"
              fill="#FF6B35"
            />
            <rect
              x="85"
              y="175"
              width="230"
              height="20"
              rx="6"
              fill="#FFF7ED"
            />
            {/* Golden Crinkle Fries & Burgers */}
            <rect
              x="105"
              y="105"
              width="16"
              height="75"
              rx="5"
              fill="#FBBF24"
              transform="rotate(-12 105 105)"
            />
            <rect
              x="128"
              y="95"
              width="16"
              height="85"
              rx="5"
              fill="#F59E0B"
              transform="rotate(-4 128 95)"
            />
            <rect
              x="152"
              y="98"
              width="16"
              height="82"
              rx="5"
              fill="#FBBF24"
              transform="rotate(6 152 98)"
            />
            <rect
              x="175"
              y="108"
              width="16"
              height="72"
              rx="5"
              fill="#D97706"
              transform="rotate(14 175 108)"
            />
            {/* Burger / Cheese Bites alongside */}
            <path
              d="M205 165 C205 118, 305 118, 305 165 Z"
              fill="#F59E0B"
            />
            <rect
              x="202"
              y="165"
              width="106"
              height="16"
              rx="8"
              fill="#451A03"
            />
            <path d="M206 165 L304 165 L285 177 L225 177 Z" fill="#FBBF24" />
          </svg>
        );
      }

      case 'drink-mojito':
      case 'drink-cola':
      case 'tea-hibiscus': {
        const isCola = imageKey === 'drink-cola';
        const isHibiscus = imageKey === 'tea-hibiscus';
        const liquidColor = isCola
          ? '#27120B'
          : isHibiscus
          ? '#9F1239'
          : '#F59E0B';
        return (
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            role="img"
            aria-label={alt}
          >
            <rect width="400" height="300" fill="#18181B" />
            <circle
              cx="200"
              cy="150"
              r="110"
              fill={isHibiscus ? '#F43F5E' : '#F59E0B'}
              opacity="0.16"
            />
            {/* Fluted Glass */}
            <path
              d="M145 75 L255 75 L240 245 Q200 255 160 245 Z"
              fill="#FFFFFF"
              opacity="0.12"
              stroke="#E4E4E7"
              strokeWidth="2"
            />
            <path
              d="M149 105 L251 105 L238 242 Q200 250 162 242 Z"
              fill={liquidColor}
              opacity="0.9"
            />
            {/* Ice Cubes & Mint Leaf */}
            <rect
              x="165"
              y="115"
              width="28"
              height="28"
              rx="6"
              fill="#FFFFFF"
              opacity="0.35"
              transform="rotate(12 165 115)"
            />
            <rect
              x="202"
              y="122"
              width="28"
              height="28"
              rx="6"
              fill="#FFFFFF"
              opacity="0.3"
              transform="rotate(-10 202 122)"
            />
            <path
              d="M210 45 L190 225"
              stroke="#FF6B35"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M165 75 C150 52, 185 48, 182 75 Z"
              fill="#10B981"
            />
          </svg>
        );
      }

      case 'coffee-v60':
      case 'coffee-flatwhite':
      case 'coffee-espresso':
      case 'tea-karak': {
        return (
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            role="img"
            aria-label={alt}
          >
            <rect width="400" height="300" fill="#261C16" />
            <circle cx="200" cy="155" r="115" fill="#D97706" opacity="0.18" />
            {/* Ceramic Saucer */}
            <ellipse cx="200" cy="228" rx="115" ry="22" fill="#D6D3D1" />
            <ellipse cx="200" cy="224" rx="85" ry="14" fill="#A8A29E" />
            {/* Cup Handle */}
            <path
              d="M265 145 C305 145, 305 198, 258 198"
              fill="none"
              stroke="#FF6B35"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Ceramic Cup Body */}
            <path
              d="M125 125 L275 125 C272 205, 245 224, 200 224 C155 224, 128 205, 125 125 Z"
              fill="#FF6B35"
            />
            {/* Crema & Rosetta Latte Art */}
            <ellipse cx="200" cy="125" rx="75" ry="22" fill="#F5F5F4" />
            <ellipse cx="200" cy="125" rx="68" ry="18" fill="#92400E" />
            <path
              d="M185 125 C195 112, 205 112, 215 125 C205 136, 195 136, 185 125 Z"
              fill="#FEF3C7"
            />
            <path
              d="M196 118 C200 114, 204 114, 208 118"
              stroke="#FFFBEB"
              strokeWidth="3"
              fill="none"
            />
          </svg>
        );
      }

      case 'iced-spanish':
      case 'iced-pistachio':
      case 'iced-matcha': {
        const isPistachio = imageKey === 'iced-pistachio';
        return (
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            role="img"
            aria-label={alt}
          >
            <rect width="400" height="300" fill="#231F1E" />
            <circle
              cx="200"
              cy="150"
              r="115"
              fill={isPistachio ? '#84CC16' : '#D97706'}
              opacity="0.16"
            />
            {/* Ribbed Specialty Glass */}
            <rect
              x="142"
              y="68"
              width="116"
              height="176"
              rx="16"
              fill="#F5F5F4"
              opacity="0.15"
              stroke="#E7E5E4"
              strokeWidth="2"
            />
            {/* Bottom Milk / Pistachio Cream Layer */}
            <path
              d="M145 145 L255 145 L255 232 Q200 244 145 232 Z"
              fill={isPistachio ? '#BEF264' : '#FDE68A'}
              opacity="0.92"
            />
            {/* Top Espresso Crema Layer */}
            <path
              d="M145 86 L255 86 L255 152 Q200 162 145 152 Z"
              fill="#572814"
            />
            {/* Cold Foam Crown */}
            <ellipse
              cx="200"
              cy="86"
              rx="55"
              ry="12"
              fill={isPistachio ? '#ECFCCB' : '#FFFBEB'}
            />
            {/* Glass Straw */}
            <path
              d="M225 42 L185 220"
              stroke="#FFFFFF"
              strokeWidth="7"
              strokeLinecap="round"
              opacity="0.7"
            />
          </svg>
        );
      }

      default: {
        // Desserts & Bakery (San Sebastian Cheesecake, Saffron Cake, Pistachio Croissant, Berry Danish)
        return (
          <svg
            viewBox="0 0 400 300"
            className="w-full h-full"
            role="img"
            aria-label={alt}
          >
            <rect width="400" height="300" fill="#29211E" />
            <circle cx="200" cy="155" r="115" fill="#F59E0B" opacity="0.16" />
            {/* Artisanal Ceramic Plate */}
            <ellipse cx="200" cy="220" rx="140" ry="28" fill="#E7E5E4" />
            <ellipse cx="200" cy="216" rx="112" ry="20" fill="#F5F5F4" />
            {/* Golden Baked Pastry / Cheesecake Wedge */}
            <path
              d="M130 198 L255 142 L272 208 L130 212 Z"
              fill="#FDE68A"
            />
            {/* Burnt Basque Top / Chocolate or Saffron Glaze */}
            <path
              d="M130 198 L255 142 L220 120 L118 175 Z"
              fill="#92400E"
            />
            <path
              d="M155 168 Q195 145 235 165 T250 195"
              stroke="#451A03"
              strokeWidth="8"
              strokeLinecap="round"
              fill="none"
            />
            {/* Pistachio / Saffron Garnish */}
            <circle cx="195" cy="155" r="5" fill="#84CC16" />
            <circle cx="212" cy="148" r="4" fill="#84CC16" />
            <circle cx="180" cy="164" r="4" fill="#EF4444" />
          </svg>
        );
      }
    }
  };

  return (
    <div className={`relative overflow-hidden bg-[#20252B] ${className}`}>
      {renderArtwork()}
    </div>
  );
};
