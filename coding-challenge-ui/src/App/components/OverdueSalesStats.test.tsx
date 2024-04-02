import { render, screen } from "@testing-library/react";

import OverdueSalesStats from "./OverdueSalesStats";

describe("renders overdue sales stats component", () => {
  it("should show a title", () => {
    render(<OverdueSalesStats />);

    const titleElement = screen.getByText("All Orders");
    expect(titleElement).toBeInTheDocument();
  });
});
