import { describe, it } from "node:test";
import assert from "node:assert";
import { toSnake, kebabToCamel, snakeToCamel } from "../index.js";

describe("utils", () => {
    describe("snakeToCamel", () => {
        it("convert snake to camel", () => {
            assert.equal(snakeToCamel("a_snake_case_string"), "aSnakeCaseString");
        });
        it("leave camel strings untouched", () => {
            assert.equal(kebabToCamel("aCamelCaseString"), "aCamelCaseString");
        });
    });

    describe("kebabToCamel", () => {
        it("convert kebab to camel", () => {
            assert.equal(kebabToCamel("an-arbitrary-kebab-case-string"), "anArbitraryKebabCaseString");
        });

        it("leave camel strings untouched", () => {
            assert.equal(kebabToCamel("aCamelCaseString"), "aCamelCaseString");
        });
    });

    describe("toSnake", () => {
        it("convert camel string to snake", () => {
            assert.equal(toSnake("aCamelCaseString"), "a_camel_case_string");
        });

        it("convert kebab strings to snake", () => {
            assert.equal(toSnake("an-arbitrary-kebab-case-string"), "an_arbitrary_kebab_case_string");
        })

        it("leave snake strings untouched", () => {
            assert.equal(toSnake("a_snake_case_string"), "a_snake_case_string");
        });
    })
})