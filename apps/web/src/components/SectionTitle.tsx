interface SectionTitleProps {
  title: string;
  className?: string;
}

export default function SectionTitle({ title, className = "" }: SectionTitleProps) {
  return (
    <h2
      className={`w-fit text-3xl mt-12 bg-gradient-to-r from-[var(--color-muse-sky-blue)] to-[var(--color-muse-pink)] bg-clip-text text-transparent font-[family-name:var(--font-protest-strike)] ${className}`}
    >
      {title}
    </h2>
  );
}
