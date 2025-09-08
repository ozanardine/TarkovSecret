/**
 * Converts a number to Roman numerals
 * @param num - The number to convert (1-10)
 * @returns The Roman numeral representation
 */
export function toRomanNumeral(num: number): string {
  const romanNumerals: { [key: number]: string } = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X'
  };

  return romanNumerals[num] || num.toString();
}

/**
 * Converts Roman numerals back to numbers
 * @param roman - The Roman numeral to convert
 * @returns The numeric representation
 */
export function fromRomanNumeral(roman: string): number {
  const numeralValues: { [key: string]: number } = {
    'I': 1,
    'II': 2,
    'III': 3,
    'IV': 4,
    'V': 5,
    'VI': 6,
    'VII': 7,
    'VIII': 8,
    'IX': 9,
    'X': 10
  };

  return numeralValues[roman] || parseInt(roman, 10) || 0;
}