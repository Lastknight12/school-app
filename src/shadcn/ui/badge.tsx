interface Props {
  name: string;
  background?: string;
  textColor?: string;
  className?: string;
  onClick?: (name: string) => void;
}

export default function Badge({
  name,
  background = "#000",
  textColor = "#fff",
  className,
  onClick,
}: Props) {
  return (
    <div
      onClick={() => onClick?.(name)}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-clip-border !bg-cover !bg-center font-medium ${className}`}
      style={{
        background: background,
        color: textColor,
      }}
    >
      <h1
        className="!bg-clip-text text-transparent !bg-cover !bg-center font-bold"
        style={{ background: textColor }}
      >
        {name}
      </h1>
    </div>
  );
}
