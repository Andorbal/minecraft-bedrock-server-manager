import snakeCase from "./snakeCase.mjs";

test.each([
  ["foo", "foo"],
  ["Foo", "foo"],
  ["foo bar", "foo_bar"],
  ["Foo Bar", "foo_bar"],
  ["FooBar", "foo_bar"],
])("should change %p to %p", (input, expected) => {
  const result = snakeCase(input);
  expect(result).toBe(expected);
});
