import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { TripTicket } from "./TripTicket";

test("ticket hides empty fields and renders loading and error states", () => {
  const ticket = renderToStaticMarkup(<TripTicket kind="Hotel stay" place="A very long hotel name" time="19:35" date="Fri 13 Nov" fields={[{ label: "Guests", value: "2 adults" }, { label: "Reference", value: "" }]} />);
  expect(ticket).toContain("A very long hotel name");
  expect(ticket).toContain("2 adults");
  expect(ticket).not.toContain("Reference");
  expect(ticket).toContain("Image unavailable");
  expect(renderToStaticMarkup(<TripTicket kind="Hotel stay" state="loading" />)).toContain('aria-busy="true"');
  expect(renderToStaticMarkup(<TripTicket kind="Hotel stay" state="error" />)).toContain('role="alert"');
});
