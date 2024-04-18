"use client";

import Link from "next/link";

const error = () => {
  return (
    <div className="flex flex-col w-full justify-center items-center">
      <h2 className="m-4">Oops! Something went wrong...</h2>
      <p className="text-center">
        Return <Link href="/">Home</Link> and try again
      </p>
      <p className="text-center">
        If the problem persists and you think it&apos;s an error, please contact
        support
      </p>
      <p className="text-center">🤙</p>
    </div>
  );
};
export default error;
