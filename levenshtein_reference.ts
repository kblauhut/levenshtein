// Basic levenshtein implementation used as reference in fuzz tests
export function levenshteinReference(source: string, target: string): number {
  const sourceLen = source.length;
  const targetLen = target.length;

  // Handle edge cases
  if (sourceLen === 0) return targetLen;
  if (targetLen === 0) return sourceLen;

  // Create a matrix to store distances
  const matrix: number[][] = Array(sourceLen + 1)
    .fill(null)
    .map(() => Array(targetLen + 1).fill(0));

  // Initialize first column (deletions from source)
  for (let i = 0; i <= sourceLen; i++) {
    matrix[i][0] = i;
  }

  // Initialize first row (insertions to match target)
  for (let j = 0; j <= targetLen; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= sourceLen; i++) {
    for (let j = 1; j <= targetLen; j++) {
      const cost = source[i - 1] === target[j - 1] ? 0 : 1;

      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost, // substitution
      );
    }
  }

  return matrix[sourceLen][targetLen];
}
