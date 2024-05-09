const ExistingClassCard = ({
  title,
  subtitle,
  text,
}: {
  title?: string;
  subtitle?: string;
  text?: string | number;
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center aspect-square">
      <h4>{title}</h4>
      <p className="text-gray-700">{subtitle}</p>
      <p className="text-gray-700">{text}</p>
    </div>
  );
};

export default ExistingClassCard;
