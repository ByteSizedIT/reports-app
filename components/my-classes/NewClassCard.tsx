import React from "react";

import { FaPlus } from "react-icons/fa";

const NewClassCard = ({
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
      <FaPlus className="text-green-700 text-2xl sm:text-3xl " />
    </div>
  );
};

export default NewClassCard;
