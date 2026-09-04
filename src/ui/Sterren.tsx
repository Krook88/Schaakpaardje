export function Sterren({ aantal, van = 3, groot = false }: { aantal: number; van?: number; groot?: boolean }) {
  return (
    <span
      aria-label={`${aantal} van de ${van} sterren`}
      style={{ fontSize: groot ? '2rem' : '1rem', letterSpacing: '2px', lineHeight: 1 }}
    >
      {Array.from({ length: van }, (_, i) => (
        <span key={i} aria-hidden="true" style={{ opacity: i < aantal ? 1 : 0.25 }}>
          ⭐
        </span>
      ))}
    </span>
  )
}
