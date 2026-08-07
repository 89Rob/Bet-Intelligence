function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-[var(--shadow)] ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
