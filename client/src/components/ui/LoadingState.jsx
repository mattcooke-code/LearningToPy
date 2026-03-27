import { Spinner } from "../ui";

const LoadingState = ({
  message = "Loading...",
  height = "h-64",
  spinnerSize = "md",
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className={`flex justify-center items-center ${height}`}>
        <Spinner
          size={spinnerSize}
          color="gray"
          showText={true}
          text={message}
        />
      </div>
    </div>
  );
};

export default LoadingState;
