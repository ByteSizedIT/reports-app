const ExistingClassCard = ({
  title,
  subtitle,
}: {
  title?: string;
  subtitle?: string;
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center aspect-square">
      <h4>{title}</h4>
      <p className="text-gray-700">{subtitle}</p>
    </div>
  );
};

export default ExistingClassCard;
