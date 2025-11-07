import { describe, it, expect } from "vitest";
import { levenshtein } from "./levenshtein";
import { levenshteinReference } from "./levenshtein_reference";

describe("levenshtein", () => {
  it("should return 0 for identical strings", () => {
    expect(levenshtein("hello", "hello")).toBe(0);
    expect(levenshtein("", "")).toBe(0);
    expect(levenshtein("test", "test")).toBe(0);
  });

  it("should return the length of the non-empty string when one string is empty", () => {
    expect(levenshtein("", "hello")).toBe(5);
    expect(levenshtein("hello", "")).toBe(5);
    expect(levenshtein("", "a")).toBe(1);
    expect(levenshtein("a", "")).toBe(1);
  });

  it("should calculate distance for single character operations", () => {
    // Single insertion
    expect(levenshtein("cat", "cats")).toBe(1);

    // Single deletion
    expect(levenshtein("cats", "cat")).toBe(1);

    // Single substitution
    expect(levenshtein("cat", "bat")).toBe(1);
  });

  it("should calculate distance for multiple operations", () => {
    expect(levenshtein("kitten", "sitting")).toBe(3);
    expect(levenshtein("saturday", "sunday")).toBe(3);
    expect(levenshtein("flaw", "lawn")).toBe(2);
  });

  it("should handle completely different strings", () => {
    expect(levenshtein("abc", "xyz")).toBe(3);
    expect(levenshtein("hello", "world")).toBe(4);
  });

  it("should be case sensitive", () => {
    expect(levenshtein("Hello", "hello")).toBe(1);
    expect(levenshtein("HELLO", "hello")).toBe(5);
  });

  it("should handle strings with special characters", () => {
    expect(levenshtein("hello!", "hello")).toBe(1);
    expect(levenshtein("test@123", "test#123")).toBe(1);
    expect(levenshtein("a b c", "abc")).toBe(2);
  });

  it("should handle unicode characters", () => {
    expect(levenshtein("café", "cafe")).toBe(1);
    expect(levenshtein("😀", "😁")).toBe(1);
    expect(levenshtein("hello", "héllo")).toBe(1);
  });

  it("should be symmetric", () => {
    expect(levenshtein("abc", "def")).toBe(levenshtein("def", "abc"));
    expect(levenshtein("kitten", "sitting")).toBe(
      levenshtein("sitting", "kitten"),
    );
  });

  it("should handle long strings", () => {
    const str1 = "the quick brown fox jumps over the lazy dog";
    const str2 = "the quick brown fox jumped over the lazy cat";
    expect(levenshtein(str1, str2)).toBe(5);
  });
});

