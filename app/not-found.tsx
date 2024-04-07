import Link from "next/link";

export default async function NotFound() {
  return (
    <div className="flex flex-col w-full justify-center items-center">
      <h2 className="m-4">Oops! This page could not be found...</h2>
      <p className="text-center">
        Return to <Link href="/my-classes">myClasses</Link> and try again
      </p>
      <p>
        If the problem persists and you think it&apos;s an error, please contact
        support
      </p>
      <p>🤙</p>
    </div>
  );
}
