import Link from "next/link";

const CardAsLink = ({
  href,
  title,
  subtitle,
  children,
}: {
  href: string;
  title?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) => {
  return (
    <Link
      href={href}
      className="p-6 border w-5/12 md:w-1/4 rounded-lg hover:bg-gray-100 hover:text-black transition"
    >
      <div className="w-full flex flex-col items-center justify-center aspect-square">
        <h4>{title}</h4>
        <p className="text-gray-700">{subtitle}</p>
        {children}
      </div>
    </Link>
  );
};

export default CardAsLink;
