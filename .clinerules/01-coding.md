1) Always declare TypeScript objects as like:
const/let/var objectName: ObjectType = { properties ...}
2) Never declare TypeScript objects like:
const/let/var objectName = { properties ...} as ObjectType
3) When tests are failing always add debug messages until it very obvious where is the error.
4) Never remove the debug messages until the problem is fixed.
5) Never remove the debug messages until a refactoring is complete.
6) Avoid creating duplicated constants which reference object attributes.
7) Always write the tests first then the implementation. The tests should generally fail before the implementation. If the tests do not fail explain why before continuing with the implemeantation and wait for a confirmation.
8) When inner objects are required inside another TypeScript object initialize the inner object independenty as step 1) and assign it separately.