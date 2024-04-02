import { render, screen } from "@testing-library/react";

import OverdueSalesTable from "./OverdueSalesTable";

describe("renders overdue sales table", () => {
  it("should show a table", async () => {
    render(<OverdueSalesTable />);

    const tableElement = await screen.findByRole("table");
    expect(tableElement).toBeInTheDocument();

    const orderIdElement = await screen.findByText("ORDER ID");
    expect(orderIdElement).toBeInTheDocument();
  });
});
