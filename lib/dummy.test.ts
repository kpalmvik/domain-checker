import { sum } from "./dummy";

describe("dummy", () => {
  it("returns a string with the summed numbers", () => {
    expect(sum(1, 2)).toBe("The sum is 3");
  });
});
