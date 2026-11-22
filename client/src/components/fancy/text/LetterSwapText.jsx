import "./letter-swap.css";

function LetterSwapText({
  label,
  className = "",
  staggerFrom = "first",
  reverse = false,
  variant = "forward",
}) {
  const characters = Array.from(label);
  const delayIndex = (index) => {
    if (staggerFrom === "last") return characters.length - index - 1;
    if (staggerFrom === "center") {
      return Math.abs(Math.floor(characters.length / 2) - index);
    }
    return index;
  };
  const exitDirection = reverse ? "100%" : "-100%";
  const enterDirection = reverse ? "-100%" : "100%";
  let index = 0;

  return (
    <span className={`letter-swap letter-swap--${variant} ${className}`}>
      <span className="sr-only">{label}</span>
      <span aria-hidden="true">
        {label.split(" ").map((word, wordIndex, words) => (
          <span key={`${word}-${wordIndex}`}>
            <span className="letter-swap__word">
              {Array.from(word).map((character) => {
                const characterIndex = index++;
                return (
                  <span
                    className="letter-swap__cell"
                    key={`${character}-${characterIndex}`}
                    style={{
                      "--swap-exit": exitDirection,
                      "--swap-enter": enterDirection,
                      "--swap-delay": `${delayIndex(characterIndex) * 18}ms`,
                    }}
                  >
                    <span className="letter-swap__face">{character}</span>
                    <span className="letter-swap__face letter-swap__face--next">
                      {character}
                    </span>
                  </span>
                );
              })}
            </span>
            {wordIndex < words.length - 1 && " "}
          </span>
        ))}
      </span>
    </span>
  );
}

export function LetterSwapForward(props) {
  return <LetterSwapText {...props} variant="forward" />;
}

export function LetterSwapPingPong(props) {
  return <LetterSwapText {...props} variant="pingpong" />;
}
