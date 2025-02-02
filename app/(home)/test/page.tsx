import React from "react";

const TestPage = async () => {
  await new Promise((resolve) => setTimeout(resolve, 5000));
  return <div>Loading Completed.</div>;
};

export default TestPage;
