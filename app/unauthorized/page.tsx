const Unauthorised = () => {
  return (
    <div className="flex flex-col w-full justify-center items-center">
      <h2 className="m-4">
        Oops! You don&apos;t seem to be authorised to carry out this action...
      </h2>
      <p className="text-center">Feel free to try again.</p>
      <p>
        If the problem persists and you think it&apos;s an error, please contact
        support
      </p>
      <p>🤙</p>
    </div>
  );
};
export default Unauthorised;