describe("levenshtein - fuzz tests", () => {
  // Helper function to generate random strings
  function randomString(length: number, charset: string): string {
    let result = "";
    for (let i = 0; i < length; i++) {
      result += charset[Math.floor(Math.random() * charset.length)];
    }
    return result;
  }

  // Helper function to generate random ASCII string
  function randomAsciiString(length: number): string {
    const chars =
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return randomString(length, chars);
  }

  // Helper function to generate random unicode string
  function randomUnicodeString(length: number): string {
    const chars = "abcéñ😀😁🎉café世界привет";
    return randomString(length, chars);
  }

  // Helper function to apply random mutations to a string
  function mutateString(str: string, mutations: number): string {
    let result = str;
    for (let i = 0; i < mutations; i++) {
      const operation = Math.floor(Math.random() * 3);
      const pos = Math.floor(Math.random() * (result.length + 1));

      switch (operation) {
        case 0: // Insert
          const charToInsert = String.fromCharCode(
            97 + Math.floor(Math.random() * 26),
          );
          result = result.slice(0, pos) + charToInsert + result.slice(pos);
          break;
        case 1: // Delete
          if (result.length > 0) {
            const delPos = Math.floor(Math.random() * result.length);
            result = result.slice(0, delPos) + result.slice(delPos + 1);
          }
          break;
        case 2: // Substitute
          if (result.length > 0) {
            const subPos = Math.floor(Math.random() * result.length);
            const newChar = String.fromCharCode(
              97 + Math.floor(Math.random() * 26),
            );
            result =
              result.slice(0, subPos) + newChar + result.slice(subPos + 1);
          }
          break;
      }
    }
    return result;
  }

  describe("random ASCII strings", () => {
    it("should match reference implementation for 100 random short string pairs", () => {
      for (let i = 0; i < 100; i++) {
        const len1 = Math.floor(Math.random() * 20);
        const len2 = Math.floor(Math.random() * 20);
        const str1 = randomAsciiString(len1);
        const str2 = randomAsciiString(len2);

        const result = levenshtein(str1, str2);
        const expected = levenshteinReference(str1, str2);

        expect(result).toBe(expected);
      }
    });

    it("should match reference implementation for 50 random medium string pairs", () => {
      for (let i = 0; i < 50; i++) {
        const len1 = Math.floor(Math.random() * 50) + 20;
        const len2 = Math.floor(Math.random() * 50) + 20;
        const str1 = randomAsciiString(len1);
        const str2 = randomAsciiString(len2);

        const result = levenshtein(str1, str2);
        const expected = levenshteinReference(str1, str2);

        expect(result).toBe(expected);
      }
    });

    it("should match reference implementation for 20 random long string pairs", () => {
      for (let i = 0; i < 20; i++) {
        const len1 = Math.floor(Math.random() * 100) + 50;
        const len2 = Math.floor(Math.random() * 100) + 50;
        const str1 = randomAsciiString(len1);
        const str2 = randomAsciiString(len2);

        const result = levenshtein(str1, str2);
        const expected = levenshteinReference(str1, str2);

        expect(result).toBe(expected);
      }
    });
  });

  describe("random unicode strings", () => {
    it("should match reference implementation for 50 random unicode string pairs", () => {
      for (let i = 0; i < 50; i++) {
        const len1 = Math.floor(Math.random() * 20);
        const len2 = Math.floor(Math.random() * 20);
        const str1 = randomUnicodeString(len1);
        const str2 = randomUnicodeString(len2);

        const result = levenshtein(str1, str2);
        const expected = levenshteinReference(str1, str2);

        expect(result).toBe(expected);
      }
    });
  });

  describe("mutation-based fuzzing", () => {
    it("should match reference for strings with small mutations", () => {
      for (let i = 0; i < 50; i++) {
        const baseStr = randomAsciiString(20);
        const mutations = Math.floor(Math.random() * 5) + 1;
        const mutatedStr = mutateString(baseStr, mutations);

        const result = levenshtein(baseStr, mutatedStr);
        const expected = levenshteinReference(baseStr, mutatedStr);

        expect(result).toBe(expected);
      }
    });

    it("should match reference for strings with large mutations", () => {
      for (let i = 0; i < 30; i++) {
        const baseStr = randomAsciiString(30);
        const mutations = Math.floor(Math.random() * 15) + 10;
        const mutatedStr = mutateString(baseStr, mutations);

        const result = levenshtein(baseStr, mutatedStr);
        const expected = levenshteinReference(baseStr, mutatedStr);

        expect(result).toBe(expected);
      }
    });
  });

  describe("edge cases", () => {
    it("should match reference for empty and non-empty strings", () => {
      for (let i = 0; i < 20; i++) {
        const str = randomAsciiString(Math.floor(Math.random() * 50));

        expect(levenshtein("", str)).toBe(levenshteinReference("", str));
        expect(levenshtein(str, "")).toBe(levenshteinReference(str, ""));
      }
    });

    it("should match reference for identical strings", () => {
      for (let i = 0; i < 20; i++) {
        const str = randomAsciiString(Math.floor(Math.random() * 50));

        expect(levenshtein(str, str)).toBe(levenshteinReference(str, str));
      }
    });

    it("should match reference for strings with repeated characters", () => {
      for (let i = 0; i < 20; i++) {
        const char = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        const len1 = Math.floor(Math.random() * 30) + 1;
        const len2 = Math.floor(Math.random() * 30) + 1;
        const str1 = char.repeat(len1);
        const str2 = char.repeat(len2);

        expect(levenshtein(str1, str2)).toBe(levenshteinReference(str1, str2));
      }
    });

    it("should match reference for single character differences", () => {
      for (let i = 0; i < 30; i++) {
        const str1 = randomAsciiString(20);
        const pos = Math.floor(Math.random() * str1.length);
        const newChar = String.fromCharCode(
          97 + Math.floor(Math.random() * 26),
        );
        const str2 = str1.slice(0, pos) + newChar + str1.slice(pos + 1);

        expect(levenshtein(str1, str2)).toBe(levenshteinReference(str1, str2));
      }
    });
  });

  describe("property-based tests", () => {
    it("distance should be 0 for identical strings", () => {
      for (let i = 0; i < 20; i++) {
        const str = randomAsciiString(Math.floor(Math.random() * 30));
        expect(levenshtein(str, str)).toBe(0);
      }
    });

    it("distance should be symmetric", () => {
      for (let i = 0; i < 50; i++) {
        const str1 = randomAsciiString(Math.floor(Math.random() * 20));
        const str2 = randomAsciiString(Math.floor(Math.random() * 20));

        expect(levenshtein(str1, str2)).toBe(levenshtein(str2, str1));
      }
    });

    it("distance should satisfy triangle inequality", () => {
      for (let i = 0; i < 30; i++) {
        const str1 = randomAsciiString(Math.floor(Math.random() * 15));
        const str2 = randomAsciiString(Math.floor(Math.random() * 15));
        const str3 = randomAsciiString(Math.floor(Math.random() * 15));

        const dist12 = levenshtein(str1, str2);
        const dist23 = levenshtein(str2, str3);
        const dist13 = levenshtein(str1, str3);

        expect(dist13).toBeLessThanOrEqual(dist12 + dist23);
      }
    });

    it("distance should not exceed maximum of string lengths", () => {
      for (let i = 0; i < 50; i++) {
        const str1 = randomAsciiString(Math.floor(Math.random() * 30));
        const str2 = randomAsciiString(Math.floor(Math.random() * 30));

        const distance = levenshtein(str1, str2);
        const maxLen = Math.max(str1.length, str2.length);

        expect(distance).toBeLessThanOrEqual(maxLen);
      }
    });

    it("distance should be at least the difference in lengths", () => {
      for (let i = 0; i < 50; i++) {
        const str1 = randomAsciiString(Math.floor(Math.random() * 30));
        const str2 = randomAsciiString(Math.floor(Math.random() * 30));

        const distance = levenshtein(str1, str2);
        const lengthDiff = Math.abs(str1.length - str2.length);

        expect(distance).toBeGreaterThanOrEqual(lengthDiff);
      }
    });
  });

  describe("special character sets", () => {
    it("should match reference for strings with spaces and punctuation", () => {
      for (let i = 0; i < 30; i++) {
        const chars = "abc def!@# .,;";
        const len1 = Math.floor(Math.random() * 20) + 1;
        const len2 = Math.floor(Math.random() * 20) + 1;
        const str1 = randomString(len1, chars);
        const str2 = randomString(len2, chars);

        expect(levenshtein(str1, str2)).toBe(levenshteinReference(str1, str2));
      }
    });

    it("should match reference for strings with numbers", () => {
      for (let i = 0; i < 30; i++) {
        const chars = "0123456789";
        const len1 = Math.floor(Math.random() * 20) + 1;
        const len2 = Math.floor(Math.random() * 20) + 1;
        const str1 = randomString(len1, chars);
        const str2 = randomString(len2, chars);

        expect(levenshtein(str1, str2)).toBe(levenshteinReference(str1, str2));
      }
    });

    it("should match reference for mixed case strings", () => {
      for (let i = 0; i < 30; i++) {
        const chars = "aAbBcCdDeEfF";
        const len1 = Math.floor(Math.random() * 20) + 1;
        const len2 = Math.floor(Math.random() * 20) + 1;
        const str1 = randomString(len1, chars);
        const str2 = randomString(len2, chars);

        expect(levenshtein(str1, str2)).toBe(levenshteinReference(str1, str2));
      }
    });
  });
});
