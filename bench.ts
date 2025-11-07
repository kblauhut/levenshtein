import { levenshtein } from "./levenshtein";
import fastLevenshtein from "fast-levenshtein";
import fastestLevenshtein from "fastest-levenshtein";
import jsLevenshtein from "js-levenshtein";
import leven from "leven";

// Generate a random string of given length
function generateRandomString(length: number): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Benchmark a single implementation
function benchmark(
  name: string,
  fn: (a: string, b: string) => number,
  str1: string,
  str2: string,
  iterations: number = 10000,
): { nsPerOp: number; opsPerSec: number } {
  // Warmup
  for (let i = 0; i < 100; i++) {
    fn(str1, str2);
  }

  // Actual benchmark
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    fn(str1, str2);
  }
  const end = performance.now();

  const totalMs = end - start;
  const totalNs = totalMs * 1_000_000;
  const nsPerOp = totalNs / iterations;
  const opsPerSec = (iterations / totalMs) * 1000;

  return { nsPerOp, opsPerSec };
}

// Format number with thousands separator
function formatNumber(num: number): string {
  return num.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

// Main benchmark runner
function runBenchmarks() {
  const stringLengths = [4, 8, 16, 32, 64, 128, 248, 512];
  const implementations: Array<{
    name: string;
    fn: (a: string, b: string) => number;
  }> = [
    { name: "levenshtein (custom)", fn: levenshtein },
    { name: "fast-levenshtein", fn: (a, b) => fastLevenshtein.get(a, b) },
    { name: "fastest-levenshtein", fn: fastestLevenshtein.distance },
    { name: "js-levenshtein", fn: jsLevenshtein },
    { name: "leven", fn: leven },
  ];

  console.log("Levenshtein Distance Benchmarks");
  console.log("================================\n");

  for (const length of stringLengths) {
    console.log(`\nString Length: ${length}`);
    console.log("-".repeat(80));

    // Generate test strings
    const str1 = generateRandomString(length);
    const str2 = generateRandomString(length);

    // Adjust iterations based on string length to keep benchmark time reasonable
    let iterations = 10000;
    if (length >= 128) iterations = 1000;
    if (length >= 256) iterations = 500;

    for (const impl of implementations) {
      try {
        const result = benchmark(impl.name, impl.fn, str1, str2, iterations);
        console.log(
          `${impl.name.padEnd(25)} ${formatNumber(result.nsPerOp).padStart(12)} ns/op  ${formatNumber(result.opsPerSec).padStart(15)} ops/s`,
        );
      } catch (error) {
        console.log(`${impl.name.padEnd(25)} ERROR: ${error}`);
      }
    }
  }

  console.log("\n");
}

// Run the benchmarks
runBenchmarks();
